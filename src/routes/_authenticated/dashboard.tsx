import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Gauge,
  IndianRupee,
  Sparkles,
  TriangleAlert,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { ResumeUploader } from "@/components/resume-uploader";
import { JobCard } from "@/components/job-card";
import { getLatestResume } from "@/lib/resume.functions";
import { listJobs } from "@/lib/jobs.functions";
import { formatInr, rankJobs, type JobRow } from "@/lib/matching";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerFit India" },
      {
        name: "description",
        content:
          "Your ATS score, skill gaps, predicted roles, salary range and top job matches across India.",
      },
      { property: "og:title", content: "Dashboard — CareerFit India" },
      {
        property: "og:description",
        content: "Resume intelligence and ranked Indian job matches in one place.",
      },
    ],
  }),
  component: Dashboard,
});

type Role = { role: string; confidence: number; reason?: string };
type Salary = { min?: number; avg?: number; max?: number; basis?: string };

function Dashboard() {
  const fetchResume = useServerFn(getLatestResume);
  const fetchJobs = useServerFn(listJobs);

  const resumeQuery = useQuery({ queryKey: ["resume"], queryFn: () => fetchResume() });
  const jobsQuery = useQuery({ queryKey: ["jobs"], queryFn: () => fetchJobs() });

  const resume = resumeQuery.data;

  if (resumeQuery.isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!resume) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-semibold">Start with your resume</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a PDF, DOCX or TXT resume. We extract your skills, score it against ATS rules and
            rank Indian jobs for you.
          </p>
          <div className="mt-6">
            <ResumeUploader />
          </div>
        </div>
      </AppShell>
    );
  }

  const skills = (resume.skills ?? []) as string[];
  const missing = (resume.missing_skills ?? []) as string[];
  const strengths = (resume.strengths ?? []) as string[];
  const weaknesses = (resume.weaknesses ?? []) as string[];
  const suggestions = (resume.suggestions ?? []) as string[];
  const roles = (resume.predicted_roles ?? []) as unknown as Role[];
  const salary = (resume.salary_prediction ?? {}) as Salary;

  const jobs = (jobsQuery.data ?? []) as unknown as JobRow[];
  const ranked = rankJobs(jobs, {
    skills,
    experienceYears: resume.total_experience_years ?? 0,
  }).slice(0, 6);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {resume.full_name ? `Hi ${resume.full_name.split(" ")[0]}` : "Your analysis"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {resume.file_name} · {resume.total_experience_years ?? 0} yrs experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link to="/resume-builder">
                <FileText className="size-4" /> Build best resume
              </Link>
            </Button>
            <ResumeUploader compact />
          </div>
        </div>

        <section>
          <h2 className="font-display text-lg font-semibold">Resume summary</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="surface-panel rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Gauge className="size-4" /> ATS score
              </p>
              <p className="mt-3 font-display text-4xl font-semibold text-primary">
                {resume.ats_score}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
              <Progress value={resume.ats_score ?? 0} className="mt-4 h-1.5" />
              <p className="mt-3 text-xs text-muted-foreground">
                Resume quality score {resume.resume_score}/100
              </p>
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <IndianRupee className="size-4" /> Predicted salary
              </p>
              <p className="mt-3 font-display text-3xl font-semibold">
                {formatInr(salary.avg ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatInr(salary.min ?? 0)} – {formatInr(salary.max ?? 0)} per year
              </p>
              {salary.basis && <p className="mt-3 text-xs text-muted-foreground">{salary.basis}</p>}
            </div>

            <div className="surface-panel rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-4" /> Best-fit roles
              </p>
              <ul className="mt-3 space-y-2.5">
                {roles.slice(0, 4).map((role) => (
                  <li key={role.role}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{role.role}</span>
                      <span className="text-muted-foreground">{role.confidence}%</span>
                    </div>
                    <Progress value={role.confidence} className="mt-1 h-1" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-panel rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold">Skills detected</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Badge key={skill} className="bg-primary/15 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
            <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold">
              <TriangleAlert className="size-4 text-amber-400" /> Skill gaps to close
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {missing.map((skill) => (
                <Badge key={skill} variant="outline" className="text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold">Resume feedback</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="flex items-center gap-2 font-medium text-primary">
                  <CheckCircle2 className="size-4" /> Strengths
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
                  {strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Weaknesses</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
                  {weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Suggested fixes</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
                  {suggestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Top matched jobs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked on skill match, experience fit, salary, company rating and fresher friendliness.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ranked.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
