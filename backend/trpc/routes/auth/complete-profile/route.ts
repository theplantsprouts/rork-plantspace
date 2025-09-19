import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { users } from "../register/route";

export const completeProfileProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, "Display name is required"),
      username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
      bio: z.string().min(10, "Bio must be at least 10 characters"),
      avatar: z.union([z.string().url(), z.literal("")]).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('Profile completion attempt for user:', ctx.user.id);
      const { name, username, bio, avatar } = input;
      const userId = ctx.user.id;

      // Check if username is already taken
      const existingUser = users.find((user) => user.username === username && user.id !== userId);
      if (existingUser) {
        console.log('Username already taken:', username);
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username is already taken",
        });
      }

      // Find and update user
      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        console.log('User not found:', userId);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      users[userIndex] = {
        ...users[userIndex],
        name,
        username,
        bio,
        avatar,
      };

      const response = {
        user: {
          id: users[userIndex].id,
          email: users[userIndex].email,
          createdAt: users[userIndex].createdAt,
          name: users[userIndex].name,
          username: users[userIndex].username,
          bio: users[userIndex].bio,
          avatar: users[userIndex].avatar,
          followers: users[userIndex].followers || 0,
          following: users[userIndex].following || 0,
        },
      };
      
      console.log('Profile completed successfully for user:', userId);
      return response;
    } catch (error) {
      console.error('Profile completion error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to complete profile. Please try again.",
      });
    }
  });