import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from "firebase/firestore";

export const toggleShareProcedure = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { postId } = input;
    
    if (!ctx.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = ctx.user.id;

    try {
      const shareRef = doc(db, 'shares', `${userId}_${postId}`);
      const shareSnap = await getDoc(shareRef);
      const postRef = doc(db, 'posts', postId);

      if (shareSnap.exists()) {
        await deleteDoc(shareRef);
        await updateDoc(postRef, {
          shares: increment(-1),
        });
        return { shared: false, message: 'Share removed' };
      } else {
        await setDoc(shareRef, {
          userId,
          postId,
          created_at: new Date().toISOString(),
        });
        await updateDoc(postRef, {
          shares: increment(1),
        });
        return { shared: true, message: 'Post shared' };
      }
    } catch (error) {
      console.error('Error toggling share:', error);
      throw new Error('Failed to toggle share');
    }
  });
