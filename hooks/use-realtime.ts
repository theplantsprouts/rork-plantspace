import { useState, useEffect, useCallback } from 'react';
import { subscribeToAllPosts, subscribeToUserPosts, Post, auth } from '@/lib/firebase';
import { trackError } from '@/lib/analytics';
import { onAuthStateChanged, User } from 'firebase/auth';

export const useRealTimePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;
    let retryCount = 0;
    const maxRetries = 3;

    const setupListener = (user: User) => {
      if (!isActive || !user) return;
      
      console.log('Setting up real-time posts listener for authenticated user');
      setLoading(true);
      setError(null);

      try {
        unsubscribe = subscribeToAllPosts(
          (newPosts) => {
            if (!isActive) return;
            console.log('Received real-time posts update:', newPosts.length);
            setPosts(newPosts);
            setLoading(false);
            retryCount = 0; // Reset retry count on success
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          },
          (error) => {
            if (!isActive) return;
            console.error('Real-time posts subscription error:', error);
            
            if (error.code === 'permission-denied') {
              setError('Authentication required - please log in again');
              retryCount = maxRetries; // Don't retry permission errors
            } else if (error.code === 'unavailable') {
              setError('Connection lost - retrying...');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  if (isActive && currentUser) {
                    setupListener(currentUser);
                  }
                }, 5000 * retryCount); // Exponential backoff
              } else {
                setError('Unable to connect. Please check your internet connection.');
              }
            } else {
              setError('Connection error - retrying...');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  if (isActive && currentUser) {
                    setupListener(currentUser);
                  }
                }, 3000 * retryCount);
              } else {
                setError('Connection failed. Please refresh the app.');
              }
            }
            
            setLoading(false);
            trackError('realtime_posts_error', error.message || 'Unknown error');
          }
        );

        // Set up timeout for initial connection (increased to 15 seconds)
        timeoutId = setTimeout(() => {
          if (isActive && loading) {
            console.error('Real-time connection timeout');
            setError('Connection timeout - retrying...');
            setLoading(false);
            trackError('realtime_posts_timeout', 'Connection timeout');
            
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(() => {
                if (isActive && currentUser) {
                  setupListener(currentUser);
                }
              }, 3000);
            }
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
      if (!isActive) return;
      
      setCurrentUser(user);
      
      if (user) {
        console.log('User authenticated, setting up real-time listener');
        // Add a small delay to ensure Firebase auth token is ready
        setTimeout(() => {
          if (isActive) {
            setupListener(user);
          }
        }, 1000);
      } else {
        console.log('User not authenticated');
        setError('Please log in to view posts');
        setLoading(false);
        setPosts([]);
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      }
    });

    return () => {
      isActive = false;
      console.log('Cleaning up real-time posts listener');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;
    let retryCount = 0;
    const maxRetries = 3;

    const setupListener = (user: User) => {
      if (!isActive || !user) return;
      
      console.log('Setting up real-time user posts listener for:', userId);
      setLoading(true);
      setError(null);

      try {
        unsubscribe = subscribeToUserPosts(
          userId,
          (newPosts) => {
            if (!isActive) return;
            console.log('Received real-time user posts update:', newPosts.length);
            setPosts(newPosts);
            setLoading(false);
            retryCount = 0;
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          },
          (error) => {
            if (!isActive) return;
            console.error('Real-time user posts subscription error:', error);
            
            if (error.code === 'permission-denied') {
              setError('Authentication required - please log in again');
              retryCount = maxRetries;
            } else if (error.code === 'unavailable') {
              setError('Connection lost - retrying...');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  if (isActive && currentUser) {
                    setupListener(currentUser);
                  }
                }, 5000 * retryCount);
              } else {
                setError('Unable to connect. Please check your internet connection.');
              }
            } else {
              setError('Connection error - retrying...');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  if (isActive && currentUser) {
                    setupListener(currentUser);
                  }
                }, 3000 * retryCount);
              } else {
                setError('Connection failed. Please refresh the app.');
              }
            }
            
            setLoading(false);
            trackError('realtime_user_posts_error', error.message || 'Unknown error', { userId });
          }
        );

        // Set up timeout for initial connection
        timeoutId = setTimeout(() => {
          if (isActive && loading) {
            console.error('Real-time user posts connection timeout');
            setError('Connection timeout - retrying...');
            setLoading(false);
            trackError('realtime_user_posts_timeout', 'Connection timeout', { userId });
            
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(() => {
                if (isActive && currentUser) {
                  setupListener(currentUser);
                }
              }, 3000);
            }
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
      if (!isActive) return;
      
      setCurrentUser(user);
      
      if (user) {
        console.log('User authenticated, setting up real-time user posts listener');
        setTimeout(() => {
          if (isActive) {
            setupListener(user);
          }
        }, 1000);
      } else {
        console.log('User not authenticated');
        setError('Please log in to view posts');
        setLoading(false);
        setPosts([]);
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      }
    });

    return () => {
      isActive = false;
      console.log('Cleaning up real-time user posts listener');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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