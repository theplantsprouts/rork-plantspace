import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import jwt from "jsonwebtoken";
import { users } from "./routes/auth/register/route";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  let user = null;

  console.log('Creating context, auth header:', authHeader ? 'Present' : 'Missing');

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      console.log('Verifying token in context');
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      user = users.find(u => u.id === decoded.userId);
      console.log('Context user found:', user ? user.id : 'None');
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

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);