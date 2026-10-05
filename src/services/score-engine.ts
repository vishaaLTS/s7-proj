export interface ScoreBreakdown {
  skillMatchScore: number;
  assessmentScore: number | null;
  projectScore: number | null;
  atsScore: number | null;
  interviewScore: number | null;
  overallReadinessScore: number;
  hasAssessment: boolean;
  hasProjects: boolean;
  hasATS: boolean;
  hasInterview: boolean;
  weights: {
    skillMatch: number;
    assessment: number;
    project: number;
    ats: number;
    interview: number;
  };
  explanation: string;
  strengths: string[];
  criticalGaps: string[];
  recommendedAction: string;
}

export interface ScoreEngineInput {
  matchedSkillsCount: number;
  totalRequiredSkillsCount: number;
  partialSkillsCount?: number;
  assessmentScores?: number[]; // Percentage scores (0-100)
  completedProjectsCount?: number;
  totalRecommendedProjectsCount?: number;
  latestATSScore?: number; // (0-100)
  latestInterviewScore?: number; // (0-100)
  isDemoMode?: boolean;
}

export class ScoreEngine {
  public static DEFAULT_WEIGHTS = {
    skillMatch: 0.35,
    assessment: 0.20,
    project: 0.15,
    ats: 0.10,
    interview: 0.20,
  };

  public static calculateReadiness(
    input: ScoreEngineInput,
    customWeights?: Partial<typeof ScoreEngine.DEFAULT_WEIGHTS>
  ): ScoreBreakdown {
    const weights = { ...this.DEFAULT_WEIGHTS, ...customWeights };

    // 1. Skill Match Score (0-100)
    let skillMatchScore = 0;
    if (input.totalRequiredSkillsCount > 0) {
      const fullMatches = input.matchedSkillsCount;
      const partialMatches = (input.partialSkillsCount || 0) * 0.5;
      skillMatchScore = Math.min(
        100,
        Math.round(((fullMatches + partialMatches) / input.totalRequiredSkillsCount) * 100)
      );
    }

    // 2. Assessment Score (0-100)
    const hasAssessment = Boolean(input.assessmentScores && input.assessmentScores.length > 0);
    let assessmentScore: number | null = null;
    if (hasAssessment && input.assessmentScores) {
      const sum = input.assessmentScores.reduce((acc, curr) => acc + curr, 0);
      assessmentScore = Math.round(sum / input.assessmentScores.length);
    } else if (input.isDemoMode) {
      assessmentScore = 75;
    }

    // 3. Project Score (0-100)
    const hasProjects = Boolean(
      input.completedProjectsCount !== undefined && input.completedProjectsCount > 0
    );
    let projectScore: number | null = null;
    if (hasProjects) {
      const totalRec = input.totalRecommendedProjectsCount || 3;
      projectScore = Math.min(100, Math.round(((input.completedProjectsCount || 0) / Math.max(1, totalRec)) * 100));
    } else if (input.isDemoMode) {
      projectScore = 65;
    }

    // 4. ATS Score (0-100)
    const hasATS = input.latestATSScore !== undefined && input.latestATSScore !== null;
    let atsScore: number | null = hasATS ? Math.round(input.latestATSScore!) : input.isDemoMode ? 78 : null;

    // 5. Interview Score (0-100)
    const hasInterview = input.latestInterviewScore !== undefined && input.latestInterviewScore !== null;
    let interviewScore: number | null = hasInterview ? Math.round(input.latestInterviewScore!) : input.isDemoMode ? 65 : null;

    // Weighted Overall Readiness Calculation
    // Re-normalize weights if some components are missing (not available)
    let totalActiveWeight = weights.skillMatch;
    let weightedSum = skillMatchScore * weights.skillMatch;

    if (assessmentScore !== null) {
      totalActiveWeight += weights.assessment;
      weightedSum += assessmentScore * weights.assessment;
    }
    if (projectScore !== null) {
      totalActiveWeight += weights.project;
      weightedSum += projectScore * weights.project;
    }
    if (atsScore !== null) {
      totalActiveWeight += weights.ats;
      weightedSum += atsScore * weights.ats;
    }
    if (interviewScore !== null) {
      totalActiveWeight += weights.interview;
      weightedSum += interviewScore * weights.interview;
    }

    const overallReadinessScore = totalActiveWeight > 0 ? Math.round(weightedSum / totalActiveWeight) : 0;

    // Dynamic Strengths & Gaps Analysis
    const strengths: string[] = [];
    const criticalGaps: string[] = [];

    if (skillMatchScore >= 75) strengths.push(`Strong core skill alignment (${skillMatchScore}%)`);
    else criticalGaps.push(`Core skill gap (${skillMatchScore}% match out of ${input.totalRequiredSkillsCount} required skills)`);

    if (hasAssessment && assessmentScore !== null) {
      if (assessmentScore >= 70) strengths.push(`Verified technical assessment performance (${assessmentScore}%)`);
      else criticalGaps.push(`Assessment scores need improvement (${assessmentScore}%)`);
    } else {
      criticalGaps.push('No technical assessment completed yet');
    }

    if (hasProjects && projectScore !== null) {
      if (projectScore >= 70) strengths.push(`Demonstrated practical project experience`);
      else criticalGaps.push(`Additional hands-on projects recommended`);
    } else {
      criticalGaps.push('No practical portfolio projects completed yet');
    }

    if (hasATS && atsScore !== null) {
      if (atsScore >= 75) strengths.push(`High resume ATS keyword optimization (${atsScore}/100)`);
      else criticalGaps.push(`Resume ATS optimization needed (${atsScore}/100)`);
    } else {
      criticalGaps.push('No ATS resume scan performed yet');
    }

    if (hasInterview && interviewScore !== null) {
      if (interviewScore >= 70) strengths.push(`Strong mock interview readiness (${interviewScore}/100)`);
      else criticalGaps.push(`Mock interview performance needs practice (${interviewScore}/100)`);
    } else {
      criticalGaps.push('No mock interview completed yet');
    }

    let recommendedAction = 'Focus on acquiring missing priority skills and completing practical projects.';
    if (criticalGaps.length === 0 || (skillMatchScore >= 80 && hasAssessment && hasProjects)) {
      recommendedAction = 'You meet key company readiness criteria! Practice mock interviews and apply for matching positions.';
    } else if (!hasAssessment) {
      recommendedAction = 'Complete a skill assessment to verify your proficiency and boost your readiness score.';
    } else if (skillMatchScore < 60) {
      recommendedAction = 'Start with the weekly personalized learning roadmap to bridge critical skill gaps.';
    }

    const assessmentStr = assessmentScore !== null ? `${assessmentScore}%` : 'Not Taken';
    const projectStr = projectScore !== null ? `${projectScore}%` : 'None';
    const atsStr = atsScore !== null ? `${atsScore}%` : 'Not Evaluated';
    const interviewStr = interviewScore !== null ? `${interviewScore}%` : 'Not Completed';

    const explanation = `Your readiness score is ${overallReadinessScore}%, calculated from Skill Match (${skillMatchScore}%), Assessments (${assessmentStr}), Practical Projects (${projectStr}), ATS Compatibility (${atsStr}), and Interview Evaluation (${interviewStr}).`;

    return {
      skillMatchScore,
      assessmentScore,
      projectScore,
      atsScore,
      interviewScore,
      overallReadinessScore,
      hasAssessment,
      hasProjects,
      hasATS,
      hasInterview,
      weights,
      explanation,
      strengths,
      criticalGaps,
      recommendedAction,
    };
  }
}
