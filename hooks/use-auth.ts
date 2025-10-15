import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { validateEmail, validatePassword, sanitizeEmail } from '@/lib/validation';
import { mapFirebaseError } from '@/lib/error-handler';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { trackUserLogin, trackUserSignup, trackUserLogout, trackProfileUpdated } from '@/lib/analytics';

export interface User {
  id: string;
  email: string;
  created_at: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  return !!(user.name && user.username && user.bio);
};

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ needsVerification?: boolean } | void>;
  completeProfile: (data: { name: string; username: string; bio: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
}



export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firebaseUserRef = useRef<FirebaseUser | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    firebaseUserRef.current = firebaseUser;
  }, [firebaseUser]);


  const getProfile = async (userId: string): Promise<User | null> => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email || '',
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          name: data.name,
          username: data.username,
          bio: data.bio,
          avatar: data.avatar,
          followers: data.followers || 0,
          following: data.following || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  };

  const createProfile = async (userId: string, email: string, retryCount: number = 0): Promise<User> => {
    const maxRetries = 2;
    
    try {
      console.log(`Creating profile for user: ${userId} (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Ensure we have a valid auth token
      const user = auth.currentUser;
      if (!user || user.uid !== userId) {
        throw new Error('User not authenticated or UID mismatch');
      }
      
      // Get a fresh auth token to ensure it's valid
      console.log('Getting fresh auth token...');
      const token = await user.getIdToken(true);
      console.log('Auth token obtained, length:', token.length);
      
      // Progressive delay based on retry count
      const delay = Math.min(1500 * Math.pow(2, retryCount), 5000);
      console.log(`Waiting ${delay}ms for token propagation...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const profileData = {
        email,
        created_at: serverTimestamp(),
        followers: 0,
        following: 0,
      };
      
      console.log('Creating profile document with data:', profileData);
      await setDoc(doc(db, 'profiles', userId), profileData);
      
      console.log('Profile created successfully for user:', userId);
      
      return {
        id: userId,
        email,
        created_at: new Date().toISOString(),
        followers: 0,
        following: 0,
      };
      
    } catch (error: any) {
      console.error(`Profile creation attempt ${retryCount + 1} failed:`, error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied' && retryCount < maxRetries - 1) {
        console.log(`Permission denied, retrying in ${1500 * (retryCount + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1500 * (retryCount + 1)));
        return createProfile(userId, email, retryCount + 1);
      }
      
      if (retryCount >= maxRetries - 1) {
        console.error('All profile creation attempts failed');
        throw new Error('Failed to create profile after multiple attempts. Please try logging out and back in.');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please try logging out and back in, or contact support if the issue persists.');
      }
      
      throw new Error(`Failed to create profile: ${error.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('Initializing Firebase auth...');
    
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', currentFirebaseUser ? `signed in (${currentFirebaseUser.uid})` : 'signed out');
      
      if (currentFirebaseUser) {
        setFirebaseUser(currentFirebaseUser);
        
        try {
          // Wait for auth token to be ready
          console.log('Waiting for auth token to be ready...');
          const token = await currentFirebaseUser.getIdToken();
          console.log('Auth token obtained, length:', token.length);
          
          // Get or create profile
          let profile = await getProfile(currentFirebaseUser.uid);
          if (!profile) {
            console.log('No existing profile found, creating new profile for user:', currentFirebaseUser.uid);
            try {
              profile = await createProfile(currentFirebaseUser.uid, currentFirebaseUser.email || '');
              console.log('Profile created successfully');
            } catch (createError: any) {
              console.error('Profile creation failed:', createError);
              
              // If profile creation fails, we still want to set the Firebase user
              // but show an error state that allows retry
              if (mounted) {
                setUser(null);
                setIsLoading(false);
              }
              return;
            }
          } else {
            console.log('Existing profile found for user:', currentFirebaseUser.uid);
          }
          
          if (profile && mounted) {
            console.log('Setting user profile:', {
              id: profile.id,
              email: profile.email,
              hasName: !!profile.name,
              hasUsername: !!profile.username,
              hasBio: !!profile.bio
            });
            setUser(profile);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // Don't throw the error, just log it and continue
          // The user will be prompted to try again or logout/login
          if (mounted) {
            setUser(null); // Clear user state on error
            setIsLoading(false);
          }
          return;
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Please enter both email and password");
    }
    
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    
    try {
      console.log('Attempting login with Firebase for:', sanitizedEmail);
      
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      
      console.log('Login successful with Firebase');
      
      // Track login event
      trackUserLogin('email');
      
      // The auth state change listener will handle setting the user
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      throw new Error(mapFirebaseError(error));
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Please enter both email and password");
    }
    
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || "Invalid password");
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    
    try {
      console.log('Attempting registration with Firebase for:', sanitizedEmail);
      
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      
      console.log('Registration successful with Firebase');
      console.log('User created:', userCredential.user.uid);
      
      // Track signup event
      trackUserSignup('email');
      
      // Register for push notifications (non-blocking)
      registerForPushNotificationsAsync(userCredential.user.uid).catch((error) => {
        console.log('Push notification registration failed (non-blocking):', error);
      });
      
      // Send email verification
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        console.log('Email verification sent');
        return { needsVerification: true };
      }
      
      // The auth state change listener will handle setting the user
    } catch (error: any) {
      console.error('Registration error:', error);
      
      throw new Error(mapFirebaseError(error));
    }
  }, []);



  const completeProfile = useCallback(async (data: { name: string; username: string; bio: string; avatar?: string }) => {
    if (!data.name?.trim() || !data.username?.trim() || !data.bio?.trim()) {
      throw new Error("All fields are required");
    }
    
    const currentFirebaseUser = firebaseUserRef.current;
    if (!currentFirebaseUser) {
      throw new Error("Authentication required");
    }
    
    try {
      console.log('Updating profile with Firebase for user:', currentFirebaseUser.uid);
      console.log('Profile data:', { name: data.name, username: data.username, bio: data.bio, hasAvatar: !!data.avatar });
      
      // Ensure auth token is ready
      await currentFirebaseUser.getIdToken(true);
      console.log('Auth token verified for profile update');
      
      const profileRef = doc(db, 'profiles', currentFirebaseUser.uid);
      
      // Filter out undefined values to avoid Firebase errors
      const updateData: any = {
        name: data.name.trim(),
        username: data.username.trim(),
        bio: data.bio.trim(),
        updated_at: serverTimestamp(),
      };
      
      // Only include avatar if it has a value
      if (data.avatar && data.avatar.trim()) {
        updateData.avatar = data.avatar.trim();
      }
      
      console.log('Sending update to Firestore with data:', updateData);
      await updateDoc(profileRef, updateData);
      console.log('Firestore update completed successfully');
      
      // Wait a bit for Firestore to process the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state immediately with the new data
      const updatedProfile = await getProfile(currentFirebaseUser.uid);
      if (updatedProfile) {
        console.log('Profile updated successfully, setting new user state:', {
          id: updatedProfile.id,
          name: updatedProfile.name,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          isComplete: isProfileComplete(updatedProfile)
        });
        setUser(updatedProfile);
        
        // Verify profile completion
        const profileComplete = isProfileComplete(updatedProfile);
        console.log('Profile completion check result:', profileComplete);
        
        if (!profileComplete) {
          console.error('Profile completion check failed after update');
          throw new Error('Profile completion verification failed');
        }
      } else {
        console.error('Failed to fetch updated profile after completion');
        throw new Error('Failed to verify profile completion');
      }
      
      // Track profile update
      trackProfileUpdated(['name', 'username', 'bio', ...(data.avatar ? ['avatar'] : [])]);
      
      console.log('Profile completion successful!');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      throw new Error(mapFirebaseError(error));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Signing out from Firebase');
      
      // Track logout event
      trackUserLogout();
      
      await signOut(auth);
      
      // Clear local state (auth state change listener will also handle this)
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails
      setUser(null);
      setFirebaseUser(null);
    }
  }, []);

  return useMemo(() => ({
    user,
    firebaseUser,
    isLoading,
    login,
    register,
    completeProfile,
    logout,
  }), [user, firebaseUser, isLoading, login, register, completeProfile, logout]);
});