import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// In-memory posts storage (replace with database in production)
const posts: Array<{
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
  comments: number;
}> = [];

export const createPostProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      content: z.string().min(1),
      imageUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { userId, content, imageUrl } = input;

    const post = {
      id: Math.random().toString(36).substring(2, 15),
      userId,
      content,
      imageUrl,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
    };

    posts.push(post);

    return post;
  });

export { posts };