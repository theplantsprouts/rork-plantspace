import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth, getProfile } from "@/lib/firebase";
import { checkRateLimit, RateLimitType } from "@/lib/rate-limit";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  let user = null;

  console.log('Creating context, auth header:', authHeader ? 'Present' : 'Missing');

  if (authHeader?.startsWith("Bearer ")) {
    try {
      console.log('Verifying Firebase token in context');
      
      // For now, we'll use a simplified approach
      // In production, you'd use Firebase Admin SDK to verify the token
      // For development, we'll check if the current user is authenticated
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Get user profile from Firestore
        const profile = await getProfile(currentUser.uid);
        
        user = {
          id: currentUser.uid,
          email: currentUser.email || '',
          createdAt: profile?.created_at || new Date().toISOString(),
          name: profile?.name,
          username: profile?.username,
          bio: profile?.bio,
          avatar: profile?.avatar,
          followers: profile?.followers || 0,
          following: profile?.following || 0,
        };
        console.log('Context user found:', user.id);
      } else {
        console.log('No authenticated Firebase user found');
      }
    } catch (error) {
      console.log('Token verification failed in context:', error);
      // Invalid token, user remains null
    }
  }

  return {
    req: opts.req,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Auth middleware
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Rate limit middleware factory
const withRateLimit = (type: RateLimitType) => t.middleware(({ next, ctx }) => {
  const identifier = ctx.user?.id || ctx.req.headers.get('x-forwarded-for') || 'anonymous';
  const result = checkRateLimit(identifier, type);
  
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
    });
  }
  
  return next({ ctx });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

// Rate-limited procedures
export const authProcedure = publicProcedure.use(withRateLimit('auth'));
export const postProcedure = t.procedure.use(isAuthed).use(withRateLimit('post'));
export const commentProcedure = t.procedure.use(isAuthed).use(withRateLimit('comment'));
export const likeProcedure = t.procedure.use(isAuthed).use(withRateLimit('like'));
export const messageProcedure = t.procedure.use(isAuthed).use(withRateLimit('message'));