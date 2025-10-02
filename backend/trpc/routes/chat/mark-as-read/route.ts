import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export const markAsReadProcedure = protectedProcedure
  .input(
    z.object({
      otherUserId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const { otherUserId } = input;

    const chatId = [userId, otherUserId].sort().join('_');

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map((docSnap) =>
      updateDoc(doc(db, 'messages', docSnap.id), { read: true })
    );

    await Promise.all(updatePromises);

    return { success: true, updatedCount: querySnapshot.docs.length };
  });
