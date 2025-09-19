import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Mock backend for when the real backend is not available
const createMockBackend = () => {
  // Try to load existing mock data from storage
  let mockUsers: any[] = [];
  
  const loadMockData = async () => {
    try {
      if (Platform.OS === "web") {
        const stored = localStorage.getItem('mock_users');
        if (stored) {
          mockUsers = JSON.parse(stored);
          console.log('Loaded mock users from localStorage:', mockUsers.length);
        }
      } else {
        const stored = await SecureStore.getItemAsync('mock_users');
        if (stored) {
          mockUsers = JSON.parse(stored);
          console.log('Loaded mock users from SecureStore:', mockUsers.length);
        }
      }
    } catch (error) {
      console.log('Failed to load mock data:', error);
      mockUsers = [];
    }
  };
  
  const saveMockData = async () => {
    try {
      const data = JSON.stringify(mockUsers);
      if (Platform.OS === "web") {
        localStorage.setItem('mock_users', data);
      } else {
        await SecureStore.setItemAsync('mock_users', data);
      }
      console.log('Saved mock users:', mockUsers.length);
    } catch (error) {
      console.log('Failed to save mock data:', error);
    }
  };
  
  // Load data immediately
  loadMockData();
  
  return {
    example: {
      hi: {
        mutate: async ({ name }: { name: string }) => {
          return {
            hello: name,
            date: new Date(),
          };
        },
      },
    },
    auth: {
      register: {
        mutate: async ({ email, password }: { email: string; password: string }) => {
          // Check if user exists
          const existingUser = mockUsers.find(u => u.email === email);
          if (existingUser) {
            throw new Error('User already exists with this email');
          }
          
          // Create mock user
          const user = {
            id: Math.random().toString(36).substring(2, 15),
            email,
            createdAt: new Date(),
            name: undefined,
            username: undefined,
            bio: undefined,
            avatar: undefined,
            followers: 0,
            following: 0,
          };
          
          mockUsers.push({ ...user, password });
          await saveMockData();
          
          const token = 'mock-token-' + user.id;
          
          // Store token
          if (Platform.OS === "web") {
            localStorage.setItem("auth_token", token);
          } else {
            await SecureStore.setItemAsync("auth_token", token);
          }
          
          return { token, user };
        },
      },
      login: {
        mutate: async ({ email, password }: { email: string; password: string }) => {
          const user = mockUsers.find(u => u.email === email && u.password === password);
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          const token = 'mock-token-' + user.id;
          
          // Store token
          if (Platform.OS === "web") {
            localStorage.setItem("auth_token", token);
          } else {
            await SecureStore.setItemAsync("auth_token", token);
          }
          
          const { password: _, ...userWithoutPassword } = user;
          return { token, user: userWithoutPassword };
        },
      },
      me: {
        query: async () => {
          let token;
          if (Platform.OS === "web") {
            token = localStorage.getItem("auth_token");
          } else {
            token = await SecureStore.getItemAsync("auth_token");
          }
          
          if (!token || !token.startsWith('mock-token-')) {
            throw new Error('Not authenticated');
          }
          
          const userId = token.replace('mock-token-', '');
          const user = mockUsers.find(u => u.id === userId);
          
          if (!user) {
            throw new Error('User not found');
          }
          
          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword;
        },
      },
      completeProfile: {
        mutate: async ({ name, username, bio }: { name?: string; username?: string; bio?: string }) => {
          let token;
          if (Platform.OS === "web") {
            token = localStorage.getItem("auth_token");
          } else {
            token = await SecureStore.getItemAsync("auth_token");
          }
          
          if (!token || !token.startsWith('mock-token-')) {
            throw new Error('Not authenticated');
          }
          
          const userId = token.replace('mock-token-', '');
          const userIndex = mockUsers.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            throw new Error('User not found');
          }
          
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            name,
            username,
            bio,
          };
          await saveMockData();
          
          const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
          return userWithoutPassword;
        },
      },
    },
    posts: {
      list: {
        query: async () => {
          return [];
        },
      },
      create: {
        mutate: async ({ content, image }: { content: string; image?: string }) => {
          return {
            id: Math.random().toString(36).substring(2, 15),
            content,
            image,
            createdAt: new Date(),
            author: {
              id: 'mock-user',
              name: 'Mock User',
              username: 'mockuser',
              avatar: undefined,
            },
            likes: 0,
            comments: 0,
            isLiked: false,
          };
        },
      },
      uploadImage: {
        mutate: async ({ image }: { image: string }) => {
          return {
            url: image, // Return the same image URL
          };
        },
      },
    },
  };
};

let mockBackend: any = null;
let isUsingMockBackend = false;

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Always use the Rork tunnel URL for this project
  const rorkUrl = "https://l1v04hq0ysnd54scxcbqm.rork.com";
  console.log('Using Rork backend URL:', rorkUrl);
  return rorkUrl;
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
          
          const baseUrl = getBaseUrl();
          console.log('Making tRPC request to:', url);
          console.log('Base URL:', baseUrl);
          
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
              console.error(`HTTP ${response.status} response body:`, errorText.substring(0, 500));
              
              // Check if we're getting HTML instead of JSON (common server error)
              if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
                // This is likely a 404 or server configuration issue
                if (response.status === 404) {
                  // Switch to mock backend for 404 errors
                  console.log('Backend not available, switching to mock mode');
                  if (!mockBackend) {
                    mockBackend = createMockBackend();
                    isUsingMockBackend = true;
                  }
                  throw new Error('BACKEND_UNAVAILABLE');
                } else {
                  throw new Error('Server configuration error. The backend may not be running properly.');
                }
              }
              
              // Try to parse as JSON for better error messages
              try {
                const errorData = JSON.parse(errorText);
                if (errorData.error?.message) {
                  throw new Error(errorData.error.message);
                }
              } catch (_parseError) {
                // Not JSON, use the text as is
              }
              
            } catch (readError) {
              console.error('Failed to read error response:', readError);
              if (readError instanceof Error && readError.message === 'BACKEND_UNAVAILABLE') {
                throw readError;
              }
              errorText = 'Unable to read error response';
            }
            
            // Provide more specific error messages based on status codes
            if (response.status === 404) {
              console.log('Backend not available, switching to mock mode');
              if (!mockBackend) {
                mockBackend = createMockBackend();
                isUsingMockBackend = true;
              }
              throw new Error('BACKEND_UNAVAILABLE');
            } else if (response.status === 500) {
              throw new Error('Internal server error. Please try again later.');
            } else if (response.status === 503) {
              throw new Error('Service unavailable. The server may be temporarily down.');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
          }
          
          // Validate that we're getting JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response received:', { contentType, text: text.substring(0, 200) });
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
              throw new Error('Request timeout - please check your connection and try again');
            }
            if (error.message === 'BACKEND_UNAVAILABLE') {
              throw error; // Let this bubble up to be handled by the auth hooks
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
              // This is often a CORS or network connectivity issue
              console.log('Backend not available (fetch failed), switching to mock mode');
              if (!mockBackend) {
                mockBackend = createMockBackend();
                isUsingMockBackend = true;
              }
              throw new Error('BACKEND_UNAVAILABLE');
            }
            if (error.message.includes('Network request failed')) {
              throw new Error('Network error - please check your internet connection and try again');
            }
            // Pass through our custom error messages
            if (error.message.includes('API endpoint') || error.message.includes('Server') || error.message.includes('HTML instead of JSON')) {
              throw error;
            }
          }
          throw error;
        }
      },
    }),
  ],
});

// Enhanced mock client with better error handling and persistence
export const mockTrpcClient = {
  example: {
    hi: {
      mutate: async ({ name }: { name: string }) => {
        console.log('Using mock backend for example.hi');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.example.hi.mutate({ name });
      },
    },
  },
  auth: {
    register: {
      mutate: async ({ email, password }: { email: string; password: string }) => {
        console.log('Using mock backend for auth.register');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.auth.register.mutate({ email, password });
      },
    },
    login: {
      mutate: async ({ email, password }: { email: string; password: string }) => {
        console.log('Using mock backend for auth.login');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.auth.login.mutate({ email, password });
      },
    },
    me: {
      query: async () => {
        console.log('Using mock backend for auth.me');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.auth.me.query();
      },
    },
    completeProfile: {
      mutate: async ({ name, username, bio }: { name?: string; username?: string; bio?: string }) => {
        console.log('Using mock backend for auth.completeProfile');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.auth.completeProfile.mutate({ name, username, bio });
      },
    },
  },
  posts: {
    list: {
      query: async () => {
        console.log('Using mock backend for posts.list');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.posts.list.query();
      },
    },
    create: {
      mutate: async ({ content, image }: { content: string; image?: string }) => {
        console.log('Using mock backend for posts.create');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.posts.create.mutate({ content, image });
      },
    },
    uploadImage: {
      mutate: async ({ image }: { image: string }) => {
        console.log('Using mock backend for posts.uploadImage');
        if (!mockBackend) mockBackend = createMockBackend();
        return mockBackend.posts.uploadImage.mutate({ image });
      },
    },
  },
};

// Export a function to check if we're using mock backend
export const isUsingMock = () => isUsingMockBackend;

// Export a function to force mock mode
export const enableMockMode = () => {
  if (!mockBackend) mockBackend = createMockBackend();
  isUsingMockBackend = true;
  console.log('Mock backend enabled');
};