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

// Test connection function
export const testConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const baseUrl = getBaseUrl();
    console.log('Testing connection to:', baseUrl);
    
    // Test basic API endpoint first
    const response = await fetch(`${baseUrl}/api`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API test response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.log('API test response text:', text);
      return {
        success: false,
        message: `API endpoint returned ${response.status}: ${response.statusText}`,
        details: { status: response.status, text }
      };
    }
    
    const data = await response.json();
    console.log('API test response data:', data);
    
    // Test tRPC endpoint
    try {
      const trpcResponse = await fetch(`${baseUrl}/api/trpc/example.hi`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      console.log('tRPC test response status:', trpcResponse.status);
      
      if (trpcResponse.ok) {
        const trpcData = await trpcResponse.json();
        console.log('tRPC test response data:', trpcData);
        return {
          success: true,
          message: 'Connection successful',
          details: { api: data, trpc: trpcData }
        };
      } else {
        const trpcText = await trpcResponse.text();
        console.log('tRPC test response text:', trpcText);
        return {
          success: false,
          message: `tRPC endpoint returned ${trpcResponse.status}: ${trpcResponse.statusText}`,
          details: { api: data, trpcStatus: trpcResponse.status, trpcText }
        };
      }
    } catch (trpcError) {
      console.log('tRPC test error:', trpcError);
      return {
        success: false,
        message: 'API endpoint works but tRPC failed',
        details: { api: data, trpcError: trpcError instanceof Error ? trpcError.message : String(trpcError) }
      };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
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
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
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
              console.error(`HTTP ${response.status} response body:`, errorText);
              
              // Check if we're getting HTML instead of JSON (common server error)
              if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
                throw new Error(`Server returned HTML instead of JSON. This usually means the API endpoint is not found or the server is not running properly.`);
              }
            } catch (readError) {
              console.error('Failed to read error response:', readError);
              errorText = 'Unable to read error response';
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
          }
          
          // Validate that we're getting JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response received:', { contentType, text });
            if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
              throw new Error('Server returned HTML instead of JSON. The API endpoint may not be configured correctly.');
            }
            throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
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
            // Pass through our custom error messages
            if (error.message.includes('HTML instead of JSON') || error.message.includes('API endpoint')) {
              throw error;
            }
          }
          throw error;
        }
      },
    }),
  ],
});