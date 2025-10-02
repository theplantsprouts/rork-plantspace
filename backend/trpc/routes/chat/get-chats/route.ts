import { protectedProcedure } from "@/backend/trpc/create-context";
import { db, getProfile } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getChatsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId)
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
        lastMessageTime: chatData.lastMessageTime || new Date().toISOString(),
        unreadCount: 0,
      });
    }
  }

  chats.sort((a, b) => {
    const timeA = new Date(a.lastMessageTime).getTime();
    const timeB = new Date(b.lastMessageTime).getTime();
    return timeB - timeA;
  });

  return chats;
});
