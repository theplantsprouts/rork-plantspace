import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit as firestoreLimit, getDocs, where } from "firebase/firestore";

export const listUsersProcedure = adminProcedure
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.enum(["all", "active", "suspended", "deleted"]).default("all"),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Admin] Listing users:", input);

    const { page, limit: limitCount, search, status } = input;

    try {
      const profilesRef = collection(db, "profiles");
      let q = query(profilesRef, orderBy("created_at", "desc"), firestoreLimit(limitCount));

      if (status !== "all") {
        q = query(profilesRef, where("status", "==", status), orderBy("created_at", "desc"), firestoreLimit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter((user: any) => 
          user.username?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower)
        );
      }

      return {
        users,
        total: users.length,
        page,
        totalPages: 1,
      };
    } catch (error) {
      console.error("[Admin] Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  });
