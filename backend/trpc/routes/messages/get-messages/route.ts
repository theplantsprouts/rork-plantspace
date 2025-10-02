import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const getMessagesProcedure = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[getMessages] Fetching messages for conversation:", input.conversationId);

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("user1_id, user2_id")
      .eq("id", input.conversationId)
      .single();

    if (convError || !conversation) {
      console.error("[getMessages] Conversation not found:", convError);
      throw new Error("Conversation not found");
    }

    if (conversation.user1_id !== ctx.user.id && conversation.user2_id !== ctx.user.id) {
      throw new Error("Unauthorized access to conversation");
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", input.conversationId)
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (error) {
      console.error("[getMessages] Error:", error);
      throw new Error("Failed to fetch messages");
    }

    console.log("[getMessages] Returning messages:", messages?.length || 0);
    return messages || [];
  });
