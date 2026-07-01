import { UserProfile, JobApplication, CareerMentor, RoadmapNode, ResumeDetails, CVAnalysisResult } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  targetRole: 'Full Stack Engineer',
  targetIndustry: 'Technology / SaaS',
  experienceLevel: 'Mid',
  resumeScore: 78,
};

export const initialApplications: JobApplication[] = [
  {
    id: '1',
    company: 'Stripe',
    role: 'Software Engineer, Developer Experience',
    salary: '$140,000 - $175,000',
    location: 'San Francisco, CA (Hybrid)',
    status: 'interviewing',
    dateApplied: '2026-06-15',
    link: 'https://stripe.com/jobs/123',
    notes: 'Had initial recruiter call. Technical screen scheduled for Friday morning. Focused heavily on node, databases, and system design.',
    matchScore: 88,
    coverLetter: 'Dear Hiring Team at Stripe,\n\nI am writing to express my strong interest in the Software Engineer position for the Developer Experience team. Stripe has set the gold standard for developer tools, APIs, and documentation worldwide. As a developer who is passionate about creating intuitive, high-performance tooling and seamless developer workflows, this is the exact environment where I want to make an impact...',
  },
  {
    id: '2',
    company: 'Airbnb',
    role: 'Frontend Engineer, Core Services',
    salary: '$135,000 - $160,000',
    location: 'Remote (US)',
    status: 'applied',
    dateApplied: '2026-06-18',
    link: 'https://airbnb.com/careers/456',
    notes: 'Submitted application through a mutual referral from Jane Doe. Waiting for feedback.',
    matchScore: 92,
  },
  {
    id: '3',
    company: 'Figma',
    role: 'Product Engineer',
    salary: '$150,000 - $185,000',
    location: 'New York, NY (On-site)',
    status: 'wishlist',
    dateApplied: '2026-06-20',
    link: 'https://figma.com/careers/789',
    notes: 'Drafting resume adjustments. Figma specializes in web assemblies and highly interactive canvas environments. I should highlight my canvas-based projects and rendering performance optimizations.',
    matchScore: 84,
  },
  {
    id: '4',
    company: 'Vercel',
    role: 'React/Framework Engineer',
    salary: '$160,000 - $200,000',
    location: 'Remote (US)',
    status: 'offered',
    dateApplied: '2026-05-28',
    link: 'https://vercel.com/careers/frameworks',
    notes: 'Received written offer! $170k base + equity + unlimited PTO. Reviewing package before accepting or initiating counter-offer discussion.',
    matchScore: 95,
  },
  {
    id: '5',
    company: 'Slack',
    role: 'Senior Software Engineer, Messaging',
    salary: '$165,000 - $190,000',
    location: 'Denver, CO (Hybrid)',
    status: 'rejected',
    dateApplied: '2026-05-10',
    link: 'https://slack.com/careers',
    notes: 'Made it to final round. Passed all system design reviews but rejected due to lack of specific experience in high-throughput Erlang/Elixir or functional server architecture. Kept on good terms for future team openings.',
    matchScore: 76,
  }
];

export const initialMentors: CareerMentor[] = [
  {
    id: 'mentor-tech',
    name: 'Sarah Chen',
    role: 'Principal Engineer & Tech Architect',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120',
    bio: 'Former Tech Lead at Netflix and Google. Specialized in system design, distributed scaling, and coding interviews. Passionate about helping developers transition into senior roles.',
    greeting: "Hello, I'm Sarah! Whether you want to master a system design interview, review full-stack architectures, or chart a course to Senior Engineer, I'm here to coach you. What system or engineering challenge are we tackling today?",
    category: 'tech'
  },
  {
    id: 'mentor-prod',
    name: 'Marcus Vance',
    role: 'Director of Product, ex-Meta',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120',
    bio: 'Product executive with 15+ years launching cloud SaaS platforms. Expert in product strategy, metrics interviews, and executive communication. He helps bridge engineering and design domains.',
    greeting: "Hi there, I'm Marcus! Navigating the product space requires a fine balance between user needs, technical constraints, and business outcomes. Need help prepping for a product sense, metrics, or case study interview? Let's dive in.",
    category: 'product'
  },
  {
    id: 'mentor-hr',
    name: 'Elena Rostova',
    role: 'Talent Acquisition & Negotiation Coach',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120',
    bio: '10+ years leading Technical Recruiting teams at top startups and big tech. Specialized in behavioral screenings, cultural alignment, salary negotiation strategies, and resume optimization.',
    greeting: "Welcome! I'm Elena. I know exactly what recruiters are looking for when scanning resume stacks or screening candidates. I can also help you script your salary negotiation to secure top-tier compensation. Let's make sure you get what you are worth!",
    category: 'hr'
  },
  {
    id: 'mentor-general',
    name: 'Jordan Kaelen',
    role: 'Executive Career Strategist',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120',
    bio: 'Coaches tech professionals on long-term career planning, personal branding, imposter syndrome, and leadership presence. Former organizational development consultant.',
    greeting: "Hello! I'm Jordan. Your career is not just a series of jobs—it's a continuous journey of growth, impact, and personal fulfillment. If you are feeling stuck, planning a pivotal industry transition, or building your leadership voice, let's craft your strategy.",
    category: 'general'
  }
];

export const initialRoadmap: RoadmapNode[] = [
  {
    id: 'node-1',
    title: 'Advanced System Architecture',
    description: 'Master system design patterns including caching strategies, load balancing, relational vs. non-relational database selection, replication, and horizontal sharding.',
    duration: '2-3 weeks',
    status: 'completed',
    resources: [
      { name: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
      { name: 'Designing Data-Intensive Applications (Book Summary)', url: 'https://github.com/ept/ddia-references' }
    ],
    project: {
      title: 'Distributed Analytics Pipeline',
      description: 'Build a simplified analytics logger capable of parsing 10,000 dummy events/sec, queuing them in Redis, and backing them up to a durable datastore with optimized indexes.',
    }
  },
  {
    id: 'node-2',
    title: 'Full Stack Performance Optimization',
    description: 'Optimize page-load metrics, core web vitals, server-side caching, bundle splitting, React rendering optimizations, database indexing, and query speed profiling.',
    duration: '1-2 weeks',
    status: 'unlocked',
    resources: [
      { name: 'Vercel Front-end Performance Checklist', url: 'https://vercel.com/docs/concepts/speed-insights' },
      { name: 'Chrome DevTools Performance Profiling guide', url: 'https://developer.chrome.com/docs/devtools/performance/' }
    ],
    project: {
      title: 'Lighthouse Score Optimizer',
      description: 'Take a slow React application with large dynamic image grids, profiling its bottleneck areas, implementing lazy loading, dynamic code-splitting, and memoized filters to achieve a >95 Performance score.',
    }
  },
  {
    id: 'node-3',
    title: 'Robust DevOps & Serverless Architecture',
    description: 'Learn modern continuous deployment systems, infrastructure-as-code basics, containerization via Docker, serverless function routing, and edge-side operations.',
    duration: '2 weeks',
    status: 'locked',
    resources: [
      { name: 'Docker Interactive Workshop', url: 'https://www.docker.com/play-with-docker' },
      { name: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' }
    ],
    project: {
      title: 'Multi-stage CD Pipeline',
      description: 'Configure a fully automated continuous deployment pipeline that runs ESLint, tests, bundles a Docker image, and deploys to a test server environment on every main branch push.',
    }
  },
  {
    id: 'node-4',
    title: 'Secure API Design & OAuth 2.0 Integration',
    description: 'Implement modern web security principles including JWT authentication, rate limiting, CORS headers, row-level database security, and standard OAuth login integrations.',
    duration: '1 week',
    status: 'locked',
    resources: [
      { name: 'OWASP Top Ten Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/' },
      { name: 'Auth0 OAuth 2.0 Architectural Overview', url: 'https://oauth.net/2/' }
    ],
    project: {
      title: 'OAuth Rate-Limited API Proxy',
      description: 'Create a Node.js server that authenticates users via OAuth, validates security credentials, and proxies third-party endpoints with active token refreshing and IP-based rate limits.',
    }
  }
];

export const initialResumeDetails: ResumeDetails = {
  personal: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 019-2834',
    website: 'https://alexrivera.dev',
    summary: 'Proactive and detail-oriented Full Stack Software Engineer with 3+ years of experience engineering high-performance web applications, server APIs, and modular component ecosystems. Proven track record of boosting app load times, streamlining databases, and developing rich web experiences.',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'InnovateTech Solutions',
      role: 'Full Stack Developer',
      duration: '2024 - Present',
      description: [
        'Designed, optimized, and maintained 15+ responsive React frontend components and matching Express microservices, enhancing user retention by 14%.',
        'Led migration of relational databases from localized instances to AWS PostgreSQL, resulting in a 35% improvement in API query response times.',
        'Collaborated closely with product teams to design modular components, implementing robust React state hooks and utility caches.'
      ]
    },
    {
      id: 'exp-2',
      company: 'PixelForge Studios',
      role: 'Junior Web Engineer',
      duration: '2023 - 2024',
      description: [
        'Developed client websites using HTML, Tailwind CSS, TypeScript, and React, assuring 100% fluid responsive design across mobile, tablet, and desktop devices.',
        'Refactored legacy vanilla JavaScript widgets into clean functional React hooks, decreasing component file size and boosting runtime efficiency.',
        'Wrote thorough unit tests covering critical user flows, driving code coverage up from 62% to 85%.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      duration: '2019 - 2023',
    }
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'HTML5', 'CSS3', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Git', 'RESTful APIs', 'System Design'
  ]
};

export const initialCVAnalysis: CVAnalysisResult = {
  score: 78,
  strengths: [
    'Excellent summary emphasizing both frontend and backend technologies.',
    'Clear, quantifiable achievements in current role (e.g., 14% retention, 35% API query speedup).',
    'Solid technical stack listed cleanly (TypeScript, React, Node, PostgreSQL).'
  ],
  weaknesses: [
    'Bullet points in the Junior Web Engineer role are slightly descriptive rather than outcome-focused.',
    'Missing cloud deployment and containerization keywords (Docker, Kubernetes, AWS/GCP pipelines) that are highly sought-after for Full Stack roles.',
    'No mention of system testing styles beyond general unit tests (e.g., integration tests or Cypress end-to-end testing).'
  ],
  skillsFound: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'HTML5', 'CSS3', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Git', 'REST APIs', 'System Design', 'AWS'
  ],
  skillsMissing: [
    'Docker', 'Kubernetes', 'CI/CD Pipelines', 'GraphQL', 'Next.js', 'Redis', 'Unit/Integration Testing', 'Cypress'
  ],
  improvements: [
    {
      section: 'InnovateTech Solutions - bullet 3',
      before: 'Collaborated closely with product teams to design modular components, implementing robust React state hooks and utility caches.',
      after: 'Architected modular React component library used across 3 distinct product lines, reducing duplicate UI code by 40% and cutting feature shipping cycles by 12%.',
      reason: 'Replaces passive collaboration language with ownership verbs and inserts highly compelling, outcome-oriented metrics.'
    },
    {
      section: 'PixelForge Studios - bullet 1',
      before: 'Developed client websites using HTML, Tailwind CSS, TypeScript, and React, assuring 100% fluid responsive design across mobile, tablet, and desktop devices.',
      after: 'Delivered 8 responsive web platforms using React and Tailwind CSS, improving lighthouse accessibility scores to a perfect 100% and accelerating page loading by 25%.',
      reason: 'Quantifies website releases and specifically lists professional milestones like Lighthouse and performance metrics.'
    },
    {
      section: 'Skills Summary Section',
      before: 'Add standard lists of tools.',
      after: 'Incorporate: Docker, CI/CD (GitHub Actions), Next.js, Redis, and Cypress.',
      reason: 'These missing skills represent major hiring filters for Mid-to-Senior Full Stack Engineers.'
    }
  ]
};
