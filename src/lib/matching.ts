export type JobRow = {
  id: string;
  title: string;
  company: string;
  state: string;
  city: string;
  work_mode: string;
  experience_min: number;
  experience_max: number;
  salary_min: number;
  salary_max: number;
  required_skills: string[];
  fresher_friendly: boolean;
  company_rating: number;
  source: string;
  apply_url: string;
  description: string | null;
  posted_at: string;
  job_type: string;
  stipend_min: number;
  stipend_max: number;
  duration_months: number | null;
};

export type ScoredJob = JobRow & {
  matchPercent: number;
  matchedSkills: string[];
  gapSkills: string[];
  score: number;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function skillOverlap(resumeSkills: string[], jobSkills: string[]) {
  const have = resumeSkills.map(normalize).filter(Boolean);
  const matched: string[] = [];
  const gaps: string[] = [];

  for (const skill of jobSkills) {
    const target = normalize(skill);
    const hit = have.some((own) => own === target || own.includes(target) || target.includes(own));
    if (hit) matched.push(skill);
    else gaps.push(skill);
  }

  return { matched, gaps };
}

export function scoreJob(
  job: JobRow,
  opts: { skills: string[]; experienceYears: number; preferredStates?: string[] },
): ScoredJob {
  const { matched, gaps } = skillOverlap(opts.skills, job.required_skills);
  const total = job.required_skills.length || 1;
  const matchPercent = Math.round((matched.length / total) * 100);

  const experienceFit =
    opts.experienceYears >= job.experience_min && opts.experienceYears <= job.experience_max + 1
      ? 1
      : opts.experienceYears < job.experience_min
        ? Math.max(0, 1 - (job.experience_min - opts.experienceYears) / 4)
        : 0.85;

  const fresherBonus = opts.experienceYears < 1 && job.fresher_friendly ? 8 : 0;
  const salarySignal = Math.min(job.salary_max / 3500000, 1) * 10;
  const ratingSignal = (job.company_rating / 5) * 10;
  const locationBonus = opts.preferredStates?.includes(job.state) ? 6 : 0;

  const score =
    matchPercent * 0.6 +
    experienceFit * 20 +
    fresherBonus +
    salarySignal +
    ratingSignal +
    locationBonus;

  return {
    ...job,
    matchPercent,
    matchedSkills: matched,
    gapSkills: gaps,
    score: Math.round(score),
  };
}

export function rankJobs(
  jobs: JobRow[],
  opts: { skills: string[]; experienceYears: number; preferredStates?: string[] },
): ScoredJob[] {
  return jobs.map((job) => scoreJob(job, opts)).sort((a, b) => b.score - a.score);
}

export function formatInr(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} LPA`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
