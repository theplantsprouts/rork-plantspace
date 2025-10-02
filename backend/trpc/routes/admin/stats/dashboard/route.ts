import { adminProcedure } from "../../../../create-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const dashboardStatsProcedure = adminProcedure.query(async ({ ctx }) => {
  console.log("[Admin] Fetching dashboard stats");

  try {
    const profilesRef = collection(db, "profiles");
    const postsRef = collection(db, "posts");
    const reportsRef = collection(db, "reports");

    const [profilesSnapshot, postsSnapshot, reportsSnapshot] = await Promise.all([
      getDocs(profilesRef),
      getDocs(postsRef),
      getDocs(query(reportsRef, where("status", "==", "pending"))),
    ]);

    const activeUsersSnapshot = await getDocs(query(profilesRef, where("status", "==", "active")));
    const flaggedPostsSnapshot = await getDocs(query(postsRef, where("status", "==", "flagged")));

    return {
      totalUsers: profilesSnapshot.size,
      activeUsers: activeUsersSnapshot.size,
      totalPosts: postsSnapshot.size,
      flaggedPosts: flaggedPostsSnapshot.size,
      pendingReports: reportsSnapshot.size,
    };
  } catch (error) {
    console.error("[Admin] Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
});
