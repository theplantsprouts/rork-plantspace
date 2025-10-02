import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const sendMessageProcedure = protectedProcedure
  .input(
    z.object({
      recipientId: z.string(),
      content: z.string().min(1),
      image: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[sendMessage] Sending message to:", input.recipientId);

    const user1Id = ctx.user.id < input.recipientId ? ctx.user.id : input.recipientId;
    const user2Id = ctx.user.id < input.recipientId ? input.recipientId : ctx.user.id;

    let conversationId: string;

    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("user1_id", user1Id)
      .eq("user2_id", user2Id)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          last_message: input.content,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createError || !newConv) {
        console.error("[sendMessage] Error creating conversation:", createError);
        throw new Error("Failed to create conversation");
      }

      conversationId = newConv.id;
    }

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: ctx.user.id,
        content: input.content,
        image: input.image,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("[sendMessage] Error creating message:", messageError);
      throw new Error("Failed to send message");
    }

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        last_message: input.content,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) {
      console.error("[sendMessage] Error updating conversation:", updateError);
    }

    console.log("[sendMessage] Message sent successfully");
    return { message, conversationId };
  });
