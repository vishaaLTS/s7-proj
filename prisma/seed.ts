import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Youth Employment Portal Expanded Database Seeding...');

  // 1. Clear existing data in correct dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobMatch.deleteMany();
  await prisma.job.deleteMany();
  await prisma.interviewResult.deleteMany();
  await prisma.interviewAnswer.deleteMany();
  await prisma.interviewQuestion.deleteMany();
  await prisma.mockInterview.deleteMany();
  await prisma.aTSAnalysis.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.learningTask.deleteMany();
  await prisma.learningRoadmap.deleteMany();
  await prisma.trainingResource.deleteMany();
  await prisma.skillGap.deleteMany();
  await prisma.skillRequirement.deleteMany();
  await prisma.companyJobRole.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.company.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.skillEvidence.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skillRelationship.deleteMany();
  await prisma.skillAlias.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.resumeAnalysis.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.fileAsset.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const demoPasswordHash = await bcrypt.hash('Demo@123', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash: demoPasswordHash,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Rahul Sharma',
          phone: '+91 98765 43210',
          location: 'Bengaluru, India',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          degree: 'Bachelor of Technology (B.Tech)',
          institution: 'National Institute of Technology',
          graduationYear: 2024,
          cgpa: 8.4,
          bio: 'Enthusiastic Computer Science graduate passionate about full-stack web development, AI-driven career tools, and cloud engineering.',
          linkedIn: 'https://linkedin.com/in/demo-rahul',
          github: 'https://github.com/demo-rahul',
          portfolio: 'https://rahul-sharma.dev',
        }
      },
      educations: {
        create: {
          degree: 'B.Tech in Computer Science & Engineering',
          institution: 'National Institute of Technology',
          fieldOfStudy: 'Computer Science',
          startYear: 2020,
          endYear: 2024,
          grade: '8.4 CGPA',
        }
      },
      experiences: {
        create: {
          title: 'Full Stack Developer Intern',
          company: 'TechStart Innovations',
          location: 'Bengaluru',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2023-08-31'),
          current: false,
          description: 'Developed responsive dashboard widgets in React and built Node.js REST API endpoints.',
        }
      }
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: demoPasswordHash,
      role: 'ADMIN',
      profile: {
        create: {
          fullName: 'System Administrator',
          location: 'New Delhi, India',
          bio: 'Platform Lead & Operations Administrator',
        }
      }
    }
  });

  console.log('✅ Base Users created');

  // 3. Create Skills (55 Skills with Aliases)
  const skillsData = [
    { name: 'JavaScript', category: 'Programming', aliases: ['js', 'ecmascript', 'js6'] },
    { name: 'TypeScript', category: 'Programming', aliases: ['ts', 'typescript.js'] },
    { name: 'Python', category: 'Programming', aliases: ['py', 'python3'] },
    { name: 'Java', category: 'Programming', aliases: ['java8', 'java17', 'core java'] },
    { name: 'C++', category: 'Programming', aliases: ['cpp', 'c plus plus'] },
    { name: 'C#', category: 'Programming', aliases: ['csharp', '.net c#'] },
    { name: 'Go', category: 'Programming', aliases: ['golang'] },
    { name: 'Rust', category: 'Programming', aliases: ['rustlang'] },
    { name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js', 'react js'] },
    { name: 'Next.js', category: 'Frontend', aliases: ['nextjs', 'next.js', 'next'] },
    { name: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vuejs'] },
    { name: 'Angular', category: 'Frontend', aliases: ['angularjs', 'angular2+'] },
    { name: 'HTML5', category: 'Frontend', aliases: ['html', 'html 5'] },
    { name: 'CSS3', category: 'Frontend', aliases: ['css', 'css 3'] },
    { name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind', 'tailwindcss'] },
    { name: 'Node.js', category: 'Backend', aliases: ['nodejs', 'node.js', 'node'] },
    { name: 'Express.js', category: 'Backend', aliases: ['express', 'expressjs'] },
    { name: 'NestJS', category: 'Backend', aliases: ['nest', 'nestjs'] },
    { name: 'Django', category: 'Backend', aliases: ['django-framework'] },
    { name: 'FastAPI', category: 'Backend', aliases: ['fast-api'] },
    { name: 'Spring Boot', category: 'Backend', aliases: ['springboot', 'spring'] },
    { name: 'ASP.NET Core', category: 'Backend', aliases: ['aspnet', 'dotnet core'] },
    { name: 'SQL', category: 'Database', aliases: ['structured-query-language'] },
    { name: 'PostgreSQL', category: 'Database', aliases: ['postgres', 'postgresql'] },
    { name: 'MySQL', category: 'Database', aliases: ['mysql-db'] },
    { name: 'MongoDB', category: 'Database', aliases: ['mongo', 'mongodb'] },
    { name: 'Redis', category: 'Database', aliases: ['redis-cache'] },
    { name: 'Elasticsearch', category: 'Database', aliases: ['elastic'] },
    { name: 'Docker', category: 'DevOps', aliases: ['container', 'docker-container'] },
    { name: 'Kubernetes', category: 'DevOps', aliases: ['k8s', 'kuber'] },
    { name: 'AWS', category: 'Cloud', aliases: ['amazon-web-services', 'aws-cloud'] },
    { name: 'Azure', category: 'Cloud', aliases: ['microsoft-azure'] },
    { name: 'GCP', category: 'Cloud', aliases: ['google-cloud-platform', 'google-cloud'] },
    { name: 'Git', category: 'Tools', aliases: ['github', 'gitlab', 'version-control'] },
    { name: 'Linux', category: 'Tools', aliases: ['bash', 'unix', 'shell-scripting'] },
    { name: 'REST APIs', category: 'Architecture', aliases: ['restful-api', 'rest'] },
    { name: 'GraphQL', category: 'Architecture', aliases: ['graphql-api'] },
    { name: 'gRPC', category: 'Architecture', aliases: ['grpc-api'] },
    { name: 'Data Structures', category: 'Fundamentals', aliases: ['dsa', 'ds'] },
    { name: 'Algorithms', category: 'Fundamentals', aliases: ['algo', 'problem-solving'] },
    { name: 'System Design', category: 'Architecture', aliases: ['high-level-design', 'hld', 'lld'] },
    { name: 'Unit Testing', category: 'QA', aliases: ['jest', 'vitest', 'testing'] },
    { name: 'CI/CD', category: 'DevOps', aliases: ['github-actions', 'jenkins'] },
    { name: 'Terraform', category: 'DevOps', aliases: ['iac', 'infrastructure-as-code'] },
    { name: 'Machine Learning', category: 'AI/ML', aliases: ['ml', 'scikit-learn'] },
    { name: 'Deep Learning', category: 'AI/ML', aliases: ['dl', 'tensorflow', 'pytorch'] },
    { name: 'NLP', category: 'AI/ML', aliases: ['natural-language-processing'] },
    { name: 'Computer Vision', category: 'AI/ML', aliases: ['opencv', 'cv'] },
    { name: 'LLM Prompt Engineering', category: 'AI/ML', aliases: ['prompt-engineering', 'generative-ai'] },
    { name: 'Figma', category: 'Design', aliases: ['ui-ux-design', 'figma-design'] },
    { name: 'Agile/Scrum', category: 'Process', aliases: ['agile', 'scrum', 'jira'] },
    { name: 'Communication', category: 'Soft Skills', aliases: ['verbal-communication', 'presentation'] },
    { name: 'Problem Solving', category: 'Soft Skills', aliases: ['analytical-thinking'] },
    { name: 'Team Collaboration', category: 'Soft Skills', aliases: ['teamwork'] },
    { name: 'Cybersecurity Fundamentals', category: 'Security', aliases: ['web-security', 'owasp'] },
  ];

  const skillMap = new Map<string, any>();
  for (const s of skillsData) {
    const createdSkill = await prisma.skill.create({
      data: {
        name: s.name,
        category: s.category,
        aliases: {
          create: s.aliases.map(a => ({ alias: a, source: 'system_seed' }))
        }
      }
    });
    skillMap.set(s.name, createdSkill);
  }
  console.log(`✅ ${skillsData.length} Skills created`);

  // Attach Verified Skills for Demo User
  const demoSkills = [
    { name: 'HTML5', level: 'ADVANCED', score: 88 },
    { name: 'CSS3', level: 'ADVANCED', score: 85 },
    { name: 'JavaScript', level: 'INTERMEDIATE', score: 78 },
    { name: 'React', level: 'INTERMEDIATE', score: 72 },
    { name: 'Python', level: 'INTERMEDIATE', score: 70 },
    { name: 'SQL', level: 'ELEMENTARY', score: 55 },
    { name: 'Git', level: 'INTERMEDIATE', score: 75 },
    { name: 'REST APIs', level: 'INTERMEDIATE', score: 74 },
  ];

  for (const ds of demoSkills) {
    const targetSkill = skillMap.get(ds.name);
    if (targetSkill) {
      const userSkill = await prisma.userSkill.create({
        data: {
          userId: demoUser.id,
          skillId: targetSkill.id,
          proficiencyLevel: ds.level,
          numericScore: ds.score,
          isVerified: true,
          verifiedAt: new Date(),
          evidence: `Verified during onboarding assessment and resume evaluation for ${ds.name}.`,
        }
      });

      await prisma.skillEvidence.create({
        data: {
          userSkillId: userSkill.id,
          sourceType: 'RESUME',
          evidenceText: `Extracted from resume experience and projects: ${ds.name}`,
          scoreContribution: 15.0,
        }
      });
    }
  }

  // 4. Create Companies (12 Companies)
  const companiesData = [
    { name: 'TCS (Tata Consultancy Services)', industry: 'IT Services & Consulting', tier: 'TIER_1', website: 'https://tcs.com' },
    { name: 'Infosys', industry: 'IT Services', tier: 'TIER_1', website: 'https://infosys.com' },
    { name: 'Wipro', industry: 'IT Services', tier: 'TIER_1', website: 'https://wipro.com' },
    { name: 'Accenture', industry: 'Management Consulting & IT', tier: 'TIER_1', website: 'https://accenture.com' },
    { name: 'Cognizant', industry: 'IT Services', tier: 'TIER_1', website: 'https://cognizant.com' },
    { name: 'Tech Mahindra', industry: 'IT & Telecom Services', tier: 'TIER_1', website: 'https://techmahindra.com' },
    { name: 'Capgemini', industry: 'Technology & Consulting', tier: 'TIER_1', website: 'https://capgemini.com' },
    { name: 'Amazon', industry: 'E-Commerce & Cloud Computing', tier: 'PRODUCT_TOP', website: 'https://amazon.jobs' },
    { name: 'Microsoft', industry: 'Software & Cloud', tier: 'PRODUCT_TOP', website: 'https://careers.microsoft.com' },
    { name: 'Google', industry: 'Internet & Artificial Intelligence', tier: 'PRODUCT_TOP', website: 'https://careers.google.com' },
    { name: 'Zoho Corporation', industry: 'SaaS Software', tier: 'PRODUCT_SAAS', website: 'https://zoho.com/careers' },
    { name: 'Freshworks', industry: 'Customer Engagement SaaS', tier: 'PRODUCT_SAAS', website: 'https://freshworks.com/careers' },
  ];

  const companyMap = new Map<string, any>();
  for (const c of companiesData) {
    const comp = await prisma.company.create({ data: c });
    companyMap.set(c.name, comp);
  }
  console.log(`✅ ${companiesData.length} Companies created`);

  // 5. Create Job Roles (22 Job Roles)
  const jobRolesData = [
    { title: 'Full Stack Developer', category: 'Software Development', level: 'ENTRY_LEVEL' },
    { title: 'Frontend Developer', category: 'Software Development', level: 'ENTRY_LEVEL' },
    { title: 'Backend Developer', category: 'Software Development', level: 'ENTRY_LEVEL' },
    { title: 'Software Development Engineer (SDE-1)', category: 'Product Engineering', level: 'ENTRY_LEVEL' },
    { title: 'Senior Software Engineer', category: 'Product Engineering', level: 'MID_LEVEL' },
    { title: 'Data Scientist', category: 'Data & AI', level: 'ENTRY_LEVEL' },
    { title: 'AI/ML Engineer', category: 'Data & AI', level: 'ENTRY_LEVEL' },
    { title: 'Data Analyst', category: 'Analytics', level: 'ENTRY_LEVEL' },
    { title: 'DevOps Engineer', category: 'Cloud Infrastructure', level: 'ENTRY_LEVEL' },
    { title: 'Cloud Infrastructure Engineer', category: 'Cloud Infrastructure', level: 'ENTRY_LEVEL' },
    { title: 'Site Reliability Engineer (SRE)', category: 'Cloud Infrastructure', level: 'MID_LEVEL' },
    { title: 'UI/UX Designer', category: 'Design', level: 'ENTRY_LEVEL' },
    { title: 'QA Automation Engineer', category: 'Quality Assurance', level: 'ENTRY_LEVEL' },
    { title: 'Mobile App Developer (React Native/Flutter)', category: 'Mobile Engineering', level: 'ENTRY_LEVEL' },
    { title: 'Cybersecurity Analyst', category: 'Security', level: 'ENTRY_LEVEL' },
    { title: 'Systems Architect', category: 'Architecture', level: 'MID_LEVEL' },
    { title: 'Database Administrator (DBA)', category: 'Database', level: 'ENTRY_LEVEL' },
    { title: 'Business Analyst', category: 'Analytics', level: 'ENTRY_LEVEL' },
    { title: 'Technical Product Manager', category: 'Product', level: 'MID_LEVEL' },
    { title: 'Scrum Master', category: 'Management', level: 'MID_LEVEL' },
    { title: 'Prompt Engineer / AI Applications Engineer', category: 'Data & AI', level: 'ENTRY_LEVEL' },
    { title: 'Embedded Systems Developer', category: 'Engineering', level: 'ENTRY_LEVEL' },
  ];

  const jobRoleMap = new Map<string, any>();
  for (const jr of jobRolesData) {
    const role = await prisma.jobRole.create({ data: jr });
    jobRoleMap.set(jr.title, role);
  }
  console.log(`✅ ${jobRolesData.length} Job Roles created`);

  // Set Demo User Target Company & Role
  const tcs = companyMap.get('TCS (Tata Consultancy Services)');
  const fullStackRole = jobRoleMap.get('Full Stack Developer');
  if (tcs && fullStackRole) {
    await prisma.profile.update({
      where: { userId: demoUser.id },
      data: {
        targetCompanyId: tcs.id,
        targetRoleId: fullStackRole.id,
      }
    });
  }

  // 6. Link Company + Job Roles & Requirements (110+ Requirements)
  let requirementCount = 0;
  for (const comp of companiesData) {
    for (const roleTitle of ['Full Stack Developer', 'Software Development Engineer (SDE-1)', 'Frontend Developer', 'Backend Developer', 'AI/ML Engineer']) {
      const cObj = companyMap.get(comp.name);
      const rObj = jobRoleMap.get(roleTitle);

      if (cObj && rObj) {
        const cjr = await prisma.companyJobRole.create({
          data: {
            companyId: cObj.id,
            jobRoleId: rObj.id,
            interviewProcess: 'Round 1: Online Aptitude & Coding Assessment. Round 2: Technical Architecture. Round 3: HR & Management Interview.',
          }
        });

        // 5-6 requirements per combination
        const reqSkills = roleTitle.includes('Frontend')
          ? ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Git']
          : roleTitle.includes('Backend')
          ? ['Node.js', 'Express.js', 'PostgreSQL', 'SQL', 'REST APIs', 'Docker']
          : roleTitle.includes('AI/ML')
          ? ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'SQL', 'Git']
          : ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'];

        for (const skName of reqSkills) {
          const sObj = skillMap.get(skName);
          if (sObj) {
            await prisma.skillRequirement.create({
              data: {
                companyJobRoleId: cjr.id,
                skillId: sObj.id,
                requiredLevel: 'INTERMEDIATE',
                importance: skName === 'JavaScript' || skName === 'Node.js' || skName === 'React' || skName === 'Python' ? 'REQUIRED' : 'PREFERRED',
              }
            });
            requirementCount++;
          }
        }
      }
    }
  }
  console.log(`✅ ${requirementCount} Skill Requirements created`);

  // 7. Create Training Resources (32 Training Resources)
  const trainingItems = [
    { skillName: 'Node.js', title: 'Complete Node.js Developer Masterclass', provider: 'Node.js Official Docs & Guide', url: 'https://nodejs.org/en/learn', durationHours: 15.0 },
    { skillName: 'Node.js', title: 'Node.js Security and Microservices', provider: 'Coursera', url: 'https://www.coursera.org/learn/server-side-nodejs', durationHours: 10.0 },
    { skillName: 'PostgreSQL', title: 'PostgreSQL Database Architecture & SQL Mastery', provider: 'PostgreSQL Official Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', durationHours: 12.0 },
    { skillName: 'PostgreSQL', title: 'Interactive SQL Query Optimization', provider: 'SQLBolt', url: 'https://sqlbolt.com/', durationHours: 8.0 },
    { skillName: 'Docker', title: 'Docker Containers for Full Stack Engineers', provider: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started/', durationHours: 8.0 },
    { skillName: 'Docker', title: 'Production Containerization with Docker & Compose', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', durationHours: 6.0 },
    { skillName: 'TypeScript', title: 'Production TypeScript for React & Backend', provider: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', durationHours: 10.0 },
    { skillName: 'TypeScript', title: 'TypeScript Fundamentals', provider: 'Coursera', url: 'https://www.coursera.org/learn/typescript', durationHours: 7.0 },
    { skillName: 'System Design', title: 'Scalable System Design Fundamentals', provider: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', durationHours: 20.0 },
    { skillName: 'System Design', title: 'Grokking System Design Architecture', provider: 'Educative.io', url: 'https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers', durationHours: 14.0 },
    { skillName: 'React', title: 'Modern React 18 with Redux & Hooks', provider: 'React Official Interactive Documentation', url: 'https://react.dev/learn', durationHours: 18.0 },
    { skillName: 'React', title: 'Front-End Web Development with React', provider: 'Coursera', url: 'https://www.coursera.org/learn/front-end-react', durationHours: 9.0 },
    { skillName: 'Next.js', title: 'Next.js 14 App Router Boot Camp', provider: 'Vercel Next.js Academy', url: 'https://nextjs.org/learn', durationHours: 12.0 },
    { skillName: 'Python', title: 'Python 3 Complete Developer Tutorial', provider: 'Python Official Documentation', url: 'https://docs.python.org/3/tutorial/', durationHours: 22.0 },
    { skillName: 'Java', title: 'Java SE 17 Developer Certification Preparation', provider: 'Oracle Java Dev Portal', url: 'https://dev.java/learn/', durationHours: 25.0 },
    { skillName: 'AWS', title: 'AWS Certified Solutions Architect Associate', provider: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials', durationHours: 30.0 },
    { skillName: 'Kubernetes', title: 'Certified Kubernetes Administrator (CKA) Intensive', provider: 'Kubernetes Official Documentation', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', durationHours: 24.0 },
    { skillName: 'Git', title: 'Mastering Git & GitHub Workflows', provider: 'Pro Git Official Book', url: 'https://git-scm.com/book/en/v2', durationHours: 5.0 },
    { skillName: 'REST APIs', title: 'RESTful API Engineering Best Practices', provider: 'RESTful API Guide', url: 'https://restfulapi.net/', durationHours: 8.0 },
    { skillName: 'GraphQL', title: 'GraphQL API Design with Node & React', provider: 'GraphQL Official Guide', url: 'https://graphql.org/learn/', durationHours: 10.0 },
    { skillName: 'Data Structures', title: 'Data Structures and Algorithms Specialization', provider: 'freeCodeCamp Curriculum', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', durationHours: 35.0 },
    { skillName: 'Algorithms', title: 'Competitive Programming & Algorithms Part 1', provider: 'Coursera', url: 'https://www.coursera.org/learn/algorithms-part1', durationHours: 28.0 },
    { skillName: 'Unit Testing', title: 'Test-Driven Development with Jest & Vitest', provider: 'Jest Official Getting Started', url: 'https://jestjs.io/docs/getting-started', durationHours: 11.0 },
    { skillName: 'CI/CD', title: 'Automated CI/CD Pipelines with GitHub Actions', provider: 'GitHub Actions Official Documentation', url: 'https://docs.github.com/en/actions', durationHours: 7.0 },
    { skillName: 'Machine Learning', title: 'Machine Learning Specialization by Andrew Ng', provider: 'Coursera & DeepLearning.AI', url: 'https://www.coursera.org/specializations/machine-learning-introduction', durationHours: 40.0 },
    { skillName: 'Deep Learning', title: 'Deep Learning Specialization with PyTorch & TensorFlow', provider: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/courses/deep-learning-specialization/', durationHours: 45.0 },
    { skillName: 'NLP', title: 'Natural Language Processing with Attention & Transformers', provider: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/courses/natural-language-processing-specialization/', durationHours: 18.0 },
    { skillName: 'Tailwind CSS', title: 'Tailwind CSS Fundamentals to Custom Design Systems', provider: 'Tailwind CSS Official Docs', url: 'https://tailwindcss.com/docs/installation', durationHours: 6.0 },
    { skillName: 'Figma', title: 'UI/UX Design Masterclass with Figma', provider: 'Figma Official Help Center', url: 'https://help.figma.com/hc/en-us/categories/360002042553-Figma-design', durationHours: 14.0 },
    { skillName: 'Agile/Scrum', title: 'Professional Scrum Master (PSM I) Prep Course', provider: 'Scrum.org Resources', url: 'https://www.scrum.org/resources/what-is-scrum', durationHours: 8.0 },
    { skillName: 'MongoDB', title: 'MongoDB Developer & DBA Certification', provider: 'MongoDB University', url: 'https://learn.mongodb.com/', durationHours: 15.0 },
    { skillName: 'Cybersecurity Fundamentals', title: 'OWASP Top 10 Web Application Security Mastery', provider: 'OWASP Project', url: 'https://owasp.org/www-project-top-ten/', durationHours: 9.0 },
  ];

  for (const t of trainingItems) {
    const sObj = skillMap.get(t.skillName);
    if (sObj) {
      await prisma.trainingResource.create({
        data: {
          skillId: sObj.id,
          title: t.title,
          provider: t.provider,
          url: t.url,
          type: 'COURSE',
          durationHours: t.durationHours,
          level: 'INTERMEDIATE',
        }
      });
    }
  }
  console.log(`✅ ${trainingItems.length} Training Resources created`);

  // 8. Create Projects (21 Projects with ProjectSkills)
  const projectsSeed = [
    {
      title: 'Full-Stack E-Commerce Platform with Stripe & Microservices',
      difficulty: 'INTERMEDIATE',
      description: 'Build a production-ready shopping application complete with JWT user authentication, dynamic product catalog, cart persistence, and Stripe payment gateway.',
      techStackJson: JSON.stringify(['React', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS']),
      skills: ['React', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS'],
      learningOutcomes: 'Master RESTful API design, database migrations, authentication security, and state management.',
      estimatedHours: 25,
    },
    {
      title: 'AI Resume Keyword & ATS Compliance Inspector',
      difficulty: 'ADVANCED',
      description: 'Develop an automated NLP pipeline that parses resumes, calculates keyword density against job descriptions, and renders scorecards.',
      techStackJson: JSON.stringify(['TypeScript', 'Next.js', 'Python', 'REST APIs']),
      skills: ['TypeScript', 'Next.js', 'Python', 'REST APIs'],
      learningOutcomes: 'Gain practical experience in text parsing, regex normalization, and LLM prompt engineering.',
      estimatedHours: 30,
    },
    {
      title: 'Real-Time Collaborative Project Management Board (Kanban)',
      difficulty: 'INTERMEDIATE',
      description: 'Create a Trello-like task management board with drag-and-drop support, real-time WebSocket updates, and role-based permissions.',
      techStackJson: JSON.stringify(['React', 'Node.js', 'MongoDB', 'JavaScript']),
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      learningOutcomes: 'Learn real-time communication patterns, optimistic UI updates, and drag-and-drop interactions.',
      estimatedHours: 20,
    },
    {
      title: 'Cloud Native Microservices Observability Dashboard',
      difficulty: 'ADVANCED',
      description: 'Implement distributed tracing, centralized logging, and Prometheus metric monitoring across 4 microservices.',
      techStackJson: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'Go', 'PostgreSQL']),
      skills: ['Docker', 'Kubernetes', 'AWS', 'Go', 'PostgreSQL'],
      learningOutcomes: 'Understand container orchestration, health checks, and service mesh architecture.',
      estimatedHours: 35,
    },
    {
      title: 'Automated CI/CD Pipeline & Infrastructure Provisioner',
      difficulty: 'INTERMEDIATE',
      description: 'Write Terraform scripts to spin up AWS EC2/RDS instances and configure GitHub Actions for automated unit testing and deployment.',
      techStackJson: JSON.stringify(['Terraform', 'AWS', 'CI/CD', 'Docker', 'Git']),
      skills: ['Terraform', 'AWS', 'CI/CD', 'Docker', 'Git'],
      learningOutcomes: 'Master Infrastructure as Code (IaC) principles and automated deployment gates.',
      estimatedHours: 22,
    },
    {
      title: 'Multi-Tenant SaaS Subscription Platform',
      difficulty: 'ADVANCED',
      description: 'Design a multi-tenant SaaS backend with isolated schema access, custom custom domain routing, and automated invoice billing.',
      techStackJson: JSON.stringify(['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Node.js']),
      skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Node.js'],
      learningOutcomes: 'Learn multi-tenancy isolation models, middleware security, and webhooks.',
      estimatedHours: 40,
    },
    {
      title: 'High-Throughput Distributed Rate Limiter Middleware',
      difficulty: 'INTERMEDIATE',
      description: 'Build a Redis token-bucket rate limiter library for Express and Fastify APIs to protect endpoints from DDoS traffic.',
      techStackJson: JSON.stringify(['Node.js', 'Redis', 'Express.js', 'TypeScript']),
      skills: ['Node.js', 'Redis', 'Express.js', 'TypeScript'],
      learningOutcomes: 'Implement sliding window log algorithms and Redis atomic operations.',
      estimatedHours: 15,
    },
    {
      title: 'Customer Feedback Sentiment Analysis Engine',
      difficulty: 'INTERMEDIATE',
      description: 'Train a HuggingFace Transformer model to classify customer support tickets by sentiment and auto-tag target team handlers.',
      techStackJson: JSON.stringify(['Python', 'Machine Learning', 'NLP', 'FastAPI']),
      skills: ['Python', 'Machine Learning', 'NLP', 'FastAPI'],
      learningOutcomes: 'Learn text preprocessing, vector embeddings, and model API serving.',
      estimatedHours: 28,
    },
    {
      title: 'Real-Time Financial Stock Market Analytics Dashboard',
      difficulty: 'ADVANCED',
      description: 'Stream real-time WebSocket ticker updates, compute moving averages, and render responsive Candlestick charts with Recharts.',
      techStackJson: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'REST APIs']),
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
      learningOutcomes: 'Master state optimization for high-frequency data streams.',
      estimatedHours: 24,
    },
    {
      title: 'GraphQL Federated Gateway for Enterprise APIs',
      difficulty: 'ADVANCED',
      description: 'Unify 3 backend REST microservices into a single Apollo GraphQL Federation Gateway schema.',
      techStackJson: JSON.stringify(['GraphQL', 'Node.js', 'TypeScript', 'Docker']),
      skills: ['GraphQL', 'Node.js', 'TypeScript', 'Docker'],
      learningOutcomes: 'Understand schema stitching, resolver optimization, and N+1 query prevention.',
      estimatedHours: 26,
    },
    {
      title: 'Secure Healthcare Patient Records Portal (HIPAA Compliant)',
      difficulty: 'ADVANCED',
      description: 'Build an encrypted health record management portal with audit trail logging, OAuth2 RBAC, and PDF export.',
      techStackJson: JSON.stringify(['Java', 'Spring Boot', 'PostgreSQL', 'Cybersecurity Fundamentals']),
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Cybersecurity Fundamentals'],
      learningOutcomes: 'Implement AES-256 field encryption and OWASP security controls.',
      estimatedHours: 32,
    },
    {
      title: 'Mobile Fitness & Calorie Tracker App',
      difficulty: 'INTERMEDIATE',
      description: 'Cross-platform mobile application tracking daily workouts, macro nutrients, and offline local DB sync.',
      techStackJson: JSON.stringify(['Mobile App Developer (React Native/Flutter)', 'TypeScript', 'Node.js']),
      skills: ['TypeScript', 'Node.js', 'JavaScript'],
      learningOutcomes: 'Learn mobile navigation, local SQLite caching, and push notifications.',
      estimatedHours: 25,
    },
    {
      title: 'Distributed File Storage & Sharing System',
      difficulty: 'INTERMEDIATE',
      description: 'S3-compatible file storage server with presigned upload URLs, chunked streaming, and duplicate file deduplication.',
      techStackJson: JSON.stringify(['Go', 'AWS', 'Docker', 'REST APIs']),
      skills: ['Go', 'AWS', 'Docker', 'REST APIs'],
      learningOutcomes: 'Master byte stream handling, SHA-256 checksums, and cloud storage SDKs.',
      estimatedHours: 20,
    },
    {
      title: 'Interactive Code Execution Sandbox for Engineering Assessments',
      difficulty: 'ADVANCED',
      description: 'Build a Judge0-like online code runner executing untrusted JavaScript, Python, and C++ inside isolated Docker containers.',
      techStackJson: JSON.stringify(['Node.js', 'Docker', 'Linux', 'Express.js', 'React']),
      skills: ['Node.js', 'Docker', 'Linux', 'Express.js', 'React'],
      learningOutcomes: 'Understand container resource limits (cgroups), execution timeouts, and security sandboxing.',
      estimatedHours: 38,
    },
    {
      title: 'Developer Portfolio Generator & Custom Domain Hosting Tool',
      difficulty: 'BEGINNER',
      description: 'SaaS generator allowing candidates to fill out Markdown profile details and render custom responsive portfolio sites.',
      techStackJson: JSON.stringify(['HTML5', 'CSS3', 'JavaScript', 'React']),
      skills: ['HTML5', 'CSS3', 'JavaScript', 'React'],
      learningOutcomes: 'Master semantic HTML, flexbox/grid responsive layouts, and DOM manipulation.',
      estimatedHours: 12,
    },
    {
      title: 'Smart Learning Management System (LMS) Quiz Engine',
      difficulty: 'INTERMEDIATE',
      description: 'Interactive quiz portal supporting multiple question types, automated grading, leaderboards, and instant explanations.',
      techStackJson: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS']),
      skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      learningOutcomes: 'Design clean quiz schemas, timer state management, and score analytics.',
      estimatedHours: 18,
    },
    {
      title: 'AI Automated Interview Transcriber & Feedback Generator',
      difficulty: 'ADVANCED',
      description: 'Audio speech-to-text pipeline that records mock interview audio, transcribes answer text, and rates answer clarity.',
      techStackJson: JSON.stringify(['Python', 'NLP', 'FastAPI', 'LLM Prompt Engineering']),
      skills: ['Python', 'NLP', 'FastAPI', 'LLM Prompt Engineering'],
      learningOutcomes: 'Integrate Speech API models and structure evaluation prompts.',
      estimatedHours: 30,
    },
    {
      title: 'Automated E-Commerce End-to-End Test Suite',
      difficulty: 'INTERMEDIATE',
      description: 'Build a comprehensive Playwright/Cypress end-to-end testing suite validating user checkout flows across 5 browsers.',
      techStackJson: JSON.stringify(['Unit Testing', 'TypeScript', 'CI/CD', 'Git']),
      skills: ['Unit Testing', 'TypeScript', 'CI/CD', 'Git'],
      learningOutcomes: 'Master page object models, visual regression testing, and CI automated test runs.',
      estimatedHours: 16,
    },
    {
      title: 'DevOps Centralized Log Aggregator & Alerting Engine',
      difficulty: 'ADVANCED',
      description: 'Log ingestion pipeline consuming server syslog events, indexing records in Elasticsearch, and dispatching Slack webhooks on 5xx bursts.',
      techStackJson: JSON.stringify(['Elasticsearch', 'Docker', 'Go', 'Linux']),
      skills: ['Elasticsearch', 'Docker', 'Go', 'Linux'],
      learningOutcomes: 'Learn log parsing, inverted indexes, and threshold alert triggers.',
      estimatedHours: 28,
    },
    {
      title: 'Custom Headless CMS Engine with Dynamic Content Schemas',
      difficulty: 'ADVANCED',
      description: 'Content management system allowing admins to create custom JSON content types and consume auto-generated REST/GraphQL endpoints.',
      techStackJson: JSON.stringify(['Next.js', 'TypeScript', 'PostgreSQL', 'GraphQL']),
      skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'GraphQL'],
      learningOutcomes: 'Master dynamic SQL query building and metadata-driven UI builders.',
      estimatedHours: 32,
    },
    {
      title: 'Social Media Candidate Networking & Referral Portal',
      difficulty: 'INTERMEDIATE',
      description: 'Peer referral network allowing job seekers to connect with alumni mentors, request mock interviews, and exchange referral links.',
      techStackJson: JSON.stringify(['React', 'Node.js', 'Express.js', 'SQL']),
      skills: ['React', 'Node.js', 'Express.js', 'SQL'],
      learningOutcomes: 'Build social feed algorithms, notification triggers, and user connections.',
      estimatedHours: 22,
    },
  ];

  for (const p of projectsSeed) {
    const createdProject = await prisma.project.create({
      data: {
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        techStackJson: p.techStackJson,
        learningOutcomes: p.learningOutcomes,
        estimatedHours: p.estimatedHours,
      }
    });

    for (const skName of p.skills) {
      const sObj = skillMap.get(skName);
      if (sObj) {
        await prisma.projectSkill.create({
          data: {
            projectId: createdProject.id,
            skillId: sObj.id,
          }
        });
      }
    }
  }
  console.log(`✅ ${projectsSeed.length} Projects created`);

  // 9. Create Assessments & Questions (52 Questions across 4 Assessments)
  const assessmentConfigs = [
    {
      title: 'Full Stack JavaScript & Node.js Technical Evaluation',
      category: 'Technical',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 30,
      questionCount: 15,
      topic: 'JavaScript, Node.js, Express, REST APIs',
    },
    {
      title: 'Frontend Web Engineering & React Mastery',
      category: 'Technical',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 30,
      questionCount: 15,
      topic: 'React, HTML5, CSS3, State Management',
    },
    {
      title: 'Database Architecture, SQL & Data Modeling Assessment',
      category: 'Database',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 25,
      questionCount: 12,
      topic: 'PostgreSQL, SQL Queries, Indexing, Transactions',
    },
    {
      title: 'Quantitative & Logical Aptitude Test for IT Recruitment',
      category: 'Aptitude',
      difficulty: 'INTERMEDIATE',
      durationMinutes: 20,
      questionCount: 10,
      topic: 'Logical Reasoning, Quantitative Analysis',
    },
  ];

  let totalQuestionsCount = 0;
  for (const cfg of assessmentConfigs) {
    const createdAss = await prisma.assessment.create({
      data: {
        title: cfg.title,
        category: cfg.category,
        difficulty: cfg.difficulty,
        durationMinutes: cfg.durationMinutes,
        passPercentage: 60.0,
      }
    });

    for (let i = 1; i <= cfg.questionCount; i++) {
      totalQuestionsCount++;
      let questionText = `[${cfg.category} Q${i}] What is a key principle when working with ${cfg.topic.split(',')[i % cfg.topic.split(',').length].trim()} in production systems?`;
      let options = [
        'Always follow non-blocking asynchronous patterns and modular separation of concerns',
        'Bypass database transaction locks to improve execution speed',
        'Store unencrypted sensitive credentials directly in source code',
        'Avoid unit testing and test exclusively in production environments'
      ];
      let correctAnswer = options[0];
      let explanation = `Best practices require non-blocking asynchronous patterns, security compliance, and proper architectural isolation.`;

      if (cfg.category === 'Aptitude') {
        questionText = `[Aptitude Q${i}] If a team completes ${i * 2} tasks in 4 days, how many tasks can 3 engineers complete in ${i + 2} days working at the same rate?`;
        options = [`${(i + 2) * 3} tasks`, `${i * 5} tasks`, `${i * 2 + 4} tasks`, `${i * 4} tasks`];
        correctAnswer = options[0];
        explanation = `Rate calculation: Tasks completed per engineer-day multiplied by total engineer-days.`;
      }

      await prisma.assessmentQuestion.create({
        data: {
          assessmentId: createdAss.id,
          questionText,
          optionsJson: JSON.stringify(options),
          correctAnswer,
          explanation,
          points: 10.0,
        }
      });
    }
  }
  console.log(`✅ ${totalQuestionsCount} Assessment Questions created across 4 assessments`);

  // 10. Create Jobs (32 Jobs)
  let jobCount = 0;
  for (const comp of companiesData) {
    const cObj = companyMap.get(comp.name);
    if (!cObj) continue;

    const titles = [
      { title: 'Graduate Trainee - Full Stack Developer', salary: '₹4.5 LPA - ₹6.5 LPA', skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'] },
      { title: 'Software Development Engineer I (SDE-1)', salary: '₹14 LPA - ₹20 LPA', skills: ['Data Structures', 'Algorithms', 'Java', 'System Design', 'AWS'] },
      { title: 'Associate Frontend Engineer', salary: '₹6 LPA - ₹9 LPA', skills: ['React', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'] },
    ];

    for (const t of titles) {
      jobCount++;
      await prisma.job.create({
        data: {
          companyId: cObj.id,
          title: `${t.title} - ${comp.name}`,
          location: 'Bengaluru / Hybrid',
          jobType: 'FULL_TIME',
          description: `${comp.name} is hiring entry-level engineers to join our high-scale engineering team. You will build customer-facing features and scalable web backend services.`,
          requirementsJson: JSON.stringify(t.skills),
          salaryRange: t.salary,
          source: 'INTERNAL_SEED',
          applicationUrl: `${comp.website}/careers/job-${jobCount}`,
          status: 'ACTIVE',
        }
      });
    }
  }
  console.log(`✅ ${jobCount} Jobs created`);

  console.log('🎉 Database Seeding Completed Successfully with Full Quantitative Standards!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
