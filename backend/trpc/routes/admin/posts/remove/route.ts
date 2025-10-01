import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

export const removePostProcedure = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Removing post:", input.postId);

    const { error } = await supabase
      .from("posts")
      .update({ 
        status: "removed",
        removed_reason: input.reason,
        removed_at: new Date().toISOString(),
      })
      .eq("id", input.postId);

    if (error) {
      console.error("[Admin] Error removing post:", error);
      throw new Error("Failed to remove post");
    }

    return { success: true };
  });
