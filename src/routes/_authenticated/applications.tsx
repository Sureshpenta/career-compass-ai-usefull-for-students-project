import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { listApplications, removeApplication, updateApplicationStatus } from "@/lib/jobs.functions";
import { formatInr, type JobRow } from "@/lib/matching";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications — CareerFit India" },
      {
        name: "description",
        content:
          "Track every job you applied to, update status from applied to interview or selected, and revisit apply links.",
      },
      { property: "og:title", content: "Applications — CareerFit India" },
      {
        property: "og:description",
        content: "Your application pipeline: applied, interview, selected, rejected.",
      },
    ],
  }),
  component: ApplicationsPage,
});

const STATUSES = ["applied", "interview", "selected", "rejected"] as const;

const STATUS_STYLE: Record<string, string> = {
  applied: "bg-secondary text-secondary-foreground",
  interview: "bg-amber-500/15 text-amber-400",
  selected: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
};

function ApplicationsPage() {
  const fetchApps = useServerFn(listApplications);
  const setStatus = useServerFn(updateApplicationStatus);
  const remove = useServerFn(removeApplication);
  const queryClient = useQueryClient();

  const appsQuery = useQuery({ queryKey: ["applications"], queryFn: () => fetchApps() });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: (typeof STATUSES)[number] }) =>
      setStatus({ data: vars }),
    onSuccess: async () => {
      toast.success("Status updated");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: async () => {
      toast.success("Removed");
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = appsQuery.data ?? [];
  const counts = STATUSES.map(
    (status) => [status, rows.filter((row) => row.status === status).length] as const,
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Application tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} tracked application{rows.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map(([status, count]) => (
            <div key={status} className="surface-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{status}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{count}</p>
            </div>
          ))}
        </div>

        {appsQuery.isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="surface-panel rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Nothing tracked yet. Apply from the Jobs page and it will show up here.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const job = row.job as unknown as JobRow | null;
              if (!job) return null;
              return (
                <div
                  key={row.id}
                  className="surface-panel flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-semibold">{job.title}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[row.status] ?? ""}`}
                      >
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {job.city}, {job.state}
                      </span>
                      <span>
                        {formatInr(job.salary_min)} – {formatInr(job.salary_max)}
                      </span>
                      <span>{row.match_percent}% match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={row.status}
                      onValueChange={(value) =>
                        statusMutation.mutate({
                          id: row.id,
                          status: value as (typeof STATUSES)[number],
                        })
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild size="sm" variant="secondary">
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                        Open
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeMutation.mutate(row.id)}
                      aria-label="Remove application"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
