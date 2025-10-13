import { protectedProcedure } from "../../../create-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";

export const getConversationsProcedure = protectedProcedure.query(async ({ ctx }) => {
  try {
    if (!ctx.user) {
      throw new Error('User not authenticated');
    }
    
    console.log('Getting conversations for user:', ctx.user.id);
    
    const messagesRef = collection(db, 'messages');
    
    const sentQuery = query(
      messagesRef,
      where('senderId', '==', ctx.user.id),
      orderBy('createdAt', 'desc')
    );
    
    const receivedQuery = query(
      messagesRef,
      where('receiverId', '==', ctx.user.id),
      orderBy('createdAt', 'desc')
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    const conversationsMap = new Map<string, any>();
    
    const processMessage = async (messageDoc: any) => {
      const messageData = messageDoc.data();
      const otherUserId = messageData.senderId === ctx.user.id 
        ? messageData.receiverId 
        : messageData.senderId;
      
      const existingConv = conversationsMap.get(otherUserId);
      const messageTime = messageData.createdAt?.toDate?.() || new Date();
      
      if (!existingConv || messageTime > existingConv.lastMessageTime) {
        const profileRef = doc(db, 'profiles', otherUserId);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        
        conversationsMap.set(otherUserId, {
          id: otherUserId,
          user: {
            id: otherUserId,
            name: profileData.name || 'Unknown User',
            username: profileData.username || '',
            avatar: profileData.avatar || '',
          },
          lastMessage: messageData.text || (messageData.imageUrl ? '📷 Image' : ''),
          timestamp: messageTime.toISOString(),
          lastMessageTime: messageTime,
          unread: messageData.receiverId === ctx.user.id && !messageData.read,
        });
      }
    };
    
    await Promise.all([
      ...sentSnapshot.docs.map(processMessage),
      ...receivedSnapshot.docs.map(processMessage)
    ]);
    
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
      .map(({ lastMessageTime, ...conv }) => conv);
    
    console.log(`Found ${conversations.length} conversations`);
    
    return { conversations };
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    throw new Error('Failed to get conversations');
  }
});
