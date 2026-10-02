import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, Sparkles, Copy, Wand2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { generateBestResume } from "@/lib/resume-builder.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/resume-builder")({
  head: () => ({
    meta: [
      { title: "Build my best resume — CareerFit India" },
      {
        name: "description",
        content:
          "Generate an ATS-optimised resume from your upload, see exactly what is missing and what to add.",
      },
      { property: "og:title", content: "Build my best resume — CareerFit India" },
      {
        property: "og:description",
        content: "AI rewrites your resume, lists missing items and shows before/after bullets.",
      },
    ],
  }),
  component: ResumeBuilder,
});

function ResumeBuilder() {
  const build = useServerFn(generateBestResume);
  const [targetRole, setTargetRole] = useState("");

  const mutation = useMutation({
    mutationFn: () => build({ data: { targetRole } }),
    onError: (error: Error) => toast.error(error.message),
  });

  const result = mutation.data;

  function download() {
    if (!result) return;
    const blob = new Blob([result.resume_markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "best-resume.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.resume_markdown);
    toast.success("Resume copied");
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Build my best resume</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            We rewrite your uploaded resume into an ATS-friendly version, then show what was missing
            and exactly what to add.
          </p>
        </div>

        <div className="surface-panel flex flex-wrap items-end gap-3 rounded-2xl p-5">
          <div className="min-w-56 flex-1">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Target role (optional)
            </label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Data Analyst, Bengaluru"
              className="mt-2"
            />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {mutation.isPending ? "Writing your resume…" : "Generate best resume"}
          </Button>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="surface-panel rounded-2xl p-5 lg:col-span-1">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="size-4" /> Expected ATS score
                </p>
                <p className="mt-3 font-display text-4xl font-semibold text-primary">
                  {result.expected_ats_score}
                  <span className="text-lg text-muted-foreground">/100</span>
                </p>
                <Progress value={result.expected_ats_score} className="mt-4 h-1.5" />
                <p className="mt-4 text-sm font-medium">{result.headline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {result.keywords_to_include.map((kw) => (
                    <Badge key={kw} className="bg-primary/15 text-primary">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="surface-panel rounded-2xl p-5 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-base font-semibold">Your new resume</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={copy}>
                      <Copy className="size-4" /> Copy
                    </Button>
                    <Button size="sm" onClick={download}>
                      <Download className="size-4" /> Download
                    </Button>
                  </div>
                </div>
                <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl bg-secondary/40 p-4 text-sm leading-relaxed">
                  {result.resume_markdown}
                </pre>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="surface-panel rounded-2xl p-5">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                  <ListChecks className="size-4 text-primary" /> What was missing & what to add
                </h2>
                <ul className="mt-4 space-y-4 text-sm">
                  {result.missing_items.map((item) => (
                    <li key={item.item}>
                      <p className="font-medium">{item.item}</p>
                      <p className="mt-1 text-muted-foreground">{item.why}</p>
                      <p className="mt-1 text-primary">Add it: {item.how_to_add}</p>
                    </li>
                  ))}
                </ul>
                {result.added_sections.length > 0 && (
                  <>
                    <h3 className="mt-6 text-sm font-semibold">Sections added / restructured</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.added_sections.map((s) => (
                        <Badge key={s} variant="outline" className="text-muted-foreground">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="surface-panel rounded-2xl p-5">
                <h2 className="font-display text-base font-semibold">Bullet rewrites</h2>
                <ul className="mt-4 space-y-4 text-sm">
                  {result.before_after_bullets.map((b) => (
                    <li key={b.after}>
                      <p className="text-muted-foreground line-through">{b.before}</p>
                      <p className="mt-1 font-medium text-primary">{b.after}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
