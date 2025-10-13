import { protectedProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export const listBookmarksProcedure = protectedProcedure.query(async ({ ctx }) => {
  if (!ctx.user) {
    throw new Error('User not authenticated');
  }
  
  const userId = ctx.user.id;

  try {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(bookmarksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const bookmarkedPosts = [];

    for (const bookmarkDoc of querySnapshot.docs) {
      const bookmarkData = bookmarkDoc.data();
      const postRef = doc(db, 'posts', bookmarkData.postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        
        // Fetch author profile
        const authorRef = doc(db, 'profiles', postData.author_id);
        const authorSnap = await getDoc(authorRef);
        const authorData = authorSnap.exists() ? authorSnap.data() : null;

        bookmarkedPosts.push({
          id: postSnap.id,
          ...postData,
          author: authorData ? { id: authorSnap.id, ...authorData } : null,
          bookmarkedAt: bookmarkData.created_at,
        });
      }
    }

    return bookmarkedPosts;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw new Error('Failed to fetch bookmarks');
  }
});