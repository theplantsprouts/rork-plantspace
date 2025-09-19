import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { uploadImage } from "@/lib/firebase";

export const uploadImageProcedure = publicProcedure
  .input(
    z.object({
      base64: z.string(),
      filename: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { base64, filename } = input;
      
      // Convert base64 to data URI
      const dataUri = `data:image/jpeg;base64,${base64}`;
      
      // Upload to Firebase Storage
      const imageUrl = await uploadImage(dataUri, 'posts');
      
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }
      
      return {
        imageUrl,
        filename,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  });