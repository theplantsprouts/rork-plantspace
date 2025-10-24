import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your .env file.');
}

// Custom storage adapter for Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  profiles?: Profile;
}

// Helper functions
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message);
  }
  
  return data;
};

export const createProfile = async (userId: string, email: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    throw new Error(error.message);
  }
  
  return data;
};

export const getPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        id,
        name,
        username,
        avatar
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  
  return data || [];
};

export const createPost = async (content: string, image?: string): Promise<Post | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
    })
    .select(`
      *,
      profiles (
        id,
        name,
        username,
        avatar
      )
    `)
    .single();
  
  if (error) {
    console.error('Error creating post:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Upload image to Supabase storage
export const uploadImage = async (uri: string, bucket: string = 'images'): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Generate unique filename
    const fileExt = uri.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // For web, convert data URI to blob
    let fileData;
    if (Platform.OS === 'web' && uri.startsWith('data:')) {
      const response = await fetch(uri);
      fileData = await response.blob();
    } else {
      // For mobile, read file as binary
      const response = await fetch(uri);
      fileData = await response.blob();
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileData, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(error.message);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};