import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// In-memory user storage (replace with database in production)
export interface BackendUser {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

const users: BackendUser[] = [];

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

      // Check if user already exists
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        console.log('User already exists:', email);
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists with this email",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user: BackendUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        password: hashedPassword,
        createdAt: new Date(),
        name: undefined,
        username: undefined,
        bio: undefined,
        avatar: undefined,
        followers: 0,
        following: 0,
      };

      users.push(user);
      console.log('User created successfully:', user.id);

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

export { users };