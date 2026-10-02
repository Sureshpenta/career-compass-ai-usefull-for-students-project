// Server-only: builds an improved, ATS-friendly resume from an existing resume.
import { callAiJson } from "./ai.server";

export type BuiltResume = {
  headline: string;
  summary: string;
  resume_markdown: string;
  missing_items: { item: string; why: string; how_to_add: string }[];
  added_sections: string[];
  keywords_to_include: string[];
  before_after_bullets: { before: string; after: string }[];
  expected_ats_score: number;
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "summary",
    "resume_markdown",
    "missing_items",
    "added_sections",
    "keywords_to_include",
    "before_after_bullets",
    "expected_ats_score",
  ],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    resume_markdown: { type: "string" },
    missing_items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["item", "why", "how_to_add"],
        properties: {
          item: { type: "string" },
          why: { type: "string" },
          how_to_add: { type: "string" },
        },
      },
    },
    added_sections: { type: "array", items: { type: "string" } },
    keywords_to_include: { type: "array", items: { type: "string" } },
    before_after_bullets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["before", "after"],
        properties: { before: { type: "string" }, after: { type: "string" } },
      },
    },
    expected_ats_score: { type: "integer" },
  },
} as const;

const SYSTEM = `You are an elite Indian resume writer and ATS specialist.
Rewrite the candidate's resume into the strongest possible ATS-friendly version.
Rules:
- resume_markdown: a complete, ready-to-use single-column resume in Markdown with standard headings
  (Contact, Professional Summary, Skills, Experience, Projects, Education, Certifications, Achievements).
  Keep every real fact from the source; never invent employers, degrees, dates or metrics.
  Where a metric is clearly missing, write a bracketed placeholder like [add %/number].
- missing_items: 4-8 concrete things absent from the current resume (sections, keywords, metrics,
  links, certifications) with why it matters and exactly how to add it.
- added_sections: sections you introduced or restructured.
- keywords_to_include: 8-15 ATS keywords for the candidate's target Indian roles.
- before_after_bullets: 3-6 rewrites of weak bullets into quantified, action-verb bullets.
- expected_ats_score: integer 0-100 for the rewritten resume; must be honest.`;

export async function buildBestResume(input: {
  targetRole: string;
  resume: Record<string, unknown>;
}) {
  const result = await callAiJson<BuiltResume>({
    model: "google/gemini-3.5-flash",
    system: SYSTEM,
    user: `Target role: ${input.targetRole || "best fit based on the resume"}

Current resume data (JSON, includes raw text and prior analysis):
${JSON.stringify(input.resume).slice(0, 60000)}`,
    schema: SCHEMA as unknown as Record<string, unknown>,
    schemaName: "built_resume",
  });

  return {
    ...result,
    expected_ats_score: Math.max(0, Math.min(100, Math.round(result.expected_ats_score || 0))),
  };
}
