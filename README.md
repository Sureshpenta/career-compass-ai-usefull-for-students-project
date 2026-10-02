# Career Compass AI

Project Title: AI-Powered Resume Analyzer, Job Matcher, Salary Predictor, and India-Wide Job Application Assistant

Build a complete full-stack web application and mobile app that helps job seekers find suitable jobs based on their resume.

Core Features:

Resume Upload and Parsing

Allow users to upload PDF and DOCX resumes.

Extract:

Name

Email

Phone Number

Education

Skills

Projects

Certifications

Experience

Use NLP techniques to identify and categorize skills.

Resume Analysis

Generate an ATS score (0-100).

Identify missing skills for target roles.

Suggest resume improvements.

Highlight strengths and weaknesses.

AI Job Role Prediction

Predict the most suitable job roles based on resume content.

Examples:

Data Analyst

Data Scientist

AI Engineer

Python Developer

Full Stack Developer

Business Analyst

Software Engineer

Show confidence percentages for each role.

India-Wide Job Search

Collect job listings from multiple sources:

LinkedIn Jobs

Naukri

Indeed

Internshala

Company Career Pages

Search jobs across all states and union territories in India.

Display:

Job Title

Company Name

State

City

Work Mode (Remote/Hybrid/Onsite)

Experience Required

Salary Range

Apply Link

Company Matching Engine

Compare resume skills with job requirements.

Calculate match percentage.

Rank companies based on:

Skill Match

Salary

Company Rating

Job Location

Fresher Friendliness

Display Top 10 Recommended Companies.

Salary Prediction System

Predict expected salary based on:

Skills

Education

Certifications

Experience

Location

Show:

Minimum Salary

Average Salary

Maximum Salary

State-Wise Opportunity Analysis

Show jobs available in:

Andhra Pradesh

Telangana

Karnataka

Tamil Nadu

Maharashtra

Delhi

Gujarat

Kerala

All other Indian states

Provide state-wise job statistics.

Display jobs on an interactive India map.

Job Recommendation Dashboard
Display:

Resume Score

ATS Score

Top Skills

Missing Skills

Recommended Roles

Recommended Companies

Salary Prediction

State-wise Opportunities

Latest Matching Jobs

Job Application Assistant

Provide an "Apply Now" button for each job.

Redirect users to the official application page.

Save application history.

Track:

Applied

Interview Scheduled

Selected

Rejected

AI Career Assistant

Generate:

Cover Letters

Resume Improvements

Interview Questions

Skill Development Roadmaps

Career Guidance

Admin Panel

Manage users.

Monitor job listings.

View analytics.

Manage company data.

Technology Stack:

Frontend:

React.js

Next.js

Tailwind CSS

Backend:

FastAPI (Python)

Database:

PostgreSQL

AI/NLP:

Python

spaCy

Scikit-learn

Transformers

Sentence Transformers

Resume Parsing:

pdfplumber

PyPDF2

python-docx

Authentication:

JWT

Google Login

Maps:

Google Maps API or Leaflet

Deployment:

Frontend: Vercel

Backend: Render or AWS

Database: PostgreSQL

Expected Workflow:

User Uploads Resume
→ Resume Parsing
→ Skill Extraction
→ ATS Analysis
→ Role Prediction
→ Salary Prediction
→ Job Search Across India
→ Company Ranking
→ State-Wise Analysis
→ Dashboard Display
→ Apply for Jobs
→ Application Tracking

Build a modern, responsive, production-ready application with professional UI/UX, REST APIs, AI-powered recommendations, secure authentication, analytics dashboard, and support for both web and mobile platforms.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://career-compass-ai-808.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0f0d5aca-5a87-4771-949c-07f4fce200d3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
