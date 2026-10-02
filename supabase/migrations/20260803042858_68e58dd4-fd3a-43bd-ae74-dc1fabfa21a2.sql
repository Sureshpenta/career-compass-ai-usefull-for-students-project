ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_type text NOT NULL DEFAULT 'Job';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS stipend_min integer NOT NULL DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS stipend_max integer NOT NULL DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS duration_months integer;
CREATE INDEX IF NOT EXISTS jobs_job_type_idx ON public.jobs (job_type);