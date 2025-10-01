import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

export const suspendUserProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Suspending user:", input.userId);

    const { error } = await supabase
      .from("profiles")
      .update({ 
        status: "suspended",
        suspended_reason: input.reason,
        suspended_at: new Date().toISOString(),
      })
      .eq("id", input.userId);

    if (error) {
      console.error("[Admin] Error suspending user:", error);
      throw new Error("Failed to suspend user");
    }

    return { success: true };
  });
