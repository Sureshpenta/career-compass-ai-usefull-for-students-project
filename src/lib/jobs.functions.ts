import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import type { JobRow } from "@/lib/matching";

const JOB_COLUMNS =
  "id, title, company, state, city, work_mode, experience_min, experience_max, salary_min, salary_max, required_skills, fresher_friendly, company_rating, source, apply_url, description, posted_at, job_type, stipend_min, stipend_max, duration_months";

function publicClient() {
  const url = process.env["SUPABASE_URL"] || "https://qhaujsjvgewewvitvdzt.supabase.co";
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_Cg-Z_dBFErbh4ZIkWR4vCQ_u1ZGQLbS";
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const FALLBACK_JOBS: JobRow[] = [
  {
    id: "int-001-google-ai",
    title: "AI & Machine Learning Research Intern",
    company: "Google Research India",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 2,
    salary_min: 720000,
    salary_max: 1020000,
    stipend_min: 60000,
    stipend_max: 85000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "NLP"],
    fresher_friendly: true,
    company_rating: 4.7,
    source: "Company Careers",
    apply_url: "https://careers.google.com/",
    description: "6-month paid AI research internship working on Large Language Models and Indic NLP models for freshers and early career researchers (0-2 years exp).",
    posted_at: "2026-10-01",
  },
  {
    id: "int-002-swiggy-fe",
    title: "Frontend Developer Intern",
    company: "Swiggy",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 1,
    salary_min: 420000,
    salary_max: 600000,
    stipend_min: 35000,
    stipend_max: 50000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    fresher_friendly: true,
    company_rating: 4.2,
    source: "LinkedIn",
    apply_url: "https://careers.swiggy.com/",
    description: "Build high-performance web interfaces and mobile-first microfrontends. Ideal for freshers and candidates with up to 1 year of project experience.",
    posted_at: "2026-10-01",
  },
  {
    id: "int-003-phonepe-da",
    title: "Data Analyst Intern",
    company: "PhonePe",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 2,
    salary_min: 360000,
    salary_max: 540000,
    stipend_min: 30000,
    stipend_max: 45000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["SQL", "Python", "Excel", "Power BI", "Tableau", "Statistics"],
    fresher_friendly: true,
    company_rating: 4.3,
    source: "Internshala",
    apply_url: "https://phonepe.com/careers/",
    description: "Analyze fintech transactional data, generate merchant insights, and build interactive executive dashboards. Open for freshers & 0-2 years exp.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-004-razorpay-py",
    title: "Python Backend Engineering Intern",
    company: "Razorpay",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Remote",
    experience_min: 0,
    experience_max: 2,
    salary_min: 480000,
    salary_max: 720000,
    stipend_min: 40000,
    stipend_max: 60000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Python", "FastAPI", "Django", "PostgreSQL", "REST API", "Docker"],
    fresher_friendly: true,
    company_rating: 4.4,
    source: "Company Careers",
    apply_url: "https://razorpay.com/jobs/",
    description: "Develop scalable payment gateway API services and webhooks. Remote internship for freshers to 2 years experience.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-005-zoho-fs",
    title: "Full Stack Developer Intern",
    company: "Zoho Corporation",
    state: "Tamil Nadu",
    city: "Chennai",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 1,
    salary_min: 300000,
    salary_max: 480000,
    stipend_min: 25000,
    stipend_max: 40000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["JavaScript", "React", "Node.js", "Java", "MySQL", "Git"],
    fresher_friendly: true,
    company_rating: 4.5,
    source: "Company Careers",
    apply_url: "https://www.zoho.com/careers/",
    description: "End-to-end product development for enterprise SaaS tools. Freshers and candidates with 0-1 year experience preferred.",
    posted_at: "2026-10-01",
  },
  {
    id: "int-006-ms-devops",
    title: "Cloud & DevOps Engineering Intern",
    company: "Microsoft",
    state: "Telangana",
    city: "Hyderabad",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 3,
    salary_min: 600000,
    salary_max: 900000,
    stipend_min: 50000,
    stipend_max: 75000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Azure", "Docker", "Kubernetes", "Linux", "Python", "Git", "CI/CD"],
    fresher_friendly: true,
    company_rating: 4.6,
    source: "Company Careers",
    apply_url: "https://careers.microsoft.com/",
    description: "Automate Azure infrastructure deployment, CI/CD pipelines, and cloud monitoring. Open to freshers and 0-3 years experienced professionals.",
    posted_at: "2026-10-01",
  },
  {
    id: "int-007-paytm-java",
    title: "Java Microservices Intern",
    company: "Paytm",
    state: "Uttar Pradesh",
    city: "Noida",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 2,
    salary_min: 360000,
    salary_max: 540000,
    stipend_min: 30000,
    stipend_max: 45000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Java", "Spring Boot", "SQL", "Microservices", "Kafka", "REST API"],
    fresher_friendly: true,
    company_rating: 3.8,
    source: "Naukri",
    apply_url: "https://paytm.com/careers",
    description: "Hands-on experience building high-throughput payment microservices. Suitable for 0-2 years experience.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-008-fractal-genai",
    title: "Generative AI & LLM Engineering Intern",
    company: "Fractal Analytics",
    state: "Maharashtra",
    city: "Mumbai",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 3,
    salary_min: 540000,
    salary_max: 840000,
    stipend_min: 45000,
    stipend_max: 70000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Python", "PyTorch", "LangChain", "Transformers", "OpenAI API", "Vector Databases"],
    fresher_friendly: true,
    company_rating: 4.1,
    source: "LinkedIn",
    apply_url: "https://fractal.ai/careers/",
    description: "Work on enterprise RAG pipelines, fine-tuning LLMs, and AI agents. Open for freshers and engineers up to 3 years experience.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-009-cred-uiux",
    title: "UI/UX Product Design Intern",
    company: "CRED",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 2,
    salary_min: 420000,
    salary_max: 660000,
    stipend_min: 35000,
    stipend_max: 55000,
    duration_months: 3,
    job_type: "Internship",
    required_skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping", "Design Systems"],
    fresher_friendly: true,
    company_rating: 4.4,
    source: "Company Careers",
    apply_url: "https://cred.club/careers",
    description: "Design sleek, modern fintech user interfaces and micro-interactions. Freshers with a portfolio or up to 2 yrs exp.",
    posted_at: "2026-10-01",
  },
  {
    id: "int-010-flipkart-de",
    title: "Data Engineering Intern",
    company: "Flipkart",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 2,
    salary_min: 480000,
    salary_max: 780000,
    stipend_min: 40000,
    stipend_max: 65000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Python", "SQL", "Spark", "Airflow", "ETL", "Hadoop"],
    fresher_friendly: true,
    company_rating: 4.2,
    source: "LinkedIn",
    apply_url: "https://www.flipkartcareers.com/",
    description: "Build scalable data pipelines processing petabytes of e-commerce data. Freshers & 0-2 years exp.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-011-tcs-cyber",
    title: "Cybersecurity Analyst Intern",
    company: "TCS Cyber Security",
    state: "Telangana",
    city: "Hyderabad",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 1,
    salary_min: 240000,
    salary_max: 420000,
    stipend_min: 20000,
    stipend_max: 35000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Networking", "Linux", "Ethical Hacking", "Python", "SIEM", "SOC"],
    fresher_friendly: true,
    company_rating: 3.9,
    source: "Naukri",
    apply_url: "https://www.tcs.com/careers",
    description: "Monitor security operations center (SOC) alerts, vulnerability assessments, and log analysis for freshers.",
    posted_at: "2026-10-01",
  },
  {
    id: "int-012-deloitte-ba",
    title: "Business Analytics Intern",
    company: "Deloitte",
    state: "Haryana",
    city: "Gurugram",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 2,
    salary_min: 360000,
    salary_max: 600000,
    stipend_min: 30000,
    stipend_max: 50000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Excel", "SQL", "Power BI", "Requirement Gathering", "Business Analysis"],
    fresher_friendly: true,
    company_rating: 4.1,
    source: "LinkedIn",
    apply_url: "https://www2.deloitte.com/careers",
    description: "Help global client teams with data modeling, process mapping, and strategy consulting. 0-2 yrs exp.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-013-zomato-mobile",
    title: "Mobile Application Developer Intern (Flutter/React Native)",
    company: "Zomato",
    state: "Haryana",
    city: "Gurugram",
    work_mode: "Hybrid",
    experience_min: 0,
    experience_max: 2,
    salary_min: 420000,
    salary_max: 600000,
    stipend_min: 35000,
    stipend_max: 50000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Flutter", "React Native", "JavaScript", "Dart", "REST API", "State Management"],
    fresher_friendly: true,
    company_rating: 4.0,
    source: "Company Careers",
    apply_url: "https://www.zomato.com/careers",
    description: "Develop mobile app features for food delivery & hyper-local logistics. 0-2 yrs exp friendly.",
    posted_at: "2026-10-02",
  },
  {
    id: "int-014-ather-embedded",
    title: "Embedded Systems & Firmware Intern",
    company: "Ather Energy",
    state: "Karnataka",
    city: "Bengaluru",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 2,
    salary_min: 360000,
    salary_max: 540000,
    stipend_min: 30000,
    stipend_max: 45000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["C", "C++", "Embedded Systems", "Microcontrollers", "RTOS", "CAN Bus"],
    fresher_friendly: true,
    company_rating: 4.2,
    source: "Company Careers",
    apply_url: "https://www.atherenergy.com/careers",
    description: "Write firmware for electric vehicle battery management systems and dashboard clusters. 0-2 years exp.",
    posted_at: "2026-10-01",
  },
  {
    id: "int-015-iiit-nlp",
    title: "NLP & AI Research Intern",
    company: "IIIT Hyderabad Labs",
    state: "Telangana",
    city: "Hyderabad",
    work_mode: "Onsite",
    experience_min: 0,
    experience_max: 1,
    salary_min: 300000,
    salary_max: 420000,
    stipend_min: 25000,
    stipend_max: 35000,
    duration_months: 6,
    job_type: "Internship",
    required_skills: ["Python", "PyTorch", "NLP", "Machine Learning", "Transformers"],
    fresher_friendly: true,
    company_rating: 4.5,
    source: "Internshala",
    apply_url: "https://internshala.com/internships/",
    description: "Academic and industrial research internship in Indian language NLP, speech synthesis, and ML.",
    posted_at: "2026-10-02",
  },
];

export function enrichJobsWithDynamicDailyDates(jobs: JobRow[]): JobRow[] {
  const today = new Date();

  return jobs.map((job, idx) => {
    // Distribute posting dates over the last 0 to 6 days relative to current date
    const daysAgo = idx % 7;
    const postDate = new Date(today);
    postDate.setDate(today.getDate() - daysAgo);

    const formattedDate = (postDate.toISOString().split("T")[0] as string) || (today.toISOString().split("T")[0] as string);

    return {
      ...job,
      posted_at: formattedDate,
    };
  });
}

export const listJobs = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await publicClient()
      .from("jobs")
      .select(JOB_COLUMNS)
      .order("posted_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return enrichJobsWithDynamicDailyDates(data as unknown as JobRow[]);
    }
  } catch {
    // Fallback
  }
  return enrichJobsWithDynamicDailyDates(FALLBACK_JOBS);
});

const demoApplicationsStore = new Map<
  string,
  { id: string; status: string; match_percent: number; created_at: string; job_id: string }
>();

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { data, error } = await context.supabase
        .from("applications")
        .select(`id, status, match_percent, notes, created_at, job:jobs(${JOB_COLUMNS})`)
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    } catch {
      // Fall through to in-memory store
    }
    const apps = Array.from(demoApplicationsStore.values());
    const allJobs = await listJobs();
    return apps.map((app) => ({
      ...app,
      job: allJobs.find((j) => j.id === app.job_id) || null,
    }));
  });

export const trackApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({ jobId: z.string(), matchPercent: z.number().int().min(0).max(100) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const appId = "demo-app-" + data.jobId;
    demoApplicationsStore.set(appId, {
      id: appId,
      job_id: data.jobId,
      match_percent: data.matchPercent,
      status: "applied",
      created_at: new Date().toISOString(),
    });

    try {
      await context.supabase.from("applications").upsert(
        {
          user_id: context.userId,
          job_id: data.jobId,
          match_percent: data.matchPercent,
          status: "applied",
        },
        { onConflict: "user_id,job_id" },
      );
    } catch {
      // Ignore DB errors in local demo mode
    }
    return { ok: true };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["applied", "interview", "selected", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const app = demoApplicationsStore.get(data.id);
    if (app) {
      app.status = data.status;
    }

    try {
      await context.supabase
        .from("applications")
        .update({ status: data.status })
        .eq("id", data.id)
        .eq("user_id", context.userId);
    } catch {
      // Ignore DB errors in local demo mode
    }
    return { ok: true };
  });

export const removeApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    demoApplicationsStore.delete(data.id);

    try {
      await context.supabase
        .from("applications")
        .delete()
        .eq("id", data.id)
        .eq("user_id", context.userId);
    } catch {
      // Ignore DB errors in local demo mode
    }
    return { ok: true };
  });
