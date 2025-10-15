import { Platform } from 'react-native';
import { showToast } from '@/components/Toast';

export class AppError extends Error {
  code?: string;
  statusCode?: number;
  
  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const ErrorMessages = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Something went wrong on our end. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  CONFLICT: 'This action conflicts with existing data.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('Network')) {
      return ErrorMessages.NETWORK;
    }
    
    if (error.message.includes('timeout')) {
      return ErrorMessages.TIMEOUT;
    }
    
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ErrorMessages.UNKNOWN;
}

export function handleError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  
  console.error(`[Error Handler${context ? ` - ${context}` : ''}]:`, error);
  
  if (Platform.OS === 'web' && __DEV__) {
    console.error('Error details:', error);
  }
  
  showToast.error(message);
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: string
): Promise<[T | null, Error | null]> {
  return promise
    .then((data): [T, null] => [data, null])
    .catch((error): [null, Error] => {
      handleError(error, context);
      return [null, error instanceof Error ? error : new Error(String(error))];
    });
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    context?: string;
    showToast?: boolean;
    onError?: (error: Error) => void;
  }
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    
    console.error(`[Error${options?.context ? ` - ${options.context}` : ''}]:`, error);
    
    if (options?.showToast !== false) {
      showToast.error(errorMessage);
    }
    
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }
    
    return null;
  }
}

export function mapFirebaseError(error: any): string {
  const code = error?.code || '';
  
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': ErrorMessages.NETWORK,
    'permission-denied': 'Permission denied. Please try logging out and back in.',
    'not-found': ErrorMessages.NOT_FOUND,
    'already-exists': ErrorMessages.CONFLICT,
    'resource-exhausted': 'Too many requests. Please try again later.',
    'unauthenticated': ErrorMessages.UNAUTHORIZED,
  };
  
  return errorMap[code] || error?.message || ErrorMessages.UNKNOWN;
}
