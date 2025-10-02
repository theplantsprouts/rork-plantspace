import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db, uploadImage } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const sendMessageProcedure = protectedProcedure
  .input(
    z.object({
      recipientId: z.string(),
      content: z.string().optional(),
      attachmentUri: z.string().optional(),
      attachmentType: z.enum(['image', 'file']).optional(),
      attachmentName: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const senderId = ctx.user.id;
    const { recipientId, content, attachmentUri, attachmentType, attachmentName } = input;

    if (!content && !attachmentUri) {
      throw new Error('Message must have content or attachment');
    }

    const chatId = [senderId, recipientId].sort().join('_');

    let attachmentUrl: string | undefined;
    if (attachmentUri) {
      const folder = attachmentType === 'image' ? 'chat-images' : 'chat-files';
      const uploadedUrl = await uploadImage(attachmentUri, folder);
      if (uploadedUrl) {
        attachmentUrl = uploadedUrl;
      }
    }

    const messageData: any = {
      chatId,
      senderId,
      recipientId,
      content: content || '',
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (attachmentUrl) {
      messageData.attachmentUrl = attachmentUrl;
      messageData.attachmentType = attachmentType;
      messageData.attachmentName = attachmentName || 'attachment';
    }

    const messageRef = await addDoc(collection(db, 'messages'), messageData);

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    const chatData = {
      participants: [senderId, recipientId],
      lastMessage: content || (attachmentType === 'image' ? '📷 Image' : '📎 File'),
      lastMessageTime: new Date().toISOString(),
      lastMessageSenderId: senderId,
      updatedAt: new Date().toISOString(),
    };

    if (chatSnap.exists()) {
      await updateDoc(chatRef, chatData);
    } else {
      await setDoc(chatRef, {
        ...chatData,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      id: messageRef.id,
      ...messageData,
    };
  });
