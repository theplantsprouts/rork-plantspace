import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const resolveReportProcedure = adminProcedure
  .input(
    z.object({
      reportId: z.string(),
      action: z.enum(["dismiss", "remove_post", "suspend_user"]),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Resolving report:", input.reportId);

    try {
      const reportRef = doc(db, "reports", input.reportId);
      await updateDoc(reportRef, {
        status: "resolved",
        admin_action: input.action,
        admin_notes: input.notes,
        resolved_at: new Date().toISOString(),
        resolved_by: ctx.user.id,
      });

      return { success: true };
    } catch (error) {
      console.error("[Admin] Error resolving report:", error);
      throw new Error("Failed to resolve report");
    }
  });
