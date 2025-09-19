import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { User } from './use-auth';

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

const mockCurrentUser: User = {
  id: '999',
  email: 'alex@example.com',
  createdAt: new Date(),
  name: 'Alex Johnson',
  username: '@alexjohnson',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  bio: 'Digital creator & photographer 📸 Sharing moments that matter ✨ Living life one adventure at a time 🌍',
  followers: 15400,
  following: 892,
};

export const [AppProvider, useAppContext] = createContextHook(() => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    followedUsers: [],
    searchHistory: [],
    notifications: [],
    unreadNotifications: 0,
  });

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const storedState = await storage.getItem('appState');
        if (storedState) {
          const parsed = JSON.parse(storedState);
          setAppState(prev => ({ ...prev, ...parsed }));
        } else {
          setAppState(prev => ({ ...prev, currentUser: mockCurrentUser }));
        }
      } catch (error) {
        console.log('Error loading app state:', error);
        setAppState(prev => ({ ...prev, currentUser: mockCurrentUser }));
      }
    };

    loadAppState();
  }, []);

  const saveAppState = useCallback(async (newState: Partial<AppState>) => {
    try {
      const updatedState = { ...appState, ...newState };
      await storage.setItem('appState', JSON.stringify(updatedState));
      setAppState(updatedState);
    } catch (error) {
      console.log('Error saving app state:', error);
    }
  }, [appState]);

  const followUser = useCallback((userId: number) => {
    const newFollowedUsers = [...appState.followedUsers, userId];
    saveAppState({ followedUsers: newFollowedUsers });
  }, [appState.followedUsers, saveAppState]);

  const unfollowUser = useCallback((userId: number) => {
    const newFollowedUsers = appState.followedUsers.filter(id => id !== userId);
    saveAppState({ followedUsers: newFollowedUsers });
  }, [appState.followedUsers, saveAppState]);

  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...appState.searchHistory.filter(h => h !== query)].slice(0, 10);
    saveAppState({ searchHistory: newHistory });
  }, [appState.searchHistory, saveAppState]);

  const markNotificationsAsRead = useCallback(() => {
    saveAppState({ unreadNotifications: 0 });
  }, [saveAppState]);

  const addNotification = useCallback((notification: any) => {
    const newNotifications = [notification, ...appState.notifications].slice(0, 50);
    saveAppState({ 
      notifications: newNotifications,
      unreadNotifications: appState.unreadNotifications + 1
    });
  }, [appState.notifications, appState.unreadNotifications, saveAppState]);

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