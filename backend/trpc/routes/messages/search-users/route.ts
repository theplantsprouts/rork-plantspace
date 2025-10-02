import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const searchUsersProcedure = protectedProcedure
  .input(
    z.object({
      query: z.string().min(1),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[searchUsers] Searching users with query:", input.query);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, username, avatar, email")
      .or(`name.ilike.%${input.query}%,username.ilike.%${input.query}%,id.eq.${input.query}`)
      .neq("id", ctx.user.id)
      .limit(20);

    if (error) {
      console.error("[searchUsers] Error:", error);
      throw new Error("Failed to search users");
    }

    console.log("[searchUsers] Found users:", data?.length || 0);
    return data || [];
  });
