import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const checkLikeProcedure = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { postId } = input;
    
    if (!ctx.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = ctx.user.id;

    try {
      const likeRef = doc(db, 'likes', `${userId}_${postId}`);
      const likeSnap = await getDoc(likeRef);
      return { liked: likeSnap.exists() };
    } catch (error) {
      console.error('Error checking like:', error);
      return { liked: false };
    }
  });
