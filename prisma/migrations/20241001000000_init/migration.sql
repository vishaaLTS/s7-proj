-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "avatarUrl" TEXT,
    "degree" TEXT,
    "institution" TEXT,
    "graduationYear" INTEGER,
    "cgpa" DOUBLE PRECISION,
    "bio" TEXT,
    "linkedIn" TEXT,
    "github" TEXT,
    "portfolio" TEXT,
    "targetRoleId" TEXT,
    "targetCompanyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "grade" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parsedText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "parsedJson" TEXT NOT NULL,
    "summary" TEXT,
    "experienceYears" DOUBLE PRECISION,
    "educationScore" DOUBLE PRECISION,
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',
    "aiModel" TEXT NOT NULL DEFAULT 'gemini-fallback',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAlias" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'system',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRelationship" (
    "id" TEXT NOT NULL,
    "parentSkillId" TEXT NOT NULL,
    "childSkillId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL DEFAULT 'RELATED_TO',

    CONSTRAINT "SkillRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiencyLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "numericScore" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "evidence" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEvidence" (
    "id" TEXT NOT NULL,
    "userSkillId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'RESUME',
    "evidenceText" TEXT NOT NULL,
    "scoreContribution" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "passPercentage" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MCQ',
    "optionsJson" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 10.0,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answersJson" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "industry" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'TIER_1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL DEFAULT 'ENTRY_LEVEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyJobRole" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "interviewProcess" TEXT,
    "aptitudeWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "technicalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "CompanyJobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRequirement" (
    "id" TEXT NOT NULL,
    "companyJobRoleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "importance" TEXT NOT NULL DEFAULT 'REQUIRED',
    "requiredLevel" TEXT NOT NULL DEFAULT 'INTERMEDIATE',

    CONSTRAINT "SkillRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MISSING',
    "currentLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "requiredLevel" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "gapScore" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "recommendationText" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingResource" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COURSE',
    "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "level" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completedHours" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTask" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "skillId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceUrl" TEXT,
    "practiceTask" TEXT,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 60,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LearningTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "description" TEXT NOT NULL,
    "techStackJson" TEXT NOT NULL,
    "learningOutcomes" TEXT NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSkill" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progressNotes" TEXT,
    "uploadedFilesJson" TEXT,
    "repoUrl" TEXT,
    "liveUrl" TEXT,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ATSAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT,
    "targetRoleTitle" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "keywordMatchPct" DOUBLE PRECISION NOT NULL,
    "missingKeywordsJson" TEXT NOT NULL,
    "formattingScore" DOUBLE PRECISION NOT NULL,
    "feedbackJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ATSAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'TECHNICAL',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'TECHNICAL',
    "suggestedAnswer" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "aiFeedbackJson" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "clarityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "technicalScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewResult" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "strengthsJson" TEXT NOT NULL,
    "weaknessesJson" TEXT NOT NULL,
    "recommendationsJson" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jobType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "description" TEXT NOT NULL,
    "requirementsJson" TEXT NOT NULL,
    "salaryRange" TEXT,
    "source" TEXT NOT NULL DEFAULT 'INTERNAL',
    "applicationUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SAVED',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchPercentage" DOUBLE PRECISION NOT NULL,
    "skillMatchPct" DOUBLE PRECISION NOT NULL,
    "experienceMatchPct" DOUBLE PRECISION NOT NULL,
    "educationMatchPct" DOUBLE PRECISION NOT NULL,
    "matchBreakdownJson" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readinessScore" DOUBLE PRECISION NOT NULL,
    "completedTasksCount" INTEGER NOT NULL DEFAULT 0,
    "skillCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadataJson" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payloadJson" TEXT,
    "resultJson" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "scoringVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisVersion_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "ResumeAnalysis_resumeId_key" ON "ResumeAnalysis"("resumeId");
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
CREATE UNIQUE INDEX "SkillAlias_alias_key" ON "SkillAlias"("alias");
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "UserSkill"("userId", "skillId");
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE UNIQUE INDEX "JobRole_title_key" ON "JobRole"("title");
CREATE UNIQUE INDEX "CompanyJobRole_companyId_jobRoleId_key" ON "CompanyJobRole"("companyId", "jobRoleId");
CREATE UNIQUE INDEX "ProjectSkill_projectId_skillId_key" ON "ProjectSkill"("projectId", "skillId");
CREATE UNIQUE INDEX "UserProject_userId_projectId_key" ON "UserProject"("userId", "projectId");
CREATE UNIQUE INDEX "InterviewAnswer_questionId_key" ON "InterviewAnswer"("questionId");
CREATE UNIQUE INDEX "InterviewResult_interviewId_key" ON "InterviewResult"("interviewId");
CREATE UNIQUE INDEX "JobApplication_userId_jobId_key" ON "JobApplication"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Education" ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "FileAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillAlias" ADD CONSTRAINT "SkillAlias_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillRelationship" ADD CONSTRAINT "SkillRelationship_parentSkillId_fkey" FOREIGN KEY ("parentSkillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillRelationship" ADD CONSTRAINT "SkillRelationship_childSkillId_fkey" FOREIGN KEY ("childSkillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_userSkillId_fkey" FOREIGN KEY ("userSkillId") REFERENCES "UserSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyJobRole" ADD CONSTRAINT "CompanyJobRole_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyJobRole" ADD CONSTRAINT "CompanyJobRole_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillRequirement" ADD CONSTRAINT "SkillRequirement_companyJobRoleId_fkey" FOREIGN KEY ("companyJobRoleId") REFERENCES "CompanyJobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillRequirement" ADD CONSTRAINT "SkillRequirement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillGap" ADD CONSTRAINT "SkillGap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillGap" ADD CONSTRAINT "SkillGap_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillGap" ADD CONSTRAINT "SkillGap_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillGap" ADD CONSTRAINT "SkillGap_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingResource" ADD CONSTRAINT "TrainingResource_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningRoadmap" ADD CONSTRAINT "LearningRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningRoadmap" ADD CONSTRAINT "LearningRoadmap_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningTask" ADD CONSTRAINT "LearningTask_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "LearningRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningTask" ADD CONSTRAINT "LearningTask_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ATSAnalysis" ADD CONSTRAINT "ATSAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ATSAnalysis" ADD CONSTRAINT "ATSAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ATSAnalysis" ADD CONSTRAINT "ATSAnalysis_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewResult" ADD CONSTRAINT "InterviewResult_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
