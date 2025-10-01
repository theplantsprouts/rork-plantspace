import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

export const resolveReportProcedure = protectedProcedure
  .input(
    z.object({
      reportId: z.string(),
      action: z.enum(["dismiss", "remove_post", "suspend_user"]),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Resolving report:", input.reportId);

    const { error } = await supabase
      .from("post_reports")
      .update({ 
        status: "resolved",
        admin_action: input.action,
        admin_notes: input.notes,
        resolved_at: new Date().toISOString(),
        resolved_by: ctx.user.id,
      })
      .eq("id", input.reportId);

    if (error) {
      console.error("[Admin] Error resolving report:", error);
      throw new Error("Failed to resolve report");
    }

    return { success: true };
  });
