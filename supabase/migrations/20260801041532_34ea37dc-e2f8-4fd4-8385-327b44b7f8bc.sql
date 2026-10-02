CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  missing_skills TEXT[] NOT NULL DEFAULT '{}',
  education JSONB NOT NULL DEFAULT '[]',
  projects JSONB NOT NULL DEFAULT '[]',
  certifications JSONB NOT NULL DEFAULT '[]',
  experience JSONB NOT NULL DEFAULT '[]',
  total_experience_years NUMERIC NOT NULL DEFAULT 0,
  ats_score INTEGER NOT NULL DEFAULT 0,
  resume_score INTEGER NOT NULL DEFAULT 0,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  weaknesses TEXT[] NOT NULL DEFAULT '{}',
  suggestions TEXT[] NOT NULL DEFAULT '{}',
  predicted_roles JSONB NOT NULL DEFAULT '[]',
  salary_prediction JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER resumes_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX resumes_user_idx ON public.resumes (user_id, created_at DESC);

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  work_mode TEXT NOT NULL DEFAULT 'Onsite',
  experience_min NUMERIC NOT NULL DEFAULT 0,
  experience_max NUMERIC NOT NULL DEFAULT 2,
  salary_min INTEGER NOT NULL DEFAULT 0,
  salary_max INTEGER NOT NULL DEFAULT 0,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  fresher_friendly BOOLEAN NOT NULL DEFAULT false,
  company_rating NUMERIC NOT NULL DEFAULT 4.0,
  source TEXT NOT NULL DEFAULT 'Company Careers',
  apply_url TEXT NOT NULL,
  description TEXT,
  posted_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs public read" ON public.jobs FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX jobs_state_idx ON public.jobs (state);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied',
  match_percent INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.jobs (title, company, state, city, work_mode, experience_min, experience_max, salary_min, salary_max, required_skills, fresher_friendly, company_rating, source, apply_url, description) VALUES
('Data Analyst','Infosys','Karnataka','Bengaluru','Hybrid',0,2,450000,750000,'{SQL,Excel,Python,Power BI,Statistics}',true,3.9,'Naukri','https://www.infosys.com/careers/','Analyse business data and build dashboards for enterprise clients.'),
('Data Scientist','Flipkart','Karnataka','Bengaluru','Onsite',2,5,1600000,2800000,'{Python,Machine Learning,SQL,Pandas,Scikit-learn,Statistics}',false,4.1,'LinkedIn','https://www.flipkartcareers.com/','Build demand forecasting and recommendation models.'),
('AI Engineer','Fractal Analytics','Maharashtra','Mumbai','Hybrid',1,4,1200000,2200000,'{Python,PyTorch,Transformers,NLP,Docker}',false,4.0,'LinkedIn','https://fractal.ai/careers/','Ship LLM-powered products for Fortune 500 clients.'),
('Python Developer','TCS','Tamil Nadu','Chennai','Onsite',0,3,400000,800000,'{Python,Django,SQL,REST API,Git}',true,3.8,'Naukri','https://www.tcs.com/careers','Develop backend services for banking clients.'),
('Full Stack Developer','Zoho','Tamil Nadu','Chennai','Onsite',1,4,900000,1600000,'{JavaScript,React,Node.js,MySQL,REST API}',false,4.3,'Company Careers','https://www.zoho.com/careers/','Build product features end to end.'),
('Business Analyst','Deloitte','Telangana','Hyderabad','Hybrid',1,3,700000,1300000,'{SQL,Excel,Power BI,Requirement Gathering,Communication}',false,4.0,'LinkedIn','https://www2.deloitte.com/careers','Bridge business teams and engineering.'),
('Software Engineer','Microsoft','Telangana','Hyderabad','Hybrid',1,4,1800000,3200000,'{C#,Data Structures,Algorithms,Azure,SQL}',false,4.5,'Company Careers','https://careers.microsoft.com/','Work on cloud platform services.'),
('Machine Learning Engineer','Amazon','Karnataka','Bengaluru','Onsite',2,5,2000000,3500000,'{Python,TensorFlow,AWS,SQL,Machine Learning}',false,4.2,'LinkedIn','https://amazon.jobs/','Own ML pipelines for retail personalisation.'),
('Data Analyst Intern','Internshala Partner Startup','Delhi','New Delhi','Remote',0,1,180000,300000,'{Excel,SQL,Python,Data Visualization}',true,3.6,'Internshala','https://internshala.com/internships/','Six month paid analytics internship.'),
('Frontend Developer','Swiggy','Karnataka','Bengaluru','Hybrid',1,3,1100000,1900000,'{React,TypeScript,CSS,JavaScript,Redux}',false,4.1,'Company Careers','https://careers.swiggy.com/','Build consumer-facing web experiences.'),
('Backend Developer','Razorpay','Karnataka','Bengaluru','Remote',2,5,1500000,2600000,'{Java,Spring Boot,SQL,Kafka,Microservices}',false,4.2,'LinkedIn','https://razorpay.com/jobs/','Scale payment infrastructure.'),
('Data Engineer','Wipro','Andhra Pradesh','Visakhapatnam','Onsite',1,4,700000,1400000,'{Python,SQL,Spark,ETL,Airflow}',false,3.7,'Naukri','https://careers.wipro.com/','Build data pipelines for analytics platforms.'),
('Python Developer','Cognizant','Andhra Pradesh','Vijayawada','Hybrid',0,2,380000,650000,'{Python,Flask,SQL,Git,Linux}',true,3.8,'Naukri','https://careers.cognizant.com/','Entry level backend development role.'),
('Software Engineer Trainee','Tech Mahindra','Telangana','Hyderabad','Onsite',0,1,350000,500000,'{Java,SQL,Data Structures,Problem Solving}',true,3.7,'Naukri','https://careers.techmahindra.com/','Fresher training and deployment programme.'),
('AI Research Intern','IIIT Hyderabad Lab','Telangana','Hyderabad','Onsite',0,1,240000,360000,'{Python,PyTorch,NLP,Research}',true,4.4,'Internshala','https://internshala.com/internships/','Research internship in applied NLP.'),
('Business Analyst','ICICI Bank','Maharashtra','Mumbai','Onsite',2,5,900000,1600000,'{SQL,Excel,Tableau,Banking Domain,Stakeholder Management}',false,3.9,'Naukri','https://www.icicicareers.com/','Analytics for retail banking products.'),
('Full Stack Developer','Persistent Systems','Maharashtra','Pune','Hybrid',1,4,800000,1500000,'{React,Node.js,MongoDB,JavaScript,Docker}',false,3.8,'Naukri','https://www.persistent.com/careers/','Product engineering for global clients.'),
('DevOps Engineer','Nvidia','Maharashtra','Pune','Hybrid',3,6,2000000,3400000,'{Kubernetes,Docker,AWS,Terraform,Linux}',false,4.6,'LinkedIn','https://nvidia.com/careers','Own CI/CD for GPU cloud services.'),
('Data Scientist','Jio Platforms','Gujarat','Ahmedabad','Onsite',2,5,1300000,2300000,'{Python,Machine Learning,SQL,Statistics,Deep Learning}',false,3.9,'LinkedIn','https://careers.jio.com/','Telecom churn and network analytics.'),
('Python Developer','Torrent Group','Gujarat','Ahmedabad','Onsite',1,3,600000,1000000,'{Python,Pandas,SQL,Automation,APIs}',false,3.7,'Indeed','https://in.indeed.com/','Automate reporting and internal tooling.'),
('Software Engineer','Ather Energy','Karnataka','Bengaluru','Onsite',1,4,1400000,2400000,'{Python,C++,Embedded,Linux,Git}',false,4.0,'Company Careers','https://www.atherenergy.com/careers','Firmware and cloud for EV platform.'),
('Data Analyst','Byjus','Karnataka','Bengaluru','Hybrid',0,2,500000,900000,'{SQL,Excel,Python,Power BI,Google Analytics}',true,3.4,'Naukri','https://byjus.com/careers/','Growth and product analytics.'),
('Full Stack Developer','QBurst','Kerala','Kochi','Hybrid',1,3,600000,1200000,'{React,Node.js,PostgreSQL,JavaScript,AWS}',true,3.9,'Naukri','https://www.qburst.com/careers','Build web apps for international clients.'),
('AI Engineer','Nference','Kerala','Thiruvananthapuram','Remote',2,5,1600000,2600000,'{Python,Transformers,NLP,MLOps,Docker}',false,4.1,'LinkedIn','https://nference.com/careers','Biomedical NLP model development.'),
('Data Analyst','Kerala Startup Mission','Kerala','Kochi','Onsite',0,2,360000,600000,'{Excel,SQL,Tableau,Statistics}',true,3.8,'Company Careers','https://startupmission.kerala.gov.in/','Support startup ecosystem analytics.'),
('Software Engineer','Paytm','Uttar Pradesh','Noida','Hybrid',1,4,1200000,2100000,'{Java,Spring Boot,SQL,Kafka,Redis}',false,3.6,'LinkedIn','https://paytm.com/careers','Payments backend engineering.'),
('Frontend Developer','Adobe','Uttar Pradesh','Noida','Hybrid',2,5,1900000,3200000,'{React,JavaScript,TypeScript,CSS,Testing}',false,4.4,'Company Careers','https://adobe.com/careers','Creative Cloud web surfaces.'),
('Business Analyst','HCLTech','Uttar Pradesh','Lucknow','Onsite',1,3,550000,950000,'{SQL,Excel,Documentation,Agile,Communication}',true,3.7,'Naukri','https://www.hcltech.com/careers','Client-facing analysis for IT projects.'),
('Data Scientist','Zomato','Haryana','Gurugram','Hybrid',2,5,1700000,2900000,'{Python,SQL,Machine Learning,Experimentation,Statistics}',false,3.9,'LinkedIn','https://www.zomato.com/careers','Pricing and delivery time modelling.'),
('Python Developer','American Express','Haryana','Gurugram','Hybrid',1,4,1300000,2200000,'{Python,SQL,Spark,APIs,Git}',false,4.3,'Company Careers','https://www.americanexpress.com/en-us/careers/','Risk and fraud data engineering.'),
('Software Engineer','Josh Technology','Haryana','Gurugram','Onsite',0,2,900000,1600000,'{Python,Django,JavaScript,Data Structures,SQL}',true,4.1,'Company Careers','https://joshtechnologygroup.com/careers/','Fresher-friendly product engineering.'),
('Data Analyst','ITC Limited','West Bengal','Kolkata','Onsite',1,3,600000,1000000,'{SQL,Excel,Power BI,FMCG Analytics}',false,4.0,'Naukri','https://www.itcportal.com/careers/','Sales and supply chain analysis.'),
('Full Stack Developer','TCS','West Bengal','Kolkata','Hybrid',1,4,600000,1200000,'{React,Java,SQL,Spring Boot,Git}',true,3.8,'Naukri','https://www.tcs.com/careers','Full stack delivery for BFSI clients.'),
('AI Engineer','Indian Institute of Technology Kharagpur','West Bengal','Kharagpur','Onsite',0,2,500000,900000,'{Python,Machine Learning,PyTorch,Research}',true,4.5,'Company Careers','https://www.iitkgp.ac.in/','Applied AI project engineer.'),
('Data Engineer','Infosys','Madhya Pradesh','Indore','Onsite',1,4,650000,1200000,'{Python,SQL,Spark,ETL,Cloud}',false,3.9,'Naukri','https://www.infosys.com/careers/','Data platform development.'),
('Python Developer','Impetus','Madhya Pradesh','Indore','Hybrid',0,3,500000,1000000,'{Python,PySpark,SQL,Linux,Git}',true,3.7,'Indeed','https://in.indeed.com/','Big data application development.'),
('Software Engineer','Cognizant','Rajasthan','Jaipur','Onsite',0,2,400000,700000,'{Java,SQL,Data Structures,Spring}',true,3.8,'Naukri','https://careers.cognizant.com/','Fresher software engineering role.'),
('Data Analyst','Genpact','Rajasthan','Jaipur','Hybrid',1,3,500000,900000,'{SQL,Excel,Python,Power BI}',true,3.7,'Naukri','https://www.genpact.com/careers','Operational analytics for clients.'),
('Business Analyst','Mahindra Group','Punjab','Mohali','Onsite',2,4,700000,1200000,'{SQL,Excel,Process Mapping,Agile}',false,4.0,'Naukri','https://www.mahindracareers.com/','Digital transformation analysis.'),
('Full Stack Developer','Grazitti Interactive','Punjab','Panchkula','Hybrid',1,3,500000,1000000,'{React,Node.js,MySQL,JavaScript}',true,3.9,'Indeed','https://in.indeed.com/','Web engineering for SaaS clients.'),
('Python Developer','Chandigarh IT Park Startup','Chandigarh','Chandigarh','Remote',0,2,420000,780000,'{Python,FastAPI,SQL,Git,Docker}',true,3.8,'Internshala','https://internshala.com/jobs/','Backend developer for early stage product.'),
('Data Scientist','Bosch','Karnataka','Bengaluru','Hybrid',3,6,2100000,3300000,'{Python,Machine Learning,Computer Vision,SQL,Docker}',false,4.2,'LinkedIn','https://www.bosch.in/careers/','Vision models for automotive systems.'),
('AI Engineer','Ola Krutrim','Karnataka','Bengaluru','Onsite',1,4,1800000,3000000,'{Python,LLM,Transformers,PyTorch,Distributed Training}',false,3.8,'LinkedIn','https://krutrim.ai/careers','Train and serve Indic language models.'),
('Software Engineer','Freshworks','Tamil Nadu','Chennai','Hybrid',1,4,1400000,2400000,'{Ruby,JavaScript,SQL,REST API,AWS}',false,4.2,'Company Careers','https://www.freshworks.com/company/careers/','SaaS product engineering.'),
('Data Analyst','Chennai Analytics Hub','Tamil Nadu','Coimbatore','Onsite',0,2,360000,650000,'{Excel,SQL,Python,Statistics}',true,3.6,'Indeed','https://in.indeed.com/','Reporting and insights for retail clients.'),
('Business Analyst','Accenture','Maharashtra','Pune','Hybrid',1,4,750000,1400000,'{SQL,Excel,Agile,Documentation,Communication}',false,4.0,'Naukri','https://www.accenture.com/in-en/careers','Consulting analyst for digital projects.'),
('Data Engineer','Reliance Retail','Maharashtra','Navi Mumbai','Onsite',2,5,1200000,2000000,'{Python,SQL,Databricks,Spark,Azure}',false,3.8,'Naukri','https://careers.ril.com/','Retail data lakehouse engineering.'),
('Full Stack Developer','Delhivery','Delhi','New Delhi','Hybrid',2,5,1500000,2500000,'{React,Node.js,PostgreSQL,AWS,TypeScript}',false,3.7,'LinkedIn','https://www.delhivery.com/careers/','Logistics platform development.'),
('Data Scientist','NITI Aayog Data Cell','Delhi','New Delhi','Onsite',1,4,900000,1500000,'{Python,Statistics,SQL,Machine Learning,Policy Analytics}',false,4.1,'Company Careers','https://www.niti.gov.in/','Public policy data science.'),
('Software Engineer','Odisha Digital Services','Odisha','Bhubaneswar','Onsite',0,3,450000,850000,'{Java,SQL,Spring Boot,Git}',true,3.6,'Indeed','https://in.indeed.com/','E-governance application development.'),
('Data Analyst','Tata Steel','Jharkhand','Jamshedpur','Onsite',1,4,700000,1300000,'{SQL,Excel,Power BI,Manufacturing Analytics}',false,4.1,'Naukri','https://www.tatasteel.com/careers/','Plant performance analytics.'),
('Python Developer','Assam IT Services','Assam','Guwahati','Hybrid',0,2,360000,650000,'{Python,Django,SQL,Git}',true,3.5,'Indeed','https://in.indeed.com/','Backend development for regional platforms.'),
('Full Stack Developer','Goa Tech Collective','Goa','Panaji','Remote',1,3,700000,1300000,'{React,Node.js,MongoDB,TypeScript}',true,3.9,'Internshala','https://internshala.com/jobs/','Remote-first product team.'),
('Data Analyst','Chhattisgarh Power Analytics','Chhattisgarh','Raipur','Onsite',0,3,400000,750000,'{SQL,Excel,Python,Power BI}',true,3.5,'Indeed','https://in.indeed.com/','Utility consumption analytics.'),
('Software Engineer','Uttarakhand Fintech Labs','Uttarakhand','Dehradun','Hybrid',1,3,600000,1100000,'{Java,Spring Boot,SQL,React}',true,3.7,'Indeed','https://in.indeed.com/','Fintech application engineering.'),
('AI Engineer','Bihar Innovation Cell','Bihar','Patna','Onsite',0,2,450000,850000,'{Python,Machine Learning,NLP,SQL}',true,3.5,'Internshala','https://internshala.com/jobs/','Applied AI for civic services.'),
('Data Scientist','Himachal Analytics','Himachal Pradesh','Shimla','Remote',2,4,1000000,1700000,'{Python,Machine Learning,SQL,Statistics}',false,3.8,'Indeed','https://in.indeed.com/','Tourism and agriculture forecasting.'),
('Business Analyst','J&K Bank Digital','Jammu and Kashmir','Srinagar','Onsite',1,3,500000,900000,'{SQL,Excel,Banking Domain,Documentation}',true,3.6,'Indeed','https://in.indeed.com/','Digital banking analysis.'),
('Python Developer','Telangana Growth Labs','Telangana','Warangal','Remote',0,2,400000,750000,'{Python,FastAPI,SQL,Docker,Git}',true,3.7,'Internshala','https://internshala.com/jobs/','Remote backend role for freshers.'),
('Full Stack Developer','Andhra Digital Corp','Andhra Pradesh','Tirupati','Onsite',0,3,420000,800000,'{React,Node.js,MySQL,JavaScript}',true,3.6,'Indeed','https://in.indeed.com/','Government digital platform work.');