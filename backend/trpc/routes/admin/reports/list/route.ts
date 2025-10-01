import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

export const listReportsProcedure = protectedProcedure
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "reviewed", "resolved"]).default("pending"),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log("[Admin] Listing reports:", input);

    const { page, limit, status } = input;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("post_reports")
      .select(`
        *,
        reporter:reporter_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        post:post_id (
          id,
          content,
          image_url,
          user_id,
          profiles:user_id (
            username,
            full_name
          )
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[Admin] Error fetching reports:", error);
      throw new Error("Failed to fetch reports");
    }

    return {
      reports: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });
