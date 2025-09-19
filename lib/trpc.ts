import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Development fallback - try multiple sources
  if (__DEV__) {
    // For web development
    if (Platform.OS === 'web') {
      // Try to use the current origin, but fallback to tunnel URL if needed
      try {
        return window.location.origin;
      } catch {
        return "https://l1v04hq0ysnd54scxcbqm.rork.com";
      }
    }
    // For mobile development - use the tunnel URL from the start script
    return "https://l1v04hq0ysnd54scxcbqm.rork.com";
  }

  // Production fallback
  return "https://l1v04hq0ysnd54scxcbqm.rork.com";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          if (!url || typeof url !== 'string' || !url.trim()) {
            throw new Error('Invalid URL provided');
          }
          
          console.log('Making tRPC request to:', url);
          console.log('Base URL:', getBaseUrl());
          
          // Get auth token
          let token = null;
          try {
            if (Platform.OS === "web") {
              token = localStorage.getItem("auth_token");
            } else {
              token = await SecureStore.getItemAsync("auth_token");
            }
          } catch (error) {
            console.log('Token retrieval error:', error);
          }
          
          const headers = {
            ...options?.headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          };
          
          console.log('Request headers:', { ...headers, Authorization: token ? 'Bearer [REDACTED]' : 'None' });
          
          // Add timeout and better error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          console.log(`Response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            let errorText = '';
            try {
              errorText = await response.text();
            } catch {
              errorText = 'Unable to read error response';
            }
            console.error(`HTTP ${response.status}: ${response.statusText}`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('Network request failed:', error);
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error('Request timeout - please check your connection');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
              throw new Error('Network error - please check your internet connection and try again');
            }
          }
          throw error;
        }
      },
    }),
  ],
});