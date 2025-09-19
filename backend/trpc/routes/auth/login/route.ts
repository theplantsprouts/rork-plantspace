import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { supabase } from "@/lib/supabase";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(1, "Password is required"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('Login attempt for:', input.email);
      const { email, password } = input;

      // Use Supabase auth for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Please check your email and click the confirmation link before signing in.",
          });
        }
        
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Login failed",
        });
      }

      if (!data.user || !data.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Login failed. Please try again.",
        });
      }

      console.log('Login successful for:', email);

      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          created_at: data.user.created_at,
        },
        session: data.session,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Login failed. Please try again.",
      });
    }
  });