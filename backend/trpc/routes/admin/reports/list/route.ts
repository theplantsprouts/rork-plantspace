import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { db, getProfile } from "@/lib/firebase";
import { collection, query, orderBy, limit as firestoreLimit, getDocs, where, doc, getDoc } from "firebase/firestore";

export const listReportsProcedure = adminProcedure
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "reviewed", "resolved"]).default("pending"),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Admin] Listing reports:", input);

    const { page, limit: limitCount, status } = input;

    try {
      const reportsRef = collection(db, "reports");
      let q = query(reportsRef, orderBy("created_at", "desc"), firestoreLimit(limitCount));

      if (status !== "all") {
        q = query(reportsRef, where("status", "==", status), orderBy("created_at", "desc"), firestoreLimit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const reports = [];

      for (const docSnap of querySnapshot.docs) {
        const reportData: any = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        if (reportData.reported_by) {
          const reporterProfile = await getProfile(reportData.reported_by);
          if (reporterProfile) {
            reportData.reporter = reporterProfile;
          }
        }

        if (reportData.post_id) {
          const postRef = doc(db, "posts", reportData.post_id);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            const postData: any = { id: postSnap.id, ...postSnap.data() };
            if (postData.author_id) {
              const authorProfile = await getProfile(postData.author_id);
              if (authorProfile) {
                postData.profiles = authorProfile;
              }
            }
            reportData.post = postData;
          }
        }

        reports.push(reportData);
      }

      return {
        reports,
        total: reports.length,
        page,
        totalPages: 1,
      };
    } catch (error) {
      console.error("[Admin] Error fetching reports:", error);
      throw new Error("Failed to fetch reports");
    }
  });
