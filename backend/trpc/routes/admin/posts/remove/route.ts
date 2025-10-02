import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const removePostProcedure = adminProcedure
  .input(
    z.object({
      postId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Removing post:", input.postId);

    try {
      const postRef = doc(db, "posts", input.postId);
      await updateDoc(postRef, {
        status: "removed",
        removed_reason: input.reason,
        removed_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("[Admin] Error removing post:", error);
      throw new Error("Failed to remove post");
    }
  });
