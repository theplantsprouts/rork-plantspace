import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { supabase } from "@/lib/supabase";

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('Registration attempt for:', input.email);
      const { email, password } = input;

      // Use Supabase auth for registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable redirect for mobile
        }
      });

      if (error) {
        console.error('Supabase registration error:', error);
        
        if (error.message.includes('User already registered')) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists with this email",
          });
        }
        
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Registration failed",
        });
      }

      if (!data.user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed. Please try again.",
        });
      }

      console.log('User created successfully:', data.user.id);

      const response = {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          created_at: data.user.created_at,
        },
        needsVerification: !data.session && !data.user.email_confirmed_at,
        session: data.session,
      };
      
      console.log('Registration successful for:', email);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Registration failed. Please try again.",
      });
    }
  });