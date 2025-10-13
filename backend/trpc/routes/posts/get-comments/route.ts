import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db, getProfile, Comment } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export const getCommentsProcedure = publicProcedure
  .input(
    z.object({
      postId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { postId } = input;

    try {
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef, 
        where('postId', '==', postId), 
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const comments: Comment[] = [];

      for (const docSnap of querySnapshot.docs) {
        const commentData = { 
          id: docSnap.id, 
          ...docSnap.data() 
        } as Comment;
        
        if (commentData.userId) {
          const authorProfile = await getProfile(commentData.userId);
          if (authorProfile) {
            commentData.author = authorProfile;
          }
        }
        
        comments.push(commentData);
      }

      return { 
        success: true, 
        comments 
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  });
