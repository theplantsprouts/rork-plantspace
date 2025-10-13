import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const reportPostProcedure = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { postId, reason } = input;
      
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }
      
      const userId = ctx.user.id;

      const reportData = {
        post_id: postId,
        reported_by: userId,
        reason,
        created_at: serverTimestamp(),
        status: "pending",
      };

      await addDoc(collection(db, "reports"), reportData);

      return { success: true, message: "Post reported successfully" };
    } catch (error: any) {
      console.error("Error reporting post:", error);
      throw new Error(error.message || "Failed to report post");
    }
  });
