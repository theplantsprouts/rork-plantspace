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

  // Fallback for development - use the tunnel URL from the start script
  if (__DEV__) {
    // This should match the tunnel URL from your development server
    return "https://l1v04hq0ysnd54scxcbqm.rork.com";
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
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
            ...(token && { Authorization: `Bearer ${token}` }),
          };
          
          console.log('Request headers:', { ...headers, Authorization: token ? 'Bearer [REDACTED]' : 'None' });
          
          const response = await fetch(url, {
            ...options,
            headers,
          });
          
          console.log(`Response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP ${response.status}: ${response.statusText}`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('Network request failed:', error);
          throw error;
        }
      },
    }),
  ],
});