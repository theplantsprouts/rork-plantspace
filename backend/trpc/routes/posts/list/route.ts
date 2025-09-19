import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { getPosts } from "@/lib/supabase";

export const getPostsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input }) => {
    try {
      const { limit, offset } = input;
      
      // Fetch posts from Supabase
      const allPosts = await getPosts();
      
      // Apply pagination
      const paginatedPosts = allPosts.slice(offset, offset + limit);
      
      return {
        posts: paginatedPosts,
        hasMore: offset + limit < allPosts.length,
        total: allPosts.length,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  });