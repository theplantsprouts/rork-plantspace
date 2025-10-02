import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import {
  Conversation,
  ChatMessage,
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as sendMessageToFirebase,
  markMessagesAsRead,
  getConversationId,
} from '@/lib/firebase-chat';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Setting up conversations listener for user:', user.uid);
    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      console.log('Received conversations:', convs.length);
      setConversations(convs);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up conversations listener');
      unsubscribe();
    };
  }, []);

  return { conversations, loading };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    console.log('Setting up messages listener for conversation:', conversationId);
    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      console.log('Received messages:', msgs.length);
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up messages listener');
      unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (receiverId: string, text: string) => {
      if (!conversationId) return null;
      return await sendMessageToFirebase(receiverId, text);
    },
    [conversationId]
  );

  const markAsRead = useCallback(async () => {
    const user = auth.currentUser;
    if (!conversationId || !user) return;
    await markMessagesAsRead(conversationId, user.uid);
  }, [conversationId]);

  return { messages, loading, sendMessage, markAsRead };
};

export const useStartConversation = () => {
  const startConversation = useCallback((userId: string) => {
    const user = auth.currentUser;
    if (!user) return null;
    return getConversationId(user.uid, userId);
  }, []);

  return { startConversation };
};
