import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Platform } from "react-native";
import { supabase, getProfile, createProfile, updateProfile, type Profile } from "@/lib/supabase";
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

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
  register: (email: string, password: string) => Promise<void>;
  completeProfile: (data: { name: string; username: string; bio: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
}



export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseUserRef = useRef<SupabaseUser | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    supabaseUserRef.current = supabaseUser;
  }, [supabaseUser]);


  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing Supabase auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user && mounted) {
          console.log('Found existing session');
          setSupabaseUser(session.user);
          
          // Get or create profile
          let profile = await getProfile(session.user.id);
          if (!profile) {
            console.log('Creating new profile for user');
            profile = await createProfile(session.user.id, session.user.email || '');
          }
          
          if (profile && mounted) {
            setUser({
              id: profile.id,
              email: profile.email,
              created_at: profile.created_at,
              name: profile.name,
              username: profile.username,
              bio: profile.bio,
              avatar: profile.avatar,
              followers: profile.followers || 0,
              following: profile.following || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user);
          
          // Get or create profile
          let profile = await getProfile(session.user.id);
          if (!profile) {
            profile = await createProfile(session.user.id, session.user.email || '');
          }
          
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              created_at: profile.created_at,
              name: profile.name,
              username: profile.username,
              bio: profile.bio,
              avatar: profile.avatar,
              followers: profile.followers || 0,
              following: profile.following || 0,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null);
          setUser(null);
        }
      }
    );
    
    initializeAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Please enter both email and password");
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("Please enter a valid email address");
    }
    
    try {
      console.log('Attempting login with Supabase for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Supabase login error:', error);
        
        // Handle specific Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        }
        
        if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }
        
        throw new Error(error.message || 'Login failed. Please try again.');
      }
      
      if (!data.user) {
        throw new Error('Login failed. Please try again.');
      }
      
      console.log('Login successful with Supabase');
      
      // The auth state change listener will handle setting the user
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Pass through our custom error messages
      if (error?.message?.includes('valid email') || 
          error?.message?.includes('credentials') ||
          error?.message?.includes('confirmation') ||
          error?.message?.includes('Too many')) {
        throw error;
      }
      
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Please enter both email and password");
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("Please enter a valid email address");
    }
    
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    
    // Password strength validation
    if (password.length > 128) {
      throw new Error("Password is too long (maximum 128 characters)");
    }
    
    try {
      console.log('Attempting registration with Supabase for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Supabase registration error:', error);
        
        // Handle specific Supabase auth errors
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        
        if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        }
        
        if (error.message.includes('Unable to validate email address')) {
          throw new Error('Please enter a valid email address.');
        }
        
        if (error.message.includes('Signup is disabled')) {
          throw new Error('Registration is currently disabled. Please contact support.');
        }
        
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
      
      if (!data.user) {
        throw new Error('Registration failed. Please try again.');
      }
      
      console.log('Registration successful with Supabase');
      
      // Check if email confirmation is required
      if (!data.session) {
        throw new Error('Please check your email and click the confirmation link to complete registration.');
      }
      
      // The auth state change listener will handle setting the user
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Pass through our custom error messages
      if (error?.message?.includes('valid email') || 
          error?.message?.includes('characters') ||
          error?.message?.includes('already exists') ||
          error?.message?.includes('confirmation') ||
          error?.message?.includes('disabled')) {
        throw error;
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  }, []);

  const completeProfile = useCallback(async (data: { name: string; username: string; bio: string; avatar?: string }) => {
    if (!data.name?.trim() || !data.username?.trim() || !data.bio?.trim()) {
      throw new Error("All fields are required");
    }
    
    const currentSupabaseUser = supabaseUserRef.current;
    if (!currentSupabaseUser) {
      throw new Error("Authentication required");
    }
    
    try {
      console.log('Updating profile with Supabase');
      
      const updatedProfile = await updateProfile(currentSupabaseUser.id, {
        name: data.name.trim(),
        username: data.username.trim(),
        bio: data.bio.trim(),
        avatar: data.avatar,
      });
      
      if (updatedProfile) {
        setUser({
          id: updatedProfile.id,
          email: updatedProfile.email,
          created_at: updatedProfile.created_at,
          name: updatedProfile.name,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatar: updatedProfile.avatar,
          followers: updatedProfile.followers || 0,
          following: updatedProfile.following || 0,
        });
      }
      
      console.log('Profile completion successful');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      
      if (error?.message?.includes('duplicate key value')) {
        throw new Error('This username is already taken. Please choose a different one.');
      }
      
      throw new Error(error?.message || 'Failed to complete profile. Please try again.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Signing out from Supabase');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear local state (auth state change listener will also handle this)
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails
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