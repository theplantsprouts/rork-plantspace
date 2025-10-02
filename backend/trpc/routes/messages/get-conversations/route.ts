import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const getConversationsProcedure = protectedProcedure.query(
  async ({ ctx }) => {
    console.log("[getConversations] Fetching conversations for user:", ctx.user.id);

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        user1_id,
        user2_id,
        last_message,
        last_message_at,
        created_at,
        updated_at
      `)
      .or(`user1_id.eq.${ctx.user.id},user2_id.eq.${ctx.user.id}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("[getConversations] Error:", error);
      throw new Error("Failed to fetch conversations");
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    const otherUserIds = conversations.map((conv) =>
      conv.user1_id === ctx.user.id ? conv.user2_id : conv.user1_id
    );

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, username, avatar")
      .in("id", otherUserIds);

    if (profilesError) {
      console.error("[getConversations] Error fetching profiles:", profilesError);
      throw new Error("Failed to fetch user profiles");
    }

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const result = conversations.map((conv) => {
      const otherUserId = conv.user1_id === ctx.user.id ? conv.user2_id : conv.user1_id;
      const profile = profilesMap.get(otherUserId);

      return {
        id: conv.id,
        otherUser: profile || { id: otherUserId, name: "Unknown", username: "", avatar: "" },
        lastMessage: conv.last_message || "",
        lastMessageAt: conv.last_message_at,
        createdAt: conv.created_at,
      };
    });

    console.log("[getConversations] Returning conversations:", result.length);
    return result;
  }
);
