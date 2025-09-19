import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { users } from "../register/route";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

      // Find user
      const user = users.find((u) => u.email === email);
      if (!user) {
        console.log('User not found:', email);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for:', email);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const response = {
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          name: user.name,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
          followers: user.followers || 0,
          following: user.following || 0,
        },
      };
      
      console.log('Login successful for:', email);
      return response;
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