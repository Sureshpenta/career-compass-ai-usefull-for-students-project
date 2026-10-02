import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateBestResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ targetRole: z.string().max(120).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { buildBestResume } = await import("./resume-builder.server");

    let resume: Record<string, unknown> | null = null;

    try {
      const { data: dbResume } = await context.supabase
        .from("resumes")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbResume) resume = dbResume as Record<string, unknown>;
    } catch {
      // Fall through
    }

    if (!resume) {
      const { getLatestResume } = await import("./resume.functions");
      const latest = (await (
        getLatestResume as unknown as (args: { context: typeof context }) => Promise<unknown>
      )({ context })) as Record<string, unknown> | null;
      if (latest) resume = latest;
    }

    if (!resume) {
      resume = {
        full_name: "Technical Candidate",
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git"],
        total_experience_years: 2,
        summary: "Software Engineer with experience building web applications.",
      };
    }

    return buildBestResume({
      targetRole: data.targetRole ?? "",
      resume,
    });
  });
