import { useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { analyzeResume } from "@/lib/resume.functions";
import { extractResumeText } from "@/lib/resume-extract";
import { Button } from "@/components/ui/button";

export function ResumeUploader({ compact = false }: { compact?: boolean }) {
  const analyze = useServerFn(analyzeResume);
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setStage("Reading your resume…");
      const text = await extractResumeText(file);
      if (text.length < 80) {
        throw new Error("We couldn't read enough text — try a text-based PDF or a DOCX file.");
      }
      setStage("Analyzing skills, ATS score and role fit…");
      return analyze({ data: { fileName: file.name, text } });
    },
    onSuccess: async () => {
      setStage(null);
      toast.success("Resume analyzed");
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      setStage(null);
      toast.error(error.message);
    },
  });

  const demoMutation = useMutation({
    mutationFn: async () => {
      setStage("Analyzing skills, ATS score and role fit…");
      const sampleText = `
        Rahul Sharma
        Email: rahul.sharma@example.com | Phone: +91 98765 43210
        Summary: Experienced Full Stack Software Engineer with 3+ years of hands-on experience building scalable web applications using React, TypeScript, Node.js, Python, PostgreSQL, REST APIs, Git, and Docker.
        
        Experience:
        Software Engineer — TechCorp India (2022 – Present)
        - Developed responsive single-page web applications with React and TypeScript.
        - Built robust microservices and RESTful API endpoints using Node.js and Express.
        - Optimized database queries in PostgreSQL, improving data retrieval performance by 35%.

        Education:
        B.Tech in Computer Science & Engineering — Indian Institute of Technology (2018 – 2022)

        Skills:
        JavaScript, TypeScript, React, Node.js, Python, HTML5, CSS3, Tailwind CSS, SQL, PostgreSQL, MongoDB, Git, GitHub, REST APIs, Docker, System Design, Data Structures & Algorithms.
      `;
      return analyze({ data: { fileName: "Rahul_Sharma_Resume.pdf", text: sampleText } });
    },
    onSuccess: async () => {
      setStage(null);
      toast.success("Resume analyzed successfully!");
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      setStage(null);
      toast.error(error.message);
    },
  });

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) mutation.mutate(file);
  }

  const isBusy = mutation.isPending || demoMutation.isPending;

  return (
    <div className={compact ? "" : "surface-panel rounded-2xl p-6 text-center sm:p-10"}>
      {!compact && (
        <>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <FileUp className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold">Upload your resume</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            PDF or DOCX. We extract your details, score them against ATS rules and match you to jobs
            across India.
          </p>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <label className="inline-flex">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={onPick}
            disabled={isBusy}
          />
          <Button asChild size={compact ? "sm" : "lg"} disabled={isBusy}>
            <span>
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileUp className="size-4" />
              )}
              {mutation.isPending
                ? "Analyzing…"
                : compact
                  ? "Upload new resume"
                  : "Choose resume file"}
            </span>
          </Button>
        </label>

        {!compact && (
          <Button
            size="lg"
            variant="secondary"
            disabled={isBusy}
            onClick={() => demoMutation.mutate()}
          >
            {demoMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4 text-emerald-400" />
            )}
            ⚡ Try Demo Resume
          </Button>
        )}
      </div>

      {stage && <p className="mt-3 text-xs text-muted-foreground">{stage}</p>}
    </div>
  );
}
