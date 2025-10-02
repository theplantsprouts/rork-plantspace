import { getDatabase, ref, push, set, onValue, off, query, orderByChild, limitToLast, get, update, remove } from 'firebase/database';
import { auth } from './firebase';

const rtdb = getDatabase();

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSenderId?: string;
  unreadCount?: { [userId: string]: number };
}

export const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

export const sendMessage = async (
  receiverId: string,
  text: string,
  attachment?: {
    url: string;
    name: string;
    size: number;
    type: 'image' | 'file';
    mimeType: string;
  }
): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const conversationId = getConversationId(user.uid, receiverId);
    const messagesRef = ref(rtdb, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef);

    const message: Omit<ChatMessage, 'id'> = {
      conversationId,
      senderId: user.uid,
      receiverId,
      text,
      timestamp: Date.now(),
      read: false,
      type: attachment ? attachment.type : 'text',
      ...(attachment && {
        attachmentUrl: attachment.url,
        attachmentName: attachment.name,
        attachmentSize: attachment.size,
        attachmentType: attachment.mimeType,
      }),
    };

    await set(newMessageRef, message);

    const conversationRef = ref(rtdb, `conversations/${conversationId}`);
    const lastMessageText = attachment 
      ? (attachment.type === 'image' ? '📷 Image' : `📎 ${attachment.name}`)
      : text;

    await update(conversationRef, {
      participants: [user.uid, receiverId],
      lastMessage: lastMessageText,
      lastMessageTime: Date.now(),
      lastMessageSenderId: user.uid,
      [`unreadCount/${receiverId}`]: (await get(ref(rtdb, `conversations/${conversationId}/unreadCount/${receiverId}`))).val() + 1 || 1,
    });

    return newMessageRef.key;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void,
  limitCount: number = 50
) => {
  const messagesRef = ref(rtdb, `messages/${conversationId}`);
  const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limitCount));

  const listener = onValue(messagesQuery, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    callback(messages);
  });

  return () => off(messagesQuery, 'value', listener);
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const conversationsRef = ref(rtdb, 'conversations');

  const listener = onValue(conversationsRef, (snapshot) => {
    const conversations: Conversation[] = [];
    snapshot.forEach((childSnapshot) => {
      const conv = childSnapshot.val();
      if (conv.participants && conv.participants.includes(userId)) {
        conversations.push({
          id: childSnapshot.key!,
          ...conv,
        });
      }
    });
    
    conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    callback(conversations);
  });

  return () => off(conversationsRef, 'value', listener);
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const messagesRef = ref(rtdb, `messages/${conversationId}`);
    const snapshot = await get(messagesRef);

    const updates: { [key: string]: any } = {};
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      if (message.receiverId === userId && !message.read) {
        updates[`messages/${conversationId}/${childSnapshot.key}/read`] = true;
      }
    });

    updates[`conversations/${conversationId}/unreadCount/${userId}`] = 0;

    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await remove(ref(rtdb, `messages/${conversationId}`));
    await remove(ref(rtdb, `conversations/${conversationId}`));
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
