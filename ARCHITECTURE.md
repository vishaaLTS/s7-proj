# System Architecture Documentation
## SkillBridge AI — Youth Employment & Career Intelligence Portal
> Final-Year Project | Next.js 14 + Prisma ORM + SQLite + Gemini AI

---

## 1. Modular Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                                │
│  Next.js 14 App Router (React 18, Tailwind CSS, Recharts, Lucide Icons)     │
│  Pages: Login, Dashboard, Resume, Skills, Assessment, Skill Gap,            │
│         Roadmap, Projects, ATS Analyzer, Mock Interview, Jobs,              │
│         Career Intelligence, Companies, Admin Portal                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST via fetch()
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    Security & Authentication Middleware                      │
│  ├── Bcrypt password hashing (bcryptjs, 10 rounds)                         │
│  ├── JWT Tokens — HS256 signed, stored as HttpOnly cookies                 │
│  └── Server-side RBAC: STUDENT | JOB_SEEKER | COUNSELOR | EMPLOYER | ADMIN │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            API Route Layer (35 routes)                      │
│  /api/auth/login        /api/auth/me        /api/auth/register              │
│  /api/profile           /api/resume         /api/resume/upload              │
│  /api/skills            /api/skills/[id]    /api/assessment                 │
│  /api/assessment/submit /api/skill-gap/analyze                             │
│  /api/roadmap           /api/roadmap/tasks/[id]/complete                   │
│  /api/projects          /api/projects/recommended                          │
│  /api/projects/[id]/start   /api/projects/[id]/complete                   │
│  /api/ats/analyze       /api/interview/start  /api/interview/answer        │
│  /api/jobs              /api/jobs/recommendations                          │
│  /api/career-intelligence   /api/companies   /api/roles                    │
│  /api/applications      /api/notifications   /api/notifications/read-all   │
│  /api/privacy           /api/admin/(users|skills|companies|jobs|metrics)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                              Service Layer                                  │
│  ├── ScoreEngine        — Weighted readiness score calculator (server-only) │
│  ├── AIService          — Gemini API + Deterministic NLP Fallback Engine    │
│  ├── SkillGapService    — MATCHED / PARTIAL / MISSING gap computation       │
│  ├── ReadinessService   — Aggregates all 5 score components per user        │
│  ├── SkillAliasService  — Canonical skill normalization & alias mapping     │
│  ├── ATSService         — Resume keyword match & format scoring             │
│  ├── InterviewService   — AI question generation & answer evaluation        │
│  ├── JobMatchingService — Weighted skill/experience/education job fit       │
│  ├── RoadmapService     — Personalized curriculum & real streak calculator  │
│  ├── NotificationService — User notification CRUD & mark-as-read           │
│  ├── CareerIntelligenceService — Full 7-step pipeline aggregator           │
│  └── FileStorageService — Disk-based file storage with metadata tracking   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Prisma Client
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                          Prisma ORM + SQLite Database                       │
│  28 Models: User, Profile, Resume, ResumeAnalysis, Skill, SkillAlias,      │
│             UserSkill, SkillGap, Assessment, AssessmentResult,             │
│             LearningRoadmap, LearningTask, Project, UserProject,           │
│             ATSAnalysis, MockInterview, InterviewQuestion, InterviewAnswer, │
│             InterviewResult, Job, JobMatch, JobApplication, Company,       │
│             JobRole, CompanyJobRole, SkillRequirement, Notification,       │
│             AuditLog, BackgroundJob, TrainingResource, FileAsset, Progress  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ScoreEngine — Readiness Score Formula

The **overall readiness score** is computed server-side by `ScoreEngine.calculateReadiness()`:

```
Readiness Score = Σ(component_score × weight) / Σ(active_weights)
```

| Component | Weight | Source |
|-----------|--------|--------|
| Skill Match | **35%** | `SkillGapService.analyzeSkillGap()` |
| Assessment | **20%** | `AssessmentResult.percentage` (average) |
| Mock Interview | **20%** | `InterviewResult.overallScore` |
| Portfolio Projects | **15%** | Completed `UserProject` count / recommended |
| ATS Resume Score | **10%** | `ATSAnalysis.score` (latest) |

> **Note:** Missing components are excluded from the weighted average (denominator only sums active weights). A user with no assessment takes a score from 4 components.

---

## 3. AI Provider Architecture

```
Request → AIService.analyzeResume(text)
           │
           ├─ ATTEMPT: Gemini Pro API (requires AI_API_KEY env var)
           │   └─ Response → Zod Schema Validation → DB Persist
           │
           └─ FALLBACK: Deterministic NLP Engine (always available)
               ├─ Regex-based name/contact/education extraction from PDF text
               ├─ Keyword-based skill detection from 50+ tech terms
               ├─ Rule-based proficiency inference (BEGINNER/INTERMEDIATE/ADVANCED)
               └─ Structured JSON output matching same Zod schema
```

**Zod Schemas enforced on all AI outputs:**
- `ResumeAnalysisSchema` — name, skills[], education, summary, years
- `ATSAnalysisSchema` — score, keywordMatchPct, missingKeywords[], improvements[]
- `InterviewEvaluationSchema` — score, clarityScore, relevanceScore, technicalScore

---

## 4. Key Architecture Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| **Server-side calculations** | All scores computed in services; React only renders derived state |
| **AI provider fallback** | Deterministic NLP fallback when API key absent — no hallucinations |
| **Schema enforcement** | All AI outputs validated by Zod before DB persistence |
| **No fake data injection** | Resume extraction reads actual PDF text bytes; no invented content |
| **Data ownership** | Every API route enforces `userId` ownership — no cross-user data access |
| **Skill normalization** | `SkillAliasService` maps aliases → canonical skills before DB storage |
| **Notification system** | Success events trigger `NotificationService.createNotification()` |

---

## 5. API Route Inventory (35 routes)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT login (bcrypt verify) |
| GET | `/api/auth/me` | Current user + profile + skills |
| POST | `/api/auth/me` | Logout (clear cookie) |
| POST | `/api/auth/register` | New user registration |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resume` | List user's uploaded resumes |
| POST | `/api/resume/upload` | Upload PDF/DOCX + AI analysis + skill auto-attach |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | User skill profile + skill catalog |
| POST | `/api/skills` | Add skill to profile |
| DELETE | `/api/skills/[id]` | Remove skill from profile |

### Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessment` | Catalog of available assessments |
| POST | `/api/assessment/submit` | Submit answers → score + pass/fail |

### Career Intelligence Pipeline
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/skill-gap/analyze` | Run full skill gap + save target company/role |
| GET | `/api/skill-gap/analyze` | Get existing skill gap data |
| GET | `/api/roadmap` | Get/auto-generate training roadmap |
| POST | `/api/roadmap` | Force regenerate roadmap |
| POST | `/api/roadmap/tasks/[id]/complete` | Toggle task completion + streak |
| GET | `/api/projects/recommended` | Personalized project recommendations |
| POST | `/api/projects/[id]/start` | Start a project |
| POST | `/api/projects/[id]/complete` | Mark project complete (with notes/files) |
| POST | `/api/ats/analyze` | ATS keyword scan on resume |
| POST | `/api/interview/start` | Start mock interview session |
| POST | `/api/interview/answer` | Submit answer + AI evaluation |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List active jobs + user match % |
| GET | `/api/jobs/recommendations` | Top 30 jobs sorted by fit % |
| GET | `/api/applications` | User job application history |
| POST | `/api/applications` | Save/update job application status |

### Supporting
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/career-intelligence` | Full 7-stage pipeline aggregated data |
| GET | `/api/companies` | All companies with job roles |
| GET | `/api/roles` | All job roles |
| GET | `/api/notifications` | Unread notification count + list |
| POST | `/api/notifications/read-all` | Mark all notifications as read |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |

### Admin (ADMIN role only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/users` | List/create users |
| GET/POST | `/api/admin/skills` | List/create skills |
| GET/POST | `/api/admin/companies` | List/create companies |
| GET/POST | `/api/admin/jobs` | List/create jobs |
| GET | `/api/admin/metrics` | Platform KPI metrics |

---

## 6. Database Schema Summary (SQLite via Prisma)

```
User ──┬── Profile (1:1)
       ├── Resume ── ResumeAnalysis (1:1)
       ├── UserSkill ── Skill ── SkillAlias
       ├── SkillGap (userId × companyId × jobRoleId × skillId)
       ├── LearningRoadmap ── LearningTask
       ├── UserProject ── Project ── ProjectSkill
       ├── ATSAnalysis
       ├── MockInterview ── InterviewQuestion ── InterviewAnswer
       │                └── InterviewResult (1:1)
       ├── AssessmentResult
       ├── JobMatch ── Job ── Company
       ├── JobApplication
       └── Notification

Company ── CompanyJobRole ── JobRole ── SkillRequirement ── Skill
                          └── TrainingResource ── Skill
```

---

## 7. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student (Demo) | `demo@example.com` | `Demo@123` |
| Admin | `admin@skillbridge.ai` | `Admin@123` |

---

## 8. Running the Project

```bash
# Install dependencies
npm install

# Sync database schema
npx prisma db push

# Seed with companies, skills, jobs, assessments
npx prisma db seed

# Start development server
npm run dev
# → http://localhost:3000
```

**Optional:** Set `AI_API_KEY=<google_gemini_api_key>` in `.env` to enable live AI analysis.
Without it, the deterministic fallback engine handles all AI tasks silently.
