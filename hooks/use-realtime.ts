import { useState, useEffect, useCallback } from 'react';
import { subscribeToAllPosts, subscribeToUserPosts, Post, auth } from '@/lib/firebase';
import { trackError } from '@/lib/analytics';
import { onAuthStateChanged } from 'firebase/auth';

export const useRealTimePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const setupListener = () => {
      if (!isActive) return;
      
      console.log('Setting up real-time posts listener');
      setLoading(true);
      setError(null);

      try {
        unsubscribe = subscribeToAllPosts((newPosts) => {
          if (!isActive) return;
          console.log('Received real-time posts update:', newPosts.length);
          setPosts(newPosts);
          setLoading(false);
          clearTimeout(timeoutId);
        });

        // Set up timeout for connection issues
        timeoutId = setTimeout(() => {
          if (isActive && loading) {
            console.error('Real-time connection timeout');
            setError('Connection timeout - retrying...');
            setLoading(false);
            trackError('realtime_posts_timeout', 'Connection timeout');
            
            // Retry after 3 seconds
            setTimeout(() => {
              if (isActive) {
                setupListener();
              }
            }, 3000);
          }
        }, 15000);
      } catch (err: any) {
        if (!isActive) return;
        console.error('Real-time posts error:', err);
        setError(err.message || 'Failed to load posts');
        setLoading(false);
        trackError('realtime_posts_error', err.message || 'Unknown error');
      }
    };

    // Wait for auth state before setting up listener
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isActive) {
        setupListener();
      } else if (!user && isActive) {
        setError('Authentication required');
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      console.log('Cleaning up real-time posts listener');
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
      authUnsubscribe();
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

    let unsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const setupListener = () => {
      if (!isActive) return;
      
      console.log('Setting up real-time user posts listener for:', userId);
      setLoading(true);
      setError(null);

      try {
        unsubscribe = subscribeToUserPosts(userId, (newPosts) => {
          if (!isActive) return;
          console.log('Received real-time user posts update:', newPosts.length);
          setPosts(newPosts);
          setLoading(false);
          clearTimeout(timeoutId);
        });

        // Set up timeout for connection issues
        timeoutId = setTimeout(() => {
          if (isActive && loading) {
            console.error('Real-time user posts connection timeout');
            setError('Connection timeout - retrying...');
            setLoading(false);
            trackError('realtime_user_posts_timeout', 'Connection timeout', { userId });
            
            // Retry after 3 seconds
            setTimeout(() => {
              if (isActive) {
                setupListener();
              }
            }, 3000);
          }
        }, 15000);
      } catch (err: any) {
        if (!isActive) return;
        console.error('Real-time user posts error:', err);
        setError(err.message || 'Failed to load user posts');
        setLoading(false);
        trackError('realtime_user_posts_error', err.message || 'Unknown error', { userId });
      }
    };

    // Wait for auth state before setting up listener
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isActive) {
        setupListener();
      } else if (!user && isActive) {
        setError('Authentication required');
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      console.log('Cleaning up real-time user posts listener');
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
      authUnsubscribe();
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