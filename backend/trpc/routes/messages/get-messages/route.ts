import { protectedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export const getMessagesProcedure = protectedProcedure
  .input(
    z.object({
      otherUserId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      console.log('Getting messages between', ctx.user.id, 'and', input.otherUserId);
      
      const messagesRef = collection(db, 'messages');
      
      const sentQuery = query(
        messagesRef,
        where('senderId', '==', ctx.user.id),
        where('receiverId', '==', input.otherUserId),
        orderBy('createdAt', 'asc')
      );
      
      const receivedQuery = query(
        messagesRef,
        where('senderId', '==', input.otherUserId),
        where('receiverId', '==', ctx.user.id),
        orderBy('createdAt', 'asc')
      );
      
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);
      
      const messages = [
        ...sentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })),
        ...receivedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }))
      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      console.log(`Found ${messages.length} messages`);
      
      return { messages };
    } catch (error: any) {
      console.error('Error getting messages:', error);
      throw new Error('Failed to get messages');
    }
  });
