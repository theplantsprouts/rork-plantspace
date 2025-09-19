import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { loginUser } from "@/lib/firebase";

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

      // Use Firebase auth for login
      const result = await loginUser(email, password);
      
      console.log('Login successful for:', email);
      
      return result;
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