import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Json, Tables } from "@/integrations/supabase/types";

type ResumeRow = Tables<"resumes">;

const latestResumesStore = new Map<string, ResumeRow>();

export const getLatestResume = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ResumeRow | null> => {
    try {
      const { data, error } = await context.supabase
        .from("resumes")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data;
    } catch {
      // Fall through to in-memory store
    }
    return latestResumesStore.get(context.userId) ?? null;
  });

const AnalyzeInput = z.object({
  fileName: z.string().min(1).max(300),
  text: z.string().min(80, "That file didn't contain enough readable text.").max(40000),
});

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "full_name",
    "email",
    "phone",
    "summary",
    "skills",
    "missing_skills",
    "education",
    "projects",
    "certifications",
    "experience",
    "total_experience_years",
    "ats_score",
    "resume_score",
    "strengths",
    "weaknesses",
    "suggestions",
    "predicted_roles",
    "salary_prediction",
  ],
  properties: {
    full_name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    summary: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    missing_skills: { type: "array", items: { type: "string" } },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["degree", "institution", "year"],
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          year: { type: "string" },
        },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description", "tech"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          tech: { type: "array", items: { type: "string" } },
        },
      },
    },
    certifications: { type: "array", items: { type: "string" } },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "company", "duration", "highlights"],
        properties: {
          role: { type: "string" },
          company: { type: "string" },
          duration: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
        },
      },
    },
    total_experience_years: { type: "number" },
    ats_score: { type: "integer" },
    resume_score: { type: "integer" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
    predicted_roles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "confidence", "reason"],
        properties: {
          role: { type: "string" },
          confidence: { type: "integer" },
          reason: { type: "string" },
        },
      },
    },
    salary_prediction: {
      type: "object",
      additionalProperties: false,
      required: ["min", "avg", "max", "basis"],
      properties: {
        min: { type: "integer" },
        avg: { type: "integer" },
        max: { type: "integer" },
        basis: { type: "string" },
      },
    },
  },
} as const;

const SYSTEM = `You are an expert Indian technical recruiter and ATS engine.
Parse the resume, then evaluate it. Rules:
- Extract contact details verbatim; use "" when absent.
- skills: concrete technical + analytical skills only, canonical names (e.g. "Python", "Power BI", "Machine Learning").
- missing_skills: high-impact skills the candidate lacks for their most likely target roles in India.
- ats_score and resume_score: integers 0-100, honest and differentiated (do not default to 70-80).
- predicted_roles: 3-5 roles from typical Indian tech/data hiring, confidence integers summing to about 100, most likely first.
- salary_prediction: annual INR figures for the Indian market based on skills, education, certifications, experience and likely location.
- suggestions/strengths/weaknesses: 3-6 short, specific, actionable items each.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai.server");

    const analysis = await callAiJson<{
      full_name: string;
      email: string;
      phone: string;
      summary: string;
      skills: string[];
      missing_skills: string[];
      education: Json[];
      projects: Json[];
      certifications: string[];
      experience: Json[];
      total_experience_years: number;
      ats_score: number;
      resume_score: number;
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      predicted_roles: { role: string; confidence: number; reason: string }[];
      salary_prediction: { min: number; avg: number; max: number; basis: string };
    }>({
      model: "google/gemini-3.5-flash",
      system: SYSTEM,
      user: `Resume file: ${data.fileName}\n\n---\n${data.text}`,
      schema: ANALYSIS_SCHEMA as unknown as Record<string, unknown>,
      schemaName: "resume_analysis",
    });

    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n || 0)));

    const resumeRecord = {
      id: "demo-resume-" + Date.now(),
      user_id: context.userId,
      file_name: data.fileName,
      raw_text: data.text.slice(0, 40000),
      full_name: analysis.full_name || "Technical Candidate",
      email: analysis.email || null,
      phone: analysis.phone || null,
      skills: analysis.skills ?? [],
      missing_skills: analysis.missing_skills ?? [],
      education: analysis.education ?? [],
      projects: analysis.projects ?? [],
      certifications: analysis.certifications ?? [],
      experience: analysis.experience ?? [],
      total_experience_years: Math.max(0, analysis.total_experience_years ?? 0),
      ats_score: clamp(analysis.ats_score),
      resume_score: clamp(analysis.resume_score),
      strengths: analysis.strengths ?? [],
      weaknesses: analysis.weaknesses ?? [],
      suggestions: analysis.suggestions ?? [],
      predicted_roles: analysis.predicted_roles ?? [],
      salary_prediction: analysis.salary_prediction ?? {},
      summary: analysis.summary || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    latestResumesStore.set(context.userId, resumeRecord);

    try {
      const { data: row, error } = await context.supabase
        .from("resumes")
        .insert({
          user_id: context.userId,
          file_name: data.fileName,
          raw_text: data.text.slice(0, 40000),
          full_name: analysis.full_name || null,
          email: analysis.email || null,
          phone: analysis.phone || null,
          skills: analysis.skills ?? [],
          missing_skills: analysis.missing_skills ?? [],
          education: analysis.education ?? [],
          projects: analysis.projects ?? [],
          certifications: analysis.certifications ?? [],
          experience: analysis.experience ?? [],
          total_experience_years: Math.max(0, analysis.total_experience_years ?? 0),
          ats_score: clamp(analysis.ats_score),
          resume_score: clamp(analysis.resume_score),
          strengths: analysis.strengths ?? [],
          weaknesses: analysis.weaknesses ?? [],
          suggestions: analysis.suggestions ?? [],
          predicted_roles: analysis.predicted_roles ?? [],
          salary_prediction: analysis.salary_prediction ?? {},
          summary: analysis.summary || null,
        })
        .select("id")
        .single();

      if (!error && row) {
        resumeRecord.id = row.id;
      }
    } catch {
      // Use in-memory store fallback
    }

    return { id: resumeRecord.id };
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("resumes")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
