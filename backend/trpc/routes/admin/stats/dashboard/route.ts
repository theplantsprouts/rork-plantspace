import { adminProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

export const dashboardStatsProcedure = adminProcedure.query(async ({ ctx }) => {
  console.log("[Admin] Fetching dashboard stats");

  const [usersResult, postsResult, reportsResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("post_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const activeUsersResult = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const flaggedPostsResult = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "flagged");

  return {
    totalUsers: usersResult.count || 0,
    activeUsers: activeUsersResult.count || 0,
    totalPosts: postsResult.count || 0,
    flaggedPosts: flaggedPostsResult.count || 0,
    pendingReports: reportsResult.count || 0,
  };
});
