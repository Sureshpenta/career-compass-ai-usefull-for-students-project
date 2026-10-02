import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileSearch,
  Gauge,
  MapPinned,
  IndianRupee,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerFit India — AI Resume Analyzer & Job Matcher" },
      {
        name: "description",
        content:
          "Upload a PDF or DOCX resume to get an ATS score, predicted roles, salary range and matched jobs across every Indian state.",
      },
      { property: "og:title", content: "CareerFit India — AI Resume Analyzer & Job Matcher" },
      {
        property: "og:description",
        content:
          "Upload a PDF or DOCX resume to get an ATS score, predicted roles, salary range and matched jobs across every Indian state.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume parsing",
    body: "Name, contact, education, skills, projects, certifications and experience extracted from PDF or DOCX.",
  },
  {
    icon: Gauge,
    title: "ATS score & gaps",
    body: "A 0–100 ATS score with strengths, weaknesses, missing skills and specific rewrite suggestions.",
  },
  {
    icon: Sparkles,
    title: "Role prediction",
    body: "Best-fit roles like Data Analyst, AI Engineer or Full Stack Developer with confidence scores.",
  },
  {
    icon: IndianRupee,
    title: "Salary prediction",
    body: "Minimum, average and maximum expected CTC based on your skills, education and experience.",
  },
  {
    icon: Building2,
    title: "Company matching",
    body: "Top 10 companies ranked on skill match, salary, rating, location and fresher friendliness.",
  },
  {
    icon: MapPinned,
    title: "State-wise opportunities",
    body: "Openings across Karnataka, Telangana, Tamil Nadu, Maharashtra, Delhi and every other state.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-display text-base font-semibold">
          CareerFit <span className="text-primary">India</span>
        </span>
        <Button asChild size="sm" variant="secondary">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          AI resume intelligence for the Indian job market
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
          Turn your resume into a <span className="text-gradient">ranked shortlist</span> of Indian
          jobs.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Upload once. Get an ATS score, skill gap report, predicted roles, expected salary and the
          companies most likely to hire you — mapped across all states and union territories.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Analyze my resume
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Browse matched jobs</Link>
          </Button>
        </div>

        <dl className="mt-14 grid gap-3 sm:grid-cols-3">
          {[
            ["0–100", "ATS score with fix list"],
            ["36", "States & UTs covered"],
            ["Top 10", "Companies ranked for you"],
          ].map(([value, label]) => (
            <div key={label} className="surface-panel rounded-2xl p-5">
              <dt className="font-display text-2xl font-semibold text-primary">{value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="font-display text-2xl font-semibold">Everything in one workflow</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="surface-panel rounded-2xl p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        CareerFit India · resume analysis, job matching and application tracking
      </footer>
    </div>
  );
}
