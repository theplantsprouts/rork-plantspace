import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import { updateProfile } from "@/lib/firebase";

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
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      
      console.log('Profile completion attempt for user:', ctx.user.id);
      const { name, username, bio, avatar } = input;
      const userId = ctx.user.id;

      // Update profile in Firebase
      const updatedProfile = await updateProfile(userId, {
        name,
        username,
        bio,
        avatar,
      });
      
      if (!updatedProfile) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }

      const response = {
        user: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          createdAt: updatedProfile.created_at,
          name: updatedProfile.name,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatar: updatedProfile.avatar,
          followers: updatedProfile.followers || 0,
          following: updatedProfile.following || 0,
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