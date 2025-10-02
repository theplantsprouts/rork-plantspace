import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const activateUserProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Admin] Activating user:", input.userId);

    try {
      const userRef = doc(db, "profiles", input.userId);
      await updateDoc(userRef, {
        status: "active",
        suspended_reason: null,
        suspended_at: null,
      });

      return { success: true };
    } catch (error) {
      console.error("[Admin] Error activating user:", error);
      throw new Error("Failed to activate user");
    }
  });
