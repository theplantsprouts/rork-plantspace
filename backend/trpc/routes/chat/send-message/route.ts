import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { sendMessage } from '@/lib/firebase-chat';

export const sendMessageProcedure = protectedProcedure
  .input(
    z.object({
      receiverId: z.string(),
      text: z.string(),
      type: z.enum(['text', 'call-offer', 'call-answer', 'call-end']).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const messageId = await sendMessage(input.receiverId, input.text, input.type);
    
    if (!messageId) {
      throw new Error('Failed to send message');
    }

    return { success: true, messageId };
  });
