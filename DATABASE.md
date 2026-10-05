# Database Architecture & PostgreSQL Schema Design

The Youth Employment Portal uses **PostgreSQL** managed via Prisma ORM, containing 39 relational models structured around 7 core domains:

## 1. Core Domains & Relational Schema

1. **User & Auth**: `User`, `Profile`, `Education`, `Experience`
2. **Resumes & Storage**: `Resume`, `ResumeAnalysis`, `FileAsset`, `BackgroundJob`
3. **Skills & Ontology**: `Skill`, `SkillAlias`, `SkillRelationship`, `UserSkill`, `SkillEvidence`
4. **Assessment Engine**: `Assessment`, `AssessmentQuestion`, `AssessmentResult`
5. **Company Intelligence**: `Company`, `JobRole`, `CompanyJobRole`, `SkillRequirement`, `SkillGap`
6. **Bridge Training & Projects**: `TrainingResource`, `LearningRoadmap`, `LearningTask`, `Project`, `ProjectSkill`, `UserProject`
7. **ATS, Interview, Applications & Jobs**: `ATSAnalysis`, `MockInterview`, `InterviewQuestion`, `InterviewAnswer`, `InterviewResult`, `Job`, `JobMatch`, `JobApplication`, `Progress`, `Notification`, `AuditLog`, `AnalysisVersion`

---

## 2. Key PostgreSQL Models & Relations

### `JobApplication`
- Stores candidate job applications and status tracking.
- Statuses: `SAVED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.
- Unique Constraint: `[userId, jobId]`.

### `ProjectSkill`
- Links `Project` to required `Skill` records for skill-gap based recommendations.
- Unique Constraint: `[projectId, skillId]`.

---

## 3. Seed Data Summary (`prisma/seed.ts`)

- **Users**: Demo Candidate (`demo@example.com` / `Demo@123`), Admin (`admin@example.com` / `Demo@123`)
- **Skills & Aliases**: 55 skills with 100+ canonical aliases (`React`, `ReactJS`, `Next.js`, `Node.js`, `PostgreSQL`, `Python`, `Docker`, `System Design`, etc.)
- **Companies**: 12 Companies (TCS, Infosys, Wipro, Accenture, Cognizant, Tech Mahindra, Capgemini, Amazon, Microsoft, Google, Zoho, Freshworks)
- **Job Roles**: 22 Job Roles (Full Stack Developer, SDE-1, Senior Engineer, Frontend Developer, Backend Developer, Data Scientist, AI/ML Engineer, DevOps, etc.)
- **Skill Requirements**: 360 requirement links defining skill importance and target levels
- **Training & Projects**: 32 Course items and 21 hands-on portfolio project recommendations
- **Jobs & Applications**: 36 Active job postings with application tracking for demo candidate
