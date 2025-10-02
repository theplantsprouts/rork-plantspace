import { protectedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendMessageProcedure = protectedProcedure
  .input(
    z.object({
      receiverId: z.string(),
      text: z.string().optional(),
      imageUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      if (!input.text && !input.imageUrl) {
        throw new Error('Message must contain text or image');
      }
      
      console.log('Sending message from', ctx.user.id, 'to', input.receiverId);
      
      const messagesRef = collection(db, 'messages');
      
      const messageData: any = {
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        createdAt: serverTimestamp(),
        read: false,
      };
      
      if (input.text) {
        messageData.text = input.text;
      }
      
      if (input.imageUrl) {
        messageData.imageUrl = input.imageUrl;
      }
      
      const docRef = await addDoc(messagesRef, messageData);
      
      console.log('Message sent successfully:', docRef.id);
      
      return {
        success: true,
        messageId: docRef.id,
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  });
