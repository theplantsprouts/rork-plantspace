import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";

export const getMessagesProcedure = protectedProcedure
  .input(
    z.object({
      otherUserId: z.string(),
      limitCount: z.number().optional().default(50),
    })
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const { otherUserId, limitCount } = input;

    const chatId = [userId, otherUserId].sort().join('_');

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return messages.reverse();
  });
