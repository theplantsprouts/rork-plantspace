import { z } from "zod";
import { likeProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from "firebase/firestore";

export const toggleLikeProcedure = likeProcedure
  .input(
    z.object({
      postId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { postId } = input;
    const userId = ctx.user.id;

    try {
      const likeRef = doc(db, 'likes', `${userId}_${postId}`);
      const likeSnap = await getDoc(likeRef);
      const postRef = doc(db, 'posts', postId);

      if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1),
        });
        return { liked: false, message: 'Like removed' };
      } else {
        await setDoc(likeRef, {
          userId,
          postId,
          created_at: new Date().toISOString(),
        });
        await updateDoc(postRef, {
          likes: increment(1),
        });
        return { liked: true, message: 'Post liked' };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like');
    }
  });
