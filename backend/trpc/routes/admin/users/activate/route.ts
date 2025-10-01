import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

export const activateUserProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Activating user:", input.userId);

    const { error } = await supabase
      .from("profiles")
      .update({ 
        status: "active",
        suspended_reason: null,
        suspended_at: null,
      })
      .eq("id", input.userId);

    if (error) {
      console.error("[Admin] Error activating user:", error);
      throw new Error("Failed to activate user");
    }

    return { success: true };
  });
