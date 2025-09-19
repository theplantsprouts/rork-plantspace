// Firebase is now the primary backend - this file is deprecated
// All functionality has been moved to Firebase

// Firebase is now the primary backend

// Legacy connection test - Firebase connection is handled in firebase.ts
export const testConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  console.log('tRPC backend is deprecated - using Firebase');
  return {
    success: true,
    message: 'Using Firebase backend',
    details: { backend: 'firebase' }
  };
};

// Deprecated - Firebase is now used directly
export const trpcClient = {
  // All functionality moved to Firebase
};

// Deprecated - Firebase is now used directly
export const mockTrpcClient = {
  // All functionality moved to Firebase
};

// Deprecated functions
export const isUsingMock = () => false;
export const enableMockMode = () => {
  console.log('Mock mode is deprecated - using Firebase');
};

// For backward compatibility - redirect to Firebase
export const trpc = () => {
  throw new Error('tRPC is deprecated - use Firebase functions directly from @/lib/firebase');
};