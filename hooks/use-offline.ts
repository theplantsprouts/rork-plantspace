import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

interface OfflineContextType {
  isOnline: boolean;
  cachedPosts: any[];
  cachePost: (post: any) => void;
  getCachedPosts: () => any[];
  clearCache: () => void;
}

const CACHE_KEY = "cached_posts";

const getCachedData = (): any[] => {
  try {
    if (Platform.OS === "web") {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    }
    // For mobile, we'll use AsyncStorage through the provider
    return [];
  } catch (error) {
    console.log("Failed to get cached data:", error);
    return [];
  }
};

const setCachedData = (data: any[]): void => {
  if (!Array.isArray(data)) return;
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }
    // For mobile, we'll handle this in the provider
  } catch (error) {
    console.log("Failed to cache data:", error);
  }
};

export const [OfflineProvider, useOffline] = createContextHook<OfflineContextType>(() => {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedPosts, setCachedPosts] = useState<any[]>([]);

  useEffect(() => {
    // Load cached data on mount
    const cached = getCachedData();
    setCachedPosts(cached);

    // Set up network listener
    if (Platform.OS !== "web") {
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        setIsOnline(state.isConnected ?? true);
      });
      return unsubscribe;
    } else {
      // Web network detection
      const handleOnline = () => setIsOnline(true);
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
    setCachedPosts(prev => {
      const updated = [post, ...prev.filter(p => p.id !== post.id)];
      setCachedData(updated);
      return updated;
    });
  }, []);

  const getCachedPosts = useCallback(() => {
    return cachedPosts;
  }, [cachedPosts]);

  const clearCache = useCallback(() => {
    setCachedPosts([]);
    setCachedData([]);
  }, []);

  return useMemo(() => ({
    isOnline,
    cachedPosts,
    cachePost,
    getCachedPosts,
    clearCache,
  }), [isOnline, cachedPosts, cachePost, getCachedPosts, clearCache]);
});