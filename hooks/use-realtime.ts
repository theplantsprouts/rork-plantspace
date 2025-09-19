import { useState, useEffect, useCallback } from 'react';
import { subscribeToAllPosts, subscribeToUserPosts, Post } from '@/lib/firebase';
import { trackError } from '@/lib/analytics';

export const useRealTimePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time posts listener');
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAllPosts((newPosts) => {
      console.log('Received real-time posts update:', newPosts.length);
      setPosts(newPosts);
      setLoading(false);
    });

    // Handle potential errors
    const errorHandler = (err: any) => {
      console.error('Real-time posts error:', err);
      setError(err.message || 'Failed to load posts');
      setLoading(false);
      trackError('realtime_posts_error', err.message || 'Unknown error');
    };

    // Set up error handling
    const timeoutId = setTimeout(() => {
      if (loading) {
        errorHandler(new Error('Real-time connection timeout'));
      }
    }, 10000);

    return () => {
      console.log('Cleaning up real-time posts listener');
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return {
    posts,
    loading,
    error,
    refresh,
  };
};

export const useRealTimeUserPosts = (userId: string | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    console.log('Setting up real-time user posts listener for:', userId);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserPosts(userId, (newPosts) => {
      console.log('Received real-time user posts update:', newPosts.length);
      setPosts(newPosts);
      setLoading(false);
    });

    // Handle potential errors
    const errorHandler = (err: any) => {
      console.error('Real-time user posts error:', err);
      setError(err.message || 'Failed to load user posts');
      setLoading(false);
      trackError('realtime_user_posts_error', err.message || 'Unknown error', { userId });
    };

    // Set up error handling
    const timeoutId = setTimeout(() => {
      if (loading) {
        errorHandler(new Error('Real-time connection timeout'));
      }
    }, 10000);

    return () => {
      console.log('Cleaning up real-time user posts listener');
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return {
    posts,
    loading,
    error,
    refresh,
  };
};

// Hook for real-time connection status
export const useRealTimeConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simple connection monitoring
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (connected) {
      setLastUpdate(new Date());
    }
  }, []);

  return {
    isConnected,
    lastUpdate,
    updateConnectionStatus,
  };
};