import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { getConversationId } from '@/lib/firebase-chat';

export const startConversationProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const conversationId = getConversationId(ctx.user.uid, input.userId);
    return { conversationId };
  });
