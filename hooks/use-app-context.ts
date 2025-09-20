import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { User, useAuth } from './use-auth';

const storage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.setItem(key, value);
  },
};

interface AppState {
  currentUser: User | null;
  followedUsers: number[];
  searchHistory: string[];
  notifications: any[];
  unreadNotifications: number;
}



export const [AppProvider, useAppContext] = createContextHook(() => {
  const { user: authUser } = useAuth();
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    followedUsers: [],
    searchHistory: [],
    notifications: [],
    unreadNotifications: 0,
  });

  // Update currentUser when auth user changes
  useEffect(() => {
    setAppState(prev => ({ ...prev, currentUser: authUser }));
  }, [authUser]);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const storedState = await storage.getItem('appState');
        if (storedState) {
          const parsed = JSON.parse(storedState);
          // Don't override currentUser from storage, use auth user instead
          const { currentUser, ...otherState } = parsed;
          setAppState(prev => ({ ...prev, ...otherState }));
        }
      } catch (error) {
        console.log('Error loading app state:', error);
      }
    };

    loadAppState();
  }, []);



  const followUser = useCallback((userId: number) => {
    setAppState(prevState => {
      const newFollowedUsers = [...prevState.followedUsers, userId];
      const updatedState = { ...prevState, followedUsers: newFollowedUsers };
      storage.setItem('appState', JSON.stringify(updatedState)).catch(error => {
        console.log('Error saving app state:', error);
      });
      return updatedState;
    });
  }, []);

  const unfollowUser = useCallback((userId: number) => {
    setAppState(prevState => {
      const newFollowedUsers = prevState.followedUsers.filter(id => id !== userId);
      const updatedState = { ...prevState, followedUsers: newFollowedUsers };
      storage.setItem('appState', JSON.stringify(updatedState)).catch(error => {
        console.log('Error saving app state:', error);
      });
      return updatedState;
    });
  }, []);

  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setAppState(prevState => {
      const newHistory = [query, ...prevState.searchHistory.filter(h => h !== query)].slice(0, 10);
      const updatedState = { ...prevState, searchHistory: newHistory };
      storage.setItem('appState', JSON.stringify(updatedState)).catch(error => {
        console.log('Error saving app state:', error);
      });
      return updatedState;
    });
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setAppState(prevState => {
      const updatedState = { ...prevState, unreadNotifications: 0 };
      storage.setItem('appState', JSON.stringify(updatedState)).catch(error => {
        console.log('Error saving app state:', error);
      });
      return updatedState;
    });
  }, []);

  const addNotification = useCallback((notification: any) => {
    setAppState(prevState => {
      const newNotifications = [notification, ...prevState.notifications].slice(0, 50);
      const updatedState = { 
        ...prevState,
        notifications: newNotifications,
        unreadNotifications: prevState.unreadNotifications + 1
      };
      storage.setItem('appState', JSON.stringify(updatedState)).catch(error => {
        console.log('Error saving app state:', error);
      });
      return updatedState;
    });
  }, []);

  const isFollowing = useCallback((userId: number) => {
    return appState.followedUsers.includes(userId);
  }, [appState.followedUsers]);

  return useMemo(() => ({
    ...appState,
    followUser,
    unfollowUser,
    addToSearchHistory,
    markNotificationsAsRead,
    addNotification,
    isFollowing,
  }), [appState, followUser, unfollowUser, addToSearchHistory, markNotificationsAsRead, addNotification, isFollowing]);
});