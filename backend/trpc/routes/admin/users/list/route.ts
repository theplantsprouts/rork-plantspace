import { z } from "zod";
import { adminProcedure } from "../../../../create-context";
import { supabase } from "@/lib/supabase";

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

    const { page, limit, search, status } = input;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[Admin] Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }

    return {
      users: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });
