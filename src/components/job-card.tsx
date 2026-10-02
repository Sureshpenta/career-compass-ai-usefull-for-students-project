import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, MapPin, Star, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { trackApplication } from "@/lib/jobs.functions";
import { formatInr, type ScoredJob } from "@/lib/matching";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function JobCard({ job, applied }: { job: ScoredJob; applied?: boolean }) {
  const track = useServerFn(trackApplication);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => track({ data: { jobId: job.id, matchPercent: job.matchPercent } }),
    onSuccess: async () => {
      toast.success("Saved to your applications");
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isInternship = job.job_type === "Internship";

  function getRelativeTime(postedAt: string) {
    if (!postedAt) return "Posted today";
    const postedDate = new Date(postedAt);
    const now = new Date();
    const diffTime = now.getTime() - postedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Posted today";
    if (diffDays === 1) return "Posted 1d ago";
    return `Posted ${diffDays}d ago`;
  }

  const relativeTime = getRelativeTime(job.posted_at);
  const isNewToday = relativeTime === "Posted today";

  return (
    <article className="surface-panel flex flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge
              variant={isInternship ? "secondary" : "outline"}
              className="text-[10px] uppercase tracking-wide"
            >
              {isInternship ? "Internship" : "Full-time"}
            </Badge>
            {isNewToday ? (
              <Badge className="bg-emerald-500/15 text-[10px] text-emerald-400 border-emerald-500/30">
                ⚡ New Today
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground">{relativeTime}</span>
            )}
            {isInternship && job.duration_months ? (
              <span className="text-[11px] text-muted-foreground">
                · {job.duration_months} months
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-base font-semibold leading-tight">{job.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-semibold text-primary">{job.matchPercent}%</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">match</p>
        </div>
      </div>

      <Progress value={job.matchPercent} className="h-1.5" />

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" />
          {job.city}, {job.state}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="size-3.5" />
          {job.experience_min}–{job.experience_max} yrs
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5" />
          {job.company_rating.toFixed(1)}
        </span>
        <span>{job.work_mode}</span>
        <span>{job.source}</span>
      </div>

      <p className="text-sm font-medium">
        {isInternship
          ? `${formatInr(job.stipend_min)} – ${formatInr(job.stipend_max)} / month`
          : `${formatInr(job.salary_min)} – ${formatInr(job.salary_max)}`}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {job.matchedSkills.map((skill) => (
          <Badge key={skill} variant="default" className="bg-primary/15 text-primary">
            {skill}
          </Badge>
        ))}
        {job.gapSkills.map((skill) => (
          <Badge key={skill} variant="outline" className="text-muted-foreground">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button asChild size="sm" onClick={() => mutation.mutate()}>
          <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
            Apply now
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={applied || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {applied ? "Tracked" : "Track application"}
        </Button>
      </div>
    </article>
  );
}
