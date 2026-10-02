import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { JobCard } from "@/components/job-card";
import { listApplications, listJobs } from "@/lib/jobs.functions";
import { getLatestResume } from "@/lib/resume.functions";
import { rankJobs, type JobRow } from "@/lib/matching";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "India-wide jobs — CareerFit India" },
      {
        name: "description",
        content:
          "Search matched jobs by state, city, work mode and company with a live match percentage from your resume.",
      },
      { property: "og:title", content: "India-wide jobs — CareerFit India" },
      {
        property: "og:description",
        content: "Filter openings across every Indian state and see your match score instantly.",
      },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const fetchJobs = useServerFn(listJobs);
  const fetchResume = useServerFn(getLatestResume);
  const fetchApps = useServerFn(listApplications);

  const jobsQuery = useQuery({ queryKey: ["jobs"], queryFn: () => fetchJobs() });
  const resumeQuery = useQuery({ queryKey: ["resume"], queryFn: () => fetchResume() });
  const appsQuery = useQuery({ queryKey: ["applications"], queryFn: () => fetchApps() });

  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");
  const [mode, setMode] = useState("all");
  const [type, setType] = useState("all");

  const jobsData = jobsQuery.data;
  const jobs = useMemo(() => (jobsData ?? []) as unknown as JobRow[], [jobsData]);
  const resumeData = resumeQuery.data;
  const skills = useMemo(() => resumeData?.skills ?? [], [resumeData?.skills]);
  const appsData = appsQuery.data;
  const appliedIds = useMemo(
    () =>
      new Set(
        (appsData ?? [])
          .map((row) => (row.job as { id: string } | null)?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [appsData],
  );

  const states = useMemo(() => Array.from(new Set(jobs.map((job) => job.state))).sort(), [jobs]);
  const modes = useMemo(() => Array.from(new Set(jobs.map((job) => job.work_mode))).sort(), [jobs]);

  const ranked = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const needle = query.trim().toLowerCase();
      const matchesQuery =
        !needle ||
        [job.title, job.company, job.city, job.state, ...job.required_skills]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return (
        matchesQuery &&
        (state === "all" || job.state === state) &&
        (mode === "all" || job.work_mode === mode) &&
        (type === "all" || job.job_type === type)
      );
    });
    return rankJobs(filtered, {
      skills,
      experienceYears: resumeData?.total_experience_years ?? 0,
    });
  }, [jobs, query, state, mode, type, skills, resumeData?.total_experience_years]);

  const stateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of jobs) counts.set(job.state, (counts.get(job.state) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Jobs &amp; internships across India
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ranked.length} openings · match percentages come from your latest resume.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All openings" },
            { value: "Job", label: "Full-time jobs" },
            { value: "Internship", label: "Internships" },
          ].map((option) => {
            const count =
              option.value === "all"
                ? jobs.length
                : jobs.filter((job) => job.job_type === option.value).length;
            const active = type === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setType(option.value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
                <span className="ml-2 tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="surface-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Role, company, skill or city"
              className="pl-9"
            />
          </div>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Work mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any mode</SelectItem>
              {modes.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="surface-panel rounded-2xl p-4">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground">
            State-wise opportunities
          </h2>
          <div className="mt-3 space-y-2">
            {stateCounts.slice(0, 8).map(([name, count]) => (
              <button
                key={name}
                onClick={() => setState(name)}
                className="flex w-full items-center gap-3 text-left text-sm"
              >
                <span className="w-32 shrink-0 truncate text-muted-foreground">{name}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(count / (stateCounts[0]?.[1] ?? 1)) * 100}%` }}
                  />
                </span>
                <span className="w-8 text-right tabular-nums">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {jobsQuery.isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ranked.map((job) => (
              <JobCard key={job.id} job={job} applied={appliedIds.has(job.id)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
