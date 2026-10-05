# API Documentation

All API responses follow a standardized JSON envelope:

### Success Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | SERVER_ERROR",
    "message": "Human readable error message",
    "details": {}
  },
  "requestId": "abc123xyz"
}
```

---

## 📡 Endpoints Overview

### Authentication
- `POST /api/auth/register`: Candidate registration
- `POST /api/auth/login`: Candidate login & JWT cookie session set
- `POST /api/auth/logout`: Clear session cookie
- `GET /api/auth/me`: Current user session & profile retrieval

### Candidate Profile & Resumes
- `GET /api/profile`: Retrieve user profile
- `PUT /api/profile`: Update profile, education, and target company/role
- `POST /api/resume/upload`: Upload PDF/DOCX resume, disk storage, PDF parsing & AI skill extraction
- `GET /api/resume`: List candidate uploaded resumes

### Skill Engine
- `GET /api/skills`: Retrieve skill catalog & user verified skills
- `POST /api/skills`: Verify and attach new skill to user profile
- `PUT /api/skills/:id`: Update user skill proficiency level
- `DELETE /api/skills/:id`: Remove skill from candidate profile

### Skill Gap & Readiness
- `POST /api/skill-gap/analyze`: Compare candidate skills against target company requirements & compute Readiness Score
- `GET /api/skill-gap`: Fetch active skill gap matrix and readiness breakdown

### Bridge Training Roadmap
- `GET /api/roadmap`: Fetch active learning roadmap and weekly tasks
- `POST /api/roadmap`: Generate new custom learning roadmap
- `POST /api/roadmap/tasks/:id/complete`: Toggle task completion state

### ATS Resume Analyzer
- `POST /api/ats/analyze`: Inspect resume against job position for keyword match % and ATS score

### AI Mock Interview Simulator
- `POST /api/interview/start`: Start company-specific technical or HR mock interview
- `POST /api/interview/answer`: Submit answer text for real-time AI scorecard evaluation

### Job Matching Engine
- `GET /api/jobs`: List available job postings
- `GET /api/jobs/recommendations`: Compute candidate-to-job fit matches with explainable fit metrics

### Admin Operations
- `GET /api/admin/metrics`: Platform analytics metrics & registered users
