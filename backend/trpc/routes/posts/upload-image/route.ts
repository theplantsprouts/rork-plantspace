import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export const uploadImageProcedure = publicProcedure
  .input(
    z.object({
      base64: z.string(),
      filename: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { base64, filename } = input;

    // In a real app, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll return a mock URL
    const imageUrl = `https://picsum.photos/400/400?random=${Math.random()}`;

    return {
      imageUrl,
      filename,
    };
  });