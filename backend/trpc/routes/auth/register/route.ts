import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { registerUser } from "@/lib/firebase";

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

      // Use Firebase auth for registration
      const result = await registerUser(email, password);
      
      console.log('User created successfully:', result.user.id);
      console.log('Registration successful for:', email);
      
      return result;
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