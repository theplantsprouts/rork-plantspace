import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const getOrCreateConversationProcedure = protectedProcedure
  .input(
    z.object({
      otherUserId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[getOrCreateConversation] Getting conversation with:", input.otherUserId);

    const user1Id = ctx.user.id < input.otherUserId ? ctx.user.id : input.otherUserId;
    const user2Id = ctx.user.id < input.otherUserId ? input.otherUserId : ctx.user.id;

    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("user1_id", user1Id)
      .eq("user2_id", user2Id)
      .single();

    if (existingConv) {
      console.log("[getOrCreateConversation] Found existing conversation:", existingConv.id);
      return { conversationId: existingConv.id };
    }

    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        last_message: "",
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (createError || !newConv) {
      console.error("[getOrCreateConversation] Error creating conversation:", createError);
      throw new Error("Failed to create conversation");
    }

    console.log("[getOrCreateConversation] Created new conversation:", newConv.id);
    return { conversationId: newConv.id };
  });
