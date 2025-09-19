import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { trpc, trpcClient } from "@/lib/trpc";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
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
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  completeProfile: (data: { name: string; username: string; bio: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = "auth_token";

const getStoredToken = async (): Promise<string | null> => {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
};

const storeToken = async (token: string): Promise<void> => {
  if (!token?.trim()) return;
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

const removeToken = async (): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const completeProfileMutation = trpc.auth.completeProfile.useMutation();


  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log('Loading stored auth...');
        const storedToken = await getStoredToken();
        console.log('Stored token:', storedToken ? 'Found' : 'Not found');
        
        if (storedToken?.trim()) {
          setToken(storedToken);
          console.log('Verifying token with server...');
          // Use trpc client directly for initial auth check
          const userData = await trpcClient.auth.me.query();
          console.log('User data loaded:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.log("Failed to load stored auth:", error);
        // Only clear token if it's an auth error, not a network error
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
            console.log('Clearing invalid token');
            await removeToken();
            setToken(null);
            setUser(null);
          } else {
            console.log('Network error during auth check, keeping token for retry');
          }
        } else {
          console.log('Unknown error during auth check, clearing token');
          await removeToken();
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
        console.log('Auth loading complete');
      }
    };

    loadStoredAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) throw new Error("Invalid credentials");
    try {
      console.log('Attempting login for:', email);
      const response = await loginMutation.mutateAsync({ email, password });
      console.log('Login successful, storing token');
      setToken(response.token);
      setUser(response.user);
      await storeToken(response.token);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error?.message?.includes('HTML instead of JSON')) {
        throw new Error('Server configuration error. The backend may not be running properly. Please contact support.');
      }
      
      if (error?.message?.includes('Network error') || error?.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      
      if (error?.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }
      
      if (error?.data?.code === 'UNAUTHORIZED') {
        throw new Error('Invalid email or password. Please try again.');
      }
      
      if (error?.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }, [loginMutation]);

  const register = useCallback(async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) throw new Error("Invalid credentials");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    try {
      console.log('Attempting registration for:', email);
      const response = await registerMutation.mutateAsync({ email, password });
      console.log('Registration successful, storing token');
      setToken(response.token);
      setUser(response.user);
      await storeToken(response.token);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error?.message?.includes('HTML instead of JSON')) {
        throw new Error('Server configuration error. The backend may not be running properly. Please contact support.');
      }
      
      if (error?.message?.includes('Network error') || error?.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      
      if (error?.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }
      
      if (error?.data?.code === 'CONFLICT') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }
      
      if (error?.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  }, [registerMutation]);

  const completeProfile = useCallback(async (data: { name: string; username: string; bio: string; avatar?: string }) => {
    if (!data.name?.trim() || !data.username?.trim() || !data.bio?.trim()) {
      throw new Error("All fields are required");
    }
    if (!token) {
      throw new Error("Authentication required");
    }
    try {
      const response = await completeProfileMutation.mutateAsync(data);
      setUser(response.user);
    } catch (error: any) {
      console.error('Profile completion error:', error);
      if (error?.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to complete profile. Please try again.');
    }
  }, [completeProfileMutation, token]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await removeToken();
  }, []);

  return useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    completeProfile,
    logout,
  }), [user, token, isLoading, login, register, completeProfile, logout]);
});