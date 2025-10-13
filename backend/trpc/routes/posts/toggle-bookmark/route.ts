import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

export const toggleBookmarkProcedure = protectedProcedure
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
      const bookmarkRef = doc(db, 'bookmarks', `${userId}_${postId}`);
      const bookmarkSnap = await getDoc(bookmarkRef);

      if (bookmarkSnap.exists()) {
        await deleteDoc(bookmarkRef);
        return { bookmarked: false, message: 'Bookmark removed' };
      } else {
        await setDoc(bookmarkRef, {
          userId,
          postId,
          created_at: new Date().toISOString(),
        });
        return { bookmarked: true, message: 'Post bookmarked' };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw new Error('Failed to toggle bookmark');
    }
  });