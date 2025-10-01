import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

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

    const { page, limit, status } = input;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[Admin] Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }

    return {
      posts: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });
