import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const suspendUserProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Suspending user:", input.userId);

    try {
      const userRef = doc(db, "profiles", input.userId);
      await updateDoc(userRef, {
        status: "suspended",
        suspended_reason: input.reason,
        suspended_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("[Admin] Error suspending user:", error);
      throw new Error("Failed to suspend user");
    }
  });
