import { z } from "zod";
import { postProcedure } from "@/backend/trpc/create-context";
import { createPost } from "@/lib/firebase";
import { sanitizeInput, validatePostContent } from "@/lib/validation";

export const createPostProcedure = postProcedure
  .input(
    z.object({
      content: z.string().min(1),
      image: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { content, image } = input;
      
      const validation = validatePostContent(content);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      const sanitizedContent = sanitizeInput(content);
      
      // Create post in Firebase
      const post = await createPost(sanitizedContent, image);
      
      if (!post) {
        throw new Error('Failed to create post');
      }
      
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  });