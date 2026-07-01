export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  targetIndustry: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  resumeScore: number;
  avatar?: string;
  isAdmin?: boolean;
}

export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offered' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  location: string;
  status: ApplicationStatus;
  dateApplied: string;
  link: string;
  notes: string;
  coverLetter?: string;
  matchScore?: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  userAnswer?: string;
  score?: number; // 0 to 100
  feedback?: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  type: 'Technical' | 'Behavioral' | 'General';
  difficulty: 'Entry' | 'Mid' | 'Senior';
  questions: InterviewQuestion[];
  currentIndex: number;
  completed: boolean;
  overallScore?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface CareerMentor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  greeting: string;
  category: 'tech' | 'product' | 'marketing' | 'hr' | 'general';
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'locked' | 'unlocked' | 'completed';
  resources: { name: string; url: string }[];
  project: {
    title: string;
    description: string;
  };
}

export interface CVAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  skillsFound: string[];
  skillsMissing: string[];
  improvements: { section: string; before: string; after: string; reason: string }[];
}

export interface ResumeDetails {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    website: string;
    summary: string;
  };
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string[];
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    duration: string;
  }[];
  skills: string[];
}
