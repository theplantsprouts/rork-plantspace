import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";

export const addCommentProcedure = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
      content: z.string().min(1),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { postId, content } = input;
    const userId = ctx.user.id;

    try {
      const commentData = {
        postId,
        userId,
        content,
        created_at: new Date().toISOString(),
        likes: 0,
      };

      const commentRef = await addDoc(collection(db, 'comments'), commentData);
      
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: increment(1),
      });

      return { 
        success: true, 
        commentId: commentRef.id,
        message: 'Comment added successfully' 
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  });
