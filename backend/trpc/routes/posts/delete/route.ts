import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

export const deletePostProcedure = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { postId } = input;
      
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }
      
      const userId = ctx.user.id;

      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }

      const postData = postSnap.data();
      
      if (postData.user_id !== userId) {
        throw new Error("You can only delete your own posts");
      }

      await deleteDoc(postRef);

      return { success: true, message: "Post deleted successfully" };
    } catch (error: any) {
      console.error("Error deleting post:", error);
      throw new Error(error.message || "Failed to delete post");
    }
  });
