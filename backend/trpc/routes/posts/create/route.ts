import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { createPost } from "@/lib/supabase";

export const createPostProcedure = protectedProcedure
  .input(
    z.object({
      content: z.string().min(1),
      image: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { content, image } = input;
      
      // Create post in Supabase
      const post = await createPost(content, image);
      
      if (!post) {
        throw new Error('Failed to create post');
      }
      
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  });