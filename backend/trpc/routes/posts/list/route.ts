import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { posts } from "../create/route";

export const getPostsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input }) => {
    const { limit, offset } = input;

    // Sort posts by creation date (newest first)
    const sortedPosts = posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return {
      posts: sortedPosts,
      hasMore: offset + limit < posts.length,
      total: posts.length,
    };
  });