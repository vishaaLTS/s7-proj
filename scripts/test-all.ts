import { ScoreEngine } from '../src/services/score-engine';
import { RoadmapService } from '../src/services/training-roadmap';
import { extractTextFromDocx, extractTextFromDocxAsync } from '../src/lib/docx-extractor';
import { SkillAliasService } from '../src/services/skill-alias';

async function runTests() {
  console.log('🧪 Starting Automated System Verification Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  // 1. ScoreEngine Verification
  console.log('1. Testing ScoreEngine Centralized Scoring & Weights:');
  const scoreResult = ScoreEngine.calculateReadiness({
    matchedSkillsCount: 4,
    totalRequiredSkillsCount: 5,
    partialSkillsCount: 0,
    assessmentScores: [80, 90],
    completedProjectsCount: 2,
    totalRecommendedProjectsCount: 3,
    latestATSScore: 85,
    latestInterviewScore: 75,
  });

  assert(scoreResult.skillMatchScore === 80, 'Skill match score computed as 80%');
  assert(scoreResult.assessmentScore === 85, 'Assessment average computed as 85%');
  assert(scoreResult.projectScore === 67, 'Project score computed as 67% (2/3)');
  assert(scoreResult.atsScore === 85, 'ATS score recorded as 85');
  assert(scoreResult.interviewScore === 75, 'Interview score recorded as 75');
  assert(
    scoreResult.overallReadinessScore ===
      Math.round(80 * 0.35 + 85 * 0.2 + 67 * 0.15 + 85 * 0.1 + 75 * 0.2),
    'Weighted overall readiness score matches exact formula'
  );

  // 2. ScoreEngine Null Fallback Verification (No Fake Baseline Metrics)
  console.log('\n2. Testing ScoreEngine Null Handling (No Fake Baselines):');
  const nullScoreResult = ScoreEngine.calculateReadiness({
    matchedSkillsCount: 2,
    totalRequiredSkillsCount: 4,
  });

  assert(nullScoreResult.assessmentScore === null, 'Assessment score is null when no data provided');
  assert(nullScoreResult.projectScore === null, 'Project score is null when no data provided');
  assert(nullScoreResult.atsScore === null, 'ATS score is null when no data provided');
  assert(nullScoreResult.interviewScore === null, 'Interview score is null when no data provided');
  assert(nullScoreResult.hasAssessment === false, 'hasAssessment flag is false');

  // 3. Skill Alias Normalization
  console.log('\n3. Testing Skill Alias Engine Normalization:');
  const aliasSkill = await SkillAliasService.findSkillByAlias('ReactJS');
  assert(aliasSkill?.name === 'React', 'Skill alias lookup resolves ReactJS -> React');

  // 4. Date-based Learning Streak Calculation
  console.log('\n4. Testing Date-Based Learning Streak Calculation:');
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const streak3 = RoadmapService.calculateRealStreak([today, yesterday, twoDaysAgo]);
  assert(streak3 === 3, 'Consecutive 3-day streak computed correctly');

  const brokenStreak = RoadmapService.calculateRealStreak([twoDaysAgo]);
  assert(brokenStreak === 0, 'Broken streak (>1 day gap) resets to 0');

  // 5. DOCX Text Extraction
  console.log('\n5. Testing DOCX Text Extraction Helpers:');
  const dummyDocxBuffer = Buffer.from('Sample plain text resume fallback');
  const extractedTextSync = extractTextFromDocx(dummyDocxBuffer);
  assert(typeof extractedTextSync === 'string' && extractedTextSync.length > 0, 'DOCX text extractor sync fallback returns clean text');

  const extractedTextAsync = await extractTextFromDocxAsync(dummyDocxBuffer);
  assert(typeof extractedTextAsync === 'string' && extractedTextAsync.length > 0, 'DOCX text extractor async mammoth pipeline returns clean text');

  console.log(`\n🎉 Test Suite Completed: ${passed}/${total} tests passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
