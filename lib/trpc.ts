import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink as clientHttpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/backend/trpc/app-router';
import { auth } from '@/lib/firebase';
import superjson from 'superjson';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:8081';
};

export const trpc = createTRPCReact<AppRouter>();

export const getTrpcClient = () => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            return {
              authorization: `Bearer ${token}`,
            };
          }
          return {};
        },
      }),
    ],
  });
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    clientHttpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          return {
            authorization: `Bearer ${token}`,
          };
        }
        return {};
      },
    }),
  ],
});