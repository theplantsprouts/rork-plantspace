// This file is kept for backward compatibility but Firebase is now the primary backend
// Most functionality has been moved to Firebase
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

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

// Legacy tRPC client - now using Firebase
// export const trpc = createTRPCReact<AppRouter>();

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

// Legacy tRPC client - Firebase is now the primary backend
// This is kept for backward compatibility but should not be used
export const trpcClient = {
  // Deprecated - use Firebase functions instead
};

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