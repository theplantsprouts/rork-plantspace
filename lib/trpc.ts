import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/backend/trpc/app-router';
import superjson from 'superjson';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return `http://localhost:${process.env.PORT ?? 8081}`;
};

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});

export const testConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/test`);
    const data = await response.json();
    return {
      success: true,
      message: 'Backend connection successful',
      details: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Backend connection failed',
      details: error
    };
  }
};
