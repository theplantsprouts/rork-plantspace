import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, getProfile, createProfile as createSupabaseProfile, updateProfile } from "@/lib/supabase";
import { validateEmail, validatePassword, sanitizeEmail } from '@/lib/validation';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { trackUserLogin, trackUserSignup, trackUserLogout, trackProfileUpdated } from '@/lib/analytics';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ needsVerification?: boolean } | void>;
  completeProfile: (data: { name: string; username: string; bio: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const profile = await getProfile(userId);
      if (!profile) return null;

      return {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        avatar: profile.avatar,
        followers: profile.followers || 0,
        following: profile.following || 0,
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  };

  const createUserProfile = async (userId: string, email: string): Promise<User> => {
    try {
      console.log(`Creating profile for user: ${userId}`);

      const profile = await createSupabaseProfile(userId, email);

      if (!profile) {
        throw new Error('Failed to create profile');
      }

      return {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        followers: 0,
        following: 0,
      };
    } catch (error: any) {
      console.error('Profile creation error:', error);
      throw new Error(`Failed to create profile: ${error.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    let mounted = true;

    console.log('Initializing Supabase auth...');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        console.log('Session found:', session.user.id);
        setSupabaseUser(session.user);

        getUserProfile(session.user.id).then(profile => {
          if (!mounted) return;

          if (!profile) {
            console.log('No profile found, creating...');
            createUserProfile(session.user.id, session.user.email || '').then(newProfile => {
              if (mounted) {
                setUser(newProfile);
                setIsLoading(false);
              }
            }).catch(error => {
              console.error('Error creating profile:', error);
              if (mounted) {
                setIsLoading(false);
              }
            });
          } else {
            setUser(profile);
            setIsLoading(false);
          }
        });
      } else {
        console.log('No session found');
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.id);

      if (session?.user) {
        setSupabaseUser(session.user);

        const profile = await getUserProfile(session.user.id);
        if (!profile && event === 'SIGNED_IN') {
          try {
            const newProfile = await createUserProfile(session.user.id, session.user.email || '');
            if (mounted) {
              setUser(newProfile);
            }
          } catch (error) {
            console.error('Error creating profile on sign in:', error);
          }
        } else if (profile && mounted) {
          setUser(profile);
        }
      } else {
        setSupabaseUser(null);
        setUser(null);
      }

      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
      console.log('Attempting login with Supabase for:', sanitizedEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        throw error;
      }

      console.log('Login successful with Supabase');

      trackUserLogin('email');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
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
      console.log('Attempting registration with Supabase for:', sanitizedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        throw error;
      }

      console.log('Registration successful with Supabase');

      trackUserSignup('email');

      if (data.user) {
        registerForPushNotificationsAsync(data.user.id).catch((error) => {
          console.log('Push notification registration failed (non-blocking):', error);
        });
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { needsVerification: true };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }, []);

  const completeProfile = useCallback(async (data: { name: string; username: string; bio: string; avatar?: string }) => {
    if (!data.name?.trim() || !data.username?.trim() || !data.bio?.trim()) {
      throw new Error("All fields are required");
    }

    if (!supabaseUser) {
      throw new Error("Authentication required");
    }

    try {
      console.log('Updating profile with Supabase for user:', supabaseUser.id);

      const updateData: any = {
        name: data.name.trim(),
        username: data.username.trim(),
        bio: data.bio.trim(),
      };

      if (data.avatar && data.avatar.trim()) {
        updateData.avatar = data.avatar.trim();
      }

      const updatedProfile = await updateProfile(supabaseUser.id, updateData);

      if (updatedProfile) {
        const userProfile: User = {
          id: updatedProfile.id,
          email: updatedProfile.email,
          created_at: updatedProfile.created_at,
          name: updatedProfile.name,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatar: updatedProfile.avatar,
          followers: updatedProfile.followers || 0,
          following: updatedProfile.following || 0,
        };

        setUser(userProfile);

        trackProfileUpdated(['name', 'username', 'bio', ...(data.avatar ? ['avatar'] : [])]);

        console.log('Profile completion successful!');
      }
    } catch (error: any) {
      console.error('Profile completion error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }, [supabaseUser]);

  const logout = useCallback(async () => {
    try {
      console.log('Signing out from Supabase');

      trackUserLogout();

      await supabase.auth.signOut();

      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setSupabaseUser(null);
    }
  }, []);

  return useMemo(() => ({
    user,
    supabaseUser,
    isLoading,
    login,
    register,
    completeProfile,
    logout,
  }), [user, supabaseUser, isLoading, login, register, completeProfile, logout]);
});
