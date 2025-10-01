import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth, getProfile } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

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
        const profile = await getProfile(currentUser.uid);
        
        const { data: supabaseProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', currentUser.uid)
          .single();
        
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
          isAdmin: supabaseProfile?.is_admin || false,
        };
        console.log('Context user found:', user.id, 'isAdmin:', user.isAdmin);
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

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  if (!ctx.user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);