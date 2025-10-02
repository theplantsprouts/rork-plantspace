import { protectedProcedure } from "@/backend/trpc/create-context";
import { db, getProfile } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export const getChatsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const chats = [];

  for (const docSnap of querySnapshot.docs) {
    const chatData = docSnap.data();
    const otherUserId = chatData.participants.find((id: string) => id !== userId);

    if (otherUserId) {
      const otherUserProfile = await getProfile(otherUserId);

      chats.push({
        id: docSnap.id,
        otherUser: {
          id: otherUserId,
          name: otherUserProfile?.name || 'Unknown User',
          username: otherUserProfile?.username || '',
          avatar: otherUserProfile?.avatar || '',
        },
        lastMessage: chatData.lastMessage || '',
        lastMessageTime: chatData.lastMessageTime || '',
        unreadCount: 0,
      });
    }
  }

  return chats;
});
