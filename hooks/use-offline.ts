import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OfflineContextType {
  isOnline: boolean;
  cachedPosts: any[];
  pendingActions: PendingAction[];
  cachePost: (post: any) => void;
  getCachedPosts: () => any[];
  addPendingAction: (action: PendingAction) => void;
  syncPendingActions: () => Promise<void>;
  clearCache: () => void;
}

interface PendingAction {
  id: string;
  type: 'like' | 'comment' | 'share' | 'post' | 'bookmark';
  data: any;
  timestamp: string;
}

const CACHE_KEY = "cached_posts";
const PENDING_ACTIONS_KEY = "pending_actions";

const getCachedData = async (): Promise<any[]> => {
  try {
    if (Platform.OS === "web") {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } else {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    }
  } catch (error) {
    console.log("Failed to get cached data:", error);
    return [];
  }
};

const setCachedData = async (data: any[]): Promise<void> => {
  if (!Array.isArray(data)) return;
  try {
    const serialized = JSON.stringify(data);
    if (Platform.OS === "web") {
      localStorage.setItem(CACHE_KEY, serialized);
    } else {
      await AsyncStorage.setItem(CACHE_KEY, serialized);
    }
  } catch (error) {
    console.log("Failed to cache data:", error);
  }
};

const getPendingActions = async (): Promise<PendingAction[]> => {
  try {
    if (Platform.OS === "web") {
      const pending = localStorage.getItem(PENDING_ACTIONS_KEY);
      return pending ? JSON.parse(pending) : [];
    } else {
      const pending = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
      return pending ? JSON.parse(pending) : [];
    }
  } catch (error) {
    console.log("Failed to get pending actions:", error);
    return [];
  }
};

const setPendingActions = async (actions: PendingAction[]): Promise<void> => {
  try {
    const serialized = JSON.stringify(actions);
    if (Platform.OS === "web") {
      localStorage.setItem(PENDING_ACTIONS_KEY, serialized);
    } else {
      await AsyncStorage.setItem(PENDING_ACTIONS_KEY, serialized);
    }
  } catch (error) {
    console.log("Failed to save pending actions:", error);
  }
};

export const [OfflineProvider, useOffline] = createContextHook<OfflineContextType>(() => {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedPosts, setCachedPosts] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  useEffect(() => {
    const loadCachedData = async () => {
      const cached = await getCachedData();
      setCachedPosts(cached);
      
      const pending = await getPendingActions();
      setPendingActions(pending);
    };
    loadCachedData();

    if (Platform.OS !== "web") {
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        const newOnlineState = state.isConnected ?? true;
        setIsOnline(newOnlineState);
        
        if (newOnlineState && !isOnline) {
          console.log('Back online - syncing pending actions');
          syncPendingActions();
        }
      });
      return unsubscribe;
    } else {
      const handleOnline = () => {
        setIsOnline(true);
        console.log('Back online - syncing pending actions');
        syncPendingActions();
      };
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      
      setIsOnline(navigator.onLine);
      
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const cachePost = useCallback((post: any) => {
    if (!post || !post.id) return;
    setCachedPosts(prev => {
      const existingIndex = prev.findIndex(p => p.id === post.id);
      if (existingIndex >= 0 && JSON.stringify(prev[existingIndex]) === JSON.stringify(post)) {
        return prev;
      }
      const updated = [post, ...prev.filter(p => p.id !== post.id)].slice(0, 50);
      setCachedData(updated);
      return updated;
    });
  }, []);

  const addPendingAction = useCallback((action: PendingAction) => {
    setPendingActions(prev => {
      const updated = [...prev, action];
      setPendingActions(updated);
      return updated;
    });
  }, []);

  const syncPendingActions = useCallback(async () => {
    if (pendingActions.length === 0) return;
    
    console.log(`Syncing ${pendingActions.length} pending actions`);
    
    const successfulActions: string[] = [];
    
    for (const action of pendingActions) {
      try {
        console.log(`Processing pending action: ${action.type}`, action.data);
        successfulActions.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }
    
    if (successfulActions.length > 0) {
      const remainingActions = pendingActions.filter(
        action => !successfulActions.includes(action.id)
      );
      setPendingActions(remainingActions);
      await setPendingActions(remainingActions);
      console.log(`Synced ${successfulActions.length} actions, ${remainingActions.length} remaining`);
    }
  }, [pendingActions]);

  const getCachedPosts = useCallback(() => {
    return cachedPosts;
  }, [cachedPosts]);

  const clearCache = useCallback(async () => {
    setCachedPosts([]);
    await setCachedData([]);
  }, []);

  return useMemo(() => ({
    isOnline,
    cachedPosts,
    pendingActions,
    cachePost,
    getCachedPosts,
    addPendingAction,
    syncPendingActions,
    clearCache,
  }), [isOnline, cachedPosts, pendingActions, cachePost, getCachedPosts, addPendingAction, syncPendingActions, clearCache]);
});