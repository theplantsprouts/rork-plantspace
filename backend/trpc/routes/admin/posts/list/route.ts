import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db, getProfile } from "@/lib/firebase";
import { collection, query, orderBy, limit as firestoreLimit, getDocs, where } from "firebase/firestore";

export const listPostsAdminProcedure = adminProcedure
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "active", "flagged", "removed"]).default("all"),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Admin] Listing posts:", input);

    const { page, limit: limitCount, status } = input;

    try {
      const postsRef = collection(db, "posts");
      let q = query(postsRef, orderBy("created_at", "desc"), firestoreLimit(limitCount));

      if (status !== "all") {
        q = query(postsRef, where("status", "==", status), orderBy("created_at", "desc"), firestoreLimit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const posts = [];

      for (const docSnap of querySnapshot.docs) {
        const postData: any = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        if (postData.author_id) {
          const profile = await getProfile(postData.author_id);
          if (profile) {
            postData.profiles = profile;
          }
        }

        posts.push(postData);
      }

      return {
        posts,
        total: posts.length,
        page,
        totalPages: 1,
      };
    } catch (error) {
      console.error("[Admin] Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }
  });
