import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import multer from 'multer';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env['career_copilot_SUPABASE_URL'] || 'https://avvrdkuwgxqyrmaycqlr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env['career_copilot_SUPABASE_SECRET_KEY'];

if (!supabaseKey) {
  console.error('[BOOT] Missing SUPABASE_KEY / career_copilot_SUPABASE_SECRET_KEY. Set it in Vercel project environment variables or .env for local development.');
  if (process.env.VERCEL === '1') {
    throw new Error('FATAL: SUPABASE_KEY is required to start the server.');
  }
}

const supabase = createClient(supabaseUrl, supabaseKey || '');

const EMAIL_FROM = process.env.EMAIL_FROM || 'Aura Career <onboarding@resend.dev>';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendMail(to: string, subject: string, html: string) {
  if (transporter) {
    return transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('No email provider configured. Set RESEND_API_KEY or SMTP env vars.');
  }
  const resendClient = new Resend(apiKey);
  return resendClient.emails.send({ from: EMAIL_FROM, to, subject, html });
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

if (JWT_SECRET === 'change-me-in-production') {
  console.warn('[BOOT] JWT_SECRET is using default fallback. Set a strong secret in environment variables.');
}

const PORT = 3000;
const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.supabase.com", "https://jsearch.p.rapidapi.com", "https://baskarm28-adzuna-v1.p.rapidapi.com", "https://indeed12.p.rapidapi.com", "https://linkedin-data-api.p.rapidapi.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "data:"],
      frameSrc: ["'self'", "https://www.google.com", "https://www.youtube.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

app.use((req, res, next) => {
  // Surface malformed JSON bodies as a clean 400 JSON error instead of letting
  // the parser throw an unhandled error (which, on serverless runtimes, can
  // bubble up as an HTML error page and trigger a client "is not valid JSON").
  express.json()(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
    next();
  });
});

// ==========================================
// DEEP SECURITY SANITIZATION MIDDLEWARE
// ==========================================
function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  let clean = val;
  // 1. Remove script blocks completely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // 2. Remove iframe blocks completely
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  // 3. Strip all HTML tags
  clean = clean.replace(/<\/?[^>]+(>|$)/g, '');
  // 4. Remove dangerous schemas (javascript:, vbscript:, data:)
  clean = clean.replace(/(javascript|vbscript|data):/gi, 'blocked:');
  // 5. Remove event listeners
  clean = clean.replace(/on(load|error|click|mouseover|focus|blur|change|submit|keydown|keypress|keyup)\s*=/gi, 'blocked_event=');
  return clean.trim();
}

function sanitizeObject<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const copy = { ...obj } as any;
    for (const key in copy) {
      if (Object.prototype.hasOwnProperty.call(copy, key)) {
        copy[key] = sanitizeObject(copy[key]);
      }
    }
    return copy as T;
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// AUTH HELPERS
// ==========================================

interface TokenPayload {
  email: string;
  role: string;
}

function getAuthToken(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  return authHeader.slice(7);
}

function issueToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRY });
}

function verifyAuthToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  (req as any).user = payload;
  next();
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI request limit reached. Please wait before trying again.' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' }
});

// ==========================================
// LIVE PERSISTENCE ENGINE (Supabase DB)
// ==========================================

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'abdulsalamjibril5@gmail.com').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env.VERCEL === '1' ? '' : 'Abdul@1051');
let adminSeedPromise: Promise<void> | null = null;

// Pre-seed admin user with highly encrypted credentials if not exists
async function seedAdminUser() {
  if (!ADMIN_PASSWORD) {
    console.warn('[SEED] ADMIN_PASSWORD is not set. Skipping admin credential sync.');
    return;
  }

  const adminEmail = ADMIN_EMAIL;
  const encryptedAdminPass = hashPassword(ADMIN_PASSWORD);

  const { data: existingUser } = await supabase.from('users').select('email').eq('email', adminEmail).single();

  if (!existingUser) {
    const { error } = await supabase.from('users').insert({
      email: adminEmail,
      name: 'Super Admin',
      password: encryptedAdminPass,
      target_role: 'System Administrator',
      target_industry: 'Tech Operations',
      experience_level: 'Senior Executive',
      resume_score: 100,
      email_verified: true,
      verification_code: '000000',
      role: 'admin'
    });
    if (error) throw new Error(`Failed to seed admin: ${error.message}`);
    console.log('[SEED] Admin pre-seeded successfully.');
  } else {
    const { error } = await supabase.from('users').update({ password: encryptedAdminPass, role: 'admin' }).eq('email', adminEmail);
    if (error) throw new Error(`Failed to update admin: ${error.message}`);
    console.log('[SEED] Admin credentials secured');
  }
}

async function ensureAdminUserSeeded() {
  if (!adminSeedPromise) {
    adminSeedPromise = seedAdminUser().catch((err) => {
      adminSeedPromise = null;
      throw err;
    });
  }
  return adminSeedPromise;
}

// ==========================================
// RETRY HELPER FUNCTION FOR GEMINI API
// ==========================================
/**
 * Executes a Gemini API call with exponential backoff retry logic.
 * Retries on 503 (Service Unavailable) errors, with 3 attempts by default.
 * 
 * @param fn - Async function that makes the Gemini API call
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns The result of the API call
 * @throws The original error if all retries fail
 */
async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isServiceUnavailable = err?.status === 503 || err?.message?.includes('503');
      const isLastAttempt = attempt === maxRetries;
      
      if (!isServiceUnavailable || isLastAttempt) {
        throw err;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.warn(`[GEMINI-RETRY] Attempt ${attempt}/${maxRetries} failed with 503. Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
}

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const isGeminiEnabled = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '';

let ai: GoogleGenAI | null = null;
if (isGeminiEnabled) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI successfully initialized server-side.');
  } catch (err) {
    console.error('Failed to initialize Gemini SDK:', err);
  }
} else {
      console.log('Gemini API key is not set. Running with smart mock engines.');
}

// ==========================================
// API ROUTE: Analyze CV
// ==========================================
app.post('/api/gemini/analyze-cv', aiLimiter, async (req, res) => {
  const { cvText, targetRole } = req.body;
  if (!cvText) {
    return res.status(400).json({ error: 'CV content is required for analysis.' });
  }

  const roleName = targetRole || 'Software Engineer';

  if (isGeminiEnabled && ai) {
    try {
      const prompt = `You are an expert HR Lead and Technical Recruiter. Analyze the following candidate CV text for a target role of "${roleName}".
Evaluate the CV and return a JSON structure with exactly these keys:
- "score" (number from 0 to 100 based on its fit, clarity, and metrics representation)
- "strengths" (array of 3-4 strings detailing strong aspects)
- "weaknesses" (array of 3-4 strings detailing areas of concern or missing depth)
- "skillsFound" (array of skills detected in the text)
- "skillsMissing" (array of 5-8 relevant skills typically expected for a "${roleName}" that were not detected or weak)
- "improvements" (array of objects, each with "section", "before", "after", "reason", showing exact bullet points or summaries rewritten to be impact-focused and quantitative)

CV Text:
${cvText}`;

      const response = await callGeminiWithRetry(() =>
        ai!.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      section: { type: Type.STRING },
                      before: { type: Type.STRING },
                      after: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ['section', 'before', 'after', 'reason']
                  }
                }
              },
              required: ['score', 'strengths', 'weaknesses', 'skillsFound', 'skillsMissing', 'improvements']
            }
          }
        })
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Gemini analyze-cv error:', err);
    }
  }

  return res.status(503).json({ error: 'Our CV analysis service is temporarily busy. Please try again in a few moments.' });
});

// ==========================================
// API ROUTE: Optimize Bullets (Resume Lab)
// ==========================================
app.post('/api/gemini/generate-bullets', aiLimiter, async (req, res) => {
  const { bullet, targetRole } = req.body;
  if (!bullet) {
    return res.status(400).json({ error: 'Bullet text is required.' });
  }

  if (isGeminiEnabled && ai) {
    try {
      const prompt = `You are a resume writing expert. Rewrite the following resume bullet point to make it highly professional, metric-driven, and focused on accomplishments for a target role of "${targetRole}".
Return a JSON object with:
- "optimized" (the rewritten bullet point string)
- "reason" (a 1-sentence explanation of why this rewrite is better)`;

      const response = await callGeminiWithRetry(() =>
        ai!.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                optimized: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['optimized', 'reason']
            }
          }
        })
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini generate-bullets error:', err);
    }
  }

  return res.status(503).json({ error: 'Our bullet optimization service is temporarily busy. Please try again in a few moments.' });
});

// ==========================================
// API ROUTE: Career Mentor
// ==========================================
app.post('/api/gemini/mentor-chat', aiLimiter, async (req, res) => {
  const { messages, mentorId, mentorDetails } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages history is required.' });
  }

  const mentorName = mentorDetails?.name || 'Career Mentor';
  const mentorRole = mentorDetails?.role || 'Advisor';
  const mentorBio = mentorDetails?.bio || 'Career consultant.';

  if (isGeminiEnabled && ai) {
    try {
      // Format history for Gemini — filter out any messages with empty text to avoid INVALID_ARGUMENT
      const validMessages = messages.filter((msg: any) => typeof msg.text === 'string' && msg.text.trim().length > 0);
      const formattedHistory = validMessages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text.trim() }]
      }));

      const systemInstruction = `You are ${mentorName}, working as a ${mentorRole}.
Your professional background is: ${mentorBio}.
Provide highly realistic, practical, and highly encouraging advice to the user about their career path, interview preparations, or negotiation.
Keep your answers professional yet warm, and conversational. Speak directly as ${mentorName} and never break character. Keep paragraphs concise and easy to read.`;

      // Grab the last message as prompt, and feed preceding messages as context or run chat
      const lastMessageText = validMessages[validMessages.length - 1]?.text?.trim() || 'Hello';
      const precedingHistory = formattedHistory.slice(0, -1);

      const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        history: precedingHistory
      });

      const response = await callGeminiWithRetry(() => chat.sendMessage({ message: lastMessageText }));
      return res.json({ text: response.text });
    } catch (err) {
      console.error('Gemini mentor-chat error:', err);
    }
  }

  return res.status(503).json({ error: 'Our mentor service is temporarily busy. Please try again in a few moments.' });
});

// ==========================================
// API ROUTE: Learning Roadmap
// ==========================================
app.post('/api/gemini/generate-roadmap', aiLimiter, async (req, res) => {
  const { targetRole, targetIndustry } = req.body;
  const roleName = targetRole || 'Full Stack Engineer';
  const industryName = targetIndustry || 'SaaS';

  if (isGeminiEnabled && ai) {
    try {
      const prompt = `Generate a modern, highly practical 4-step Learning Roadmap for a candidate aiming to become a successful "${roleName}" in the "${industryName}" industry.
Return a JSON array of exactly 4 objects. Each object must represent a learning node with the following keys:
- "id" (string like "node-1", "node-2", etc.)
- "title" (string, name of the phase/skill)
- "description" (string, core concepts to learn)
- "duration" (string, e.g., "1-2 weeks")
- "status" (string, "locked" or "unlocked" or "completed". Make the first node "unlocked" or "completed", and others "locked" or "unlocked")
- "resources" (array of 2 objects, each with "name" and "url")
- "project" (object with "title" and "description" describing a highly practical hands-on portfolio project to validate this skill)

Ensure the roadmap nodes flow sequentially from foundation to advanced.`;

      const response = await callGeminiWithRetry(() =>
        ai!.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  status: { type: Type.STRING },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ['name', 'url']
                    }
                  },
                  project: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['title', 'description']
                  }
                },
                required: ['id', 'title', 'description', 'duration', 'status', 'resources', 'project']
              }
            }
          }
        })
      );

      const parsed = JSON.parse(response.text || '[]');
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini generate-roadmap error:', err);
    }
  }

  return res.status(503).json({ error: 'Our roadmap generation service is temporarily busy. Please try again in a few moments.' });
});

// ==========================================
// API ROUTE: Interview Coaching (Feedback)
// ==========================================
app.post('/api/gemini/interview-question', aiLimiter, async (req, res) => {
  const { sessionState, lastAnswer } = req.body;
  if (!sessionState) {
    return res.status(400).json({ error: 'Session state is required.' });
  }

  const { role, type, difficulty, questions, currentIndex } = sessionState;

  if (isGeminiEnabled && ai) {
    try {
      // If evaluating the user's answer
      if (lastAnswer !== undefined) {
        const questionText = questions[currentIndex]?.question;
        const prompt = `You are a strict, experienced technical interviewer conducting a mock interview for the role of "${role}" (${difficulty} level, ${type} focus).
The candidate was asked the question: "${questionText}"
The candidate's answer was: "${lastAnswer}"

Evaluate the candidate's answer and return a JSON structure with exactly these keys:
- "score" (integer score from 0 to 100 assessing the correctness, completeness, and articulation of the answer)
- "feedback" (a 2-3 sentence coaching note explaining what was strong, what was missing, and how they could improve this specific answer using standard professional keywords)`;

        const response = await callGeminiWithRetry(() =>
          ai!.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  feedback: { type: Type.STRING }
                },
                required: ['score', 'feedback']
              }
            }
          })
        );

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } else {
        // If generating a set of tailored questions (usually done once at startup)
        const prompt = `You are an expert mock interviewer. Generate exactly 1 highly relevant and realistic interview question for a "${role}" position.
Difficulty Level: ${difficulty}
Focus Area: ${type} (e.g. Technical, Behavioral, General)
Already asked questions: ${questions.map((q: any) => q.question).join(' | ') || 'none'}

Return a JSON object with a single key "question" (string). Ensure it probes deeply and is tailored specifically to this role and seniority. Do not repeat already asked questions.`;

        const response = await callGeminiWithRetry(() =>
          ai!.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING }
                },
                required: ['question']
              }
            }
          })
        );

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ question: parsed.question, type, difficulty });
      }
    } catch (err) {
      console.error('Gemini interview-question error:', err);
    }
  }

  return res.status(503).json({ error: 'Our interview coaching service is temporarily busy. Please try again in a few moments.' });
});

// ==========================================
// API ROUTE: Tailor CV for Job (App Tracker)
// ==========================================
app.post('/api/gemini/tailor-application', aiLimiter, async (req, res) => {
  const { company, role, cvText } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: 'Company name and job role are required.' });
  }

  if (isGeminiEnabled && ai) {
    try {
      const prompt = `You are a senior career mentor and copywriter. Generate a tailored, professional Cover Letter for a candidate applying to "${company}" for the position of "${role}".
Utilize any details from this candidate CV:
${cvText || 'Mid-level software engineer with React and Node.js expertise.'}

Structure it beautifully. Return a JSON object with:
- "coverLetter" (the generated letter in text format, spaced with double-newlines)
- "matchScore" (integer from 0 to 100 assessing how well the CV fits the target role)`;

      const response = await callGeminiWithRetry(() =>
        ai!.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                coverLetter: { type: Type.STRING },
                matchScore: { type: Type.INTEGER }
              },
              required: ['coverLetter', 'matchScore']
            }
          }
        })
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini tailor-application error:', err);
    }
  }

  return res.status(503).json({ error: 'Our application tailoring service is temporarily busy. Please try again in a few moments.' });
});

// ==========================================
// API ROUTE: RapidAPI Job Search Integration
// ==========================================

/** Normalise a JSearch job item from search-v2 (data.data.jobs[]) into the standard JobListing shape */
function normaliseJSearchJob(item: any, searchQuery: string): object {
  return {
    id: item.job_id || `jsearch-${Math.random().toString(36).substring(2, 9)}`,
    title: item.job_title || 'Software Engineer',
    company: item.employer_name || 'Unknown Company',
    location: [item.job_city, item.job_state].filter(Boolean).join(', ') || item.job_country || 'Remote',
    salary: item.job_min_salary
      ? `$${item.job_min_salary}${item.job_max_salary ? ` – $${item.job_max_salary}` : ''} / yr`
      : 'Not Specified',
    url: item.job_apply_link || `https://google.com/search?q=${encodeURIComponent((item.job_title || '') + ' ' + (item.employer_name || ''))}`,
    description: item.job_description ? item.job_description.substring(0, 300) + '...' : 'No description provided.',
    source: 'JSearch' as const,
    date_posted: item.job_posted_at_datetime_utc ? item.job_posted_at_datetime_utc.split('T')[0] : undefined
  };
}

/** Fetch JSearch jobs. Falls back to worldwide (country=all) when no location results are returned. */
async function fetchJSearchJobs(q: string, loc: string, cntry: string, apiKey: string): Promise<object[]> {
  const buildUrl = (locationStr: string, countryStr: string) =>
    `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(q + ' ' + locationStr)}&num_pages=1&country=${encodeURIComponent(countryStr)}&date_posted=all`;

  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'jsearch.p.rapidapi.com',
    'x-rapidapi-key': apiKey
  };

  // First attempt: with the user-provided location and country
  let response = await fetch(buildUrl(loc, cntry), { method: 'GET', headers });
  let data = await response.json() as any;
  // JSearch v2 returns { status, data: { jobs: [] } }
  let jobs: any[] = (data.data?.jobs || data.data || []);

  // Fallback: worldwide if no results with the given location filter
  if (jobs.length === 0) {
    console.log(`[JOBS] No results for location "${loc}", retrying worldwide...`);
    response = await fetch(buildUrl(q, 'all'), { method: 'GET', headers });
    data = await response.json() as any;
    jobs = data.data?.jobs || data.data || [];
  }

  return jobs.map((item: any) => normaliseJSearchJob(item, q));
}

app.get('/api/jobs/search', generalLimiter, async (req, res) => {
  // Accept both `source` (sent by frontend) and `provider` (legacy) as the provider key
  const { source, provider, query, location, country, company } = req.query;
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.error('[JOBS] Missing RAPIDAPI_KEY environment variable');
    return res.status(500).json({ error: 'Job search service is not configured.' });
  }

  const prov = String(source || provider || 'jsearch').toLowerCase();
  const q = String(query || 'developer').trim();
  const loc = String(location || '').trim() || 'worldwide';
  const cntry = String(country || 'all').toLowerCase();
  const comp = String(company || '').trim();

  try {
    if (prov === 'jsearch' || prov === 'all') {
      const jobs = await fetchJSearchJobs(q, loc, cntry, apiKey);
      return res.json({ jobs, fromCache: false });

    } else if (prov === 'adzuna') {
      const adzunaCountry = cntry === 'all' ? 'gb' : cntry;
      const url = `https://baskarm28-adzuna-v1.p.rapidapi.com/jobs/${encodeURIComponent(adzunaCountry)}/search/1?what=${encodeURIComponent(q)}&where=${encodeURIComponent(loc)}&results_per_page=10`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'baskarm28-adzuna-v1.p.rapidapi.com',
          'x-rapidapi-key': apiKey
        }
      });
      const data = await response.json() as any;
      const rawJobs = (data.results || []).map((item: any) => ({
        id: item.id || `adzuna-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || q,
        company: item.company?.display_name || 'Unknown Company',
        location: item.location?.display_name || loc,
        salary: item.salary_min ? `£${item.salary_min}${item.salary_max ? ` – £${item.salary_max}` : ''} / yr` : 'Not Specified',
        url: item.redirect_url || 'https://www.adzuna.co.uk/',
        description: item.description ? item.description.substring(0, 300) + '...' : 'Adzuna Job Listing',
        source: 'Adzuna' as const,
        date_posted: item.created ? item.created.split('T')[0] : undefined
      }));
      // Worldwide fallback via JSearch if adzuna returns nothing
      const jobs = rawJobs.length > 0 ? rawJobs : await fetchJSearchJobs(q, loc, 'all', apiKey);
      return res.json({ jobs, fromCache: false });

    } else if (prov === 'indeed') {
      let rawJobs: any[] = [];
      try {
        const url = `https://indeed12.p.rapidapi.com/jobs/search?query=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&locality=${encodeURIComponent(cntry === 'all' ? 'us' : cntry)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'indeed12.p.rapidapi.com',
            'x-rapidapi-key': apiKey
          }
        });
        const data = await response.json() as any;
        rawJobs = (data.jobs || data.data || []).map((item: any) => ({
          id: item.id || `indeed-${Math.random().toString(36).substring(2, 9)}`,
          title: item.title || item.role || 'Job Position',
          company: item.company || comp || 'Indeed Company',
          location: item.location || loc,
          salary: item.salary || 'Not Specified',
          url: item.link || `https://www.indeed.com/q-${encodeURIComponent(q)}-jobs.html`,
          description: item.summary || item.description || 'Indeed Job Listing',
          source: 'Indeed' as const,
          date_posted: undefined
        }));
      } catch (innerErr) {
        console.error('Indeed lookup failed:', innerErr);
      }
      const jobs = rawJobs.length > 0 ? rawJobs : await fetchJSearchJobs(q, loc, 'all', apiKey);
      return res.json({ jobs, fromCache: false });

    } else if (prov === 'linkedin') {
      let rawJobs: any[] = [];
      try {
        const url = `https://linkedin-data-api.p.rapidapi.com/search-jobs?keywords=${encodeURIComponent(q)}&locationId=92000000&datePosted=anyTime&sort=mostRelevant`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
            'x-rapidapi-key': apiKey
          }
        });
        const data = await response.json() as any;
        rawJobs = (data.data || data.items || data.jobs || []).map((item: any) => ({
          id: item.id || `linkedin-${Math.random().toString(36).substring(2, 9)}`,
          title: item.title || 'Developer Position',
          company: item.company?.name || item.companyName || 'LinkedIn Partner',
          location: item.location || 'Worldwide',
          salary: item.salary || 'Not Specified',
          url: item.url || item.jobUrl || item.navigationUrl || 'https://www.linkedin.com/jobs',
          description: `LinkedIn listing: ${q}`,
          source: 'LinkedIn' as const,
          date_posted: undefined
        }));
      } catch (innerErr) {
        console.error('LinkedIn API failed:', innerErr);
      }
      const jobs = rawJobs.length > 0 ? rawJobs : await fetchJSearchJobs(q, loc, 'all', apiKey);
      return res.json({ jobs, fromCache: false });

    } else {
      return res.status(400).json({ error: 'Unsupported provider requested.' });
    }
  } catch (error: any) {
    console.error('RapidAPI job search error:', error);
    // Last-resort: try JSearch worldwide
    try {
      const jobs = await fetchJSearchJobs(q, '', 'all', process.env.RAPIDAPI_KEY || '');
      return res.json({ jobs, fromCache: false, note: 'Worldwide fallback results' });
    } catch {
      return res.status(500).json({ error: 'Job search is temporarily unavailable. Please try again later.' });
    }
  }
});

// ==========================================
// API ROUTE: CV File Upload & Text Extraction
// ==========================================
const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExt = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) && allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are permitted.'));
    }
  }
});

async function ensurePdfRuntimeGlobals() {
  if (globalThis.DOMMatrix && globalThis.ImageData && globalThis.Path2D) {
    return;
  }

  const canvas = await import('@napi-rs/canvas');
  const globalScope = globalThis as any;
  globalScope.DOMMatrix ||= canvas.DOMMatrix;
  globalScope.ImageData ||= canvas.ImageData;
  globalScope.Path2D ||= canvas.Path2D;
}

app.post('/api/gemini/analyze-cv-file', aiLimiter, cvUpload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CV file was uploaded.' });
  }

  const targetRole = String(req.body?.targetRole || 'Software Engineer').trim();
  const ext = path.extname(req.file.originalname).toLowerCase();
  let cvText = '';

  try {
    if (ext === '.pdf') {
      await ensurePdfRuntimeGlobals();
      // Parse with pdfjs-dist directly, using the worker as an in-memory data
      // URL (from pdf-parse/worker) so pdfjs NEVER resolves a worker from the
      // filesystem. On Vercel's serverless runtime the pdf.worker.mjs side-file
      // is absent from /var/task, which is what made the "fake worker" path
      // throw: "Cannot find module .../pdf.worker.mjs". A data URL sidesteps
      // filesystem resolution entirely.
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const { getData: getPdfWorkerData } = await import('pdf-parse/worker');
      // GlobalWorkerOptions.workerSrc must be a string; getData() returns the
      // worker bundled as a base64 data: URL.
      pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerData();
      
      // Configure standard font data URL to eliminate warnings
      // This ensures pdfjs can properly render fonts in PDFs
      (pdfjs.GlobalWorkerOptions as any).standardFontDataUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`;
      
      const doc = await pdfjs.getDocument({
        data: new Uint8Array(req.file.buffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`
      }).promise;
      try {
        let text = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ') + '\n';
        }
        cvText = text;
      } finally {
        await doc.destroy();
      }
    } else if (ext === '.docx' || ext === '.doc') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      cvText = result.value || '';
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Only PDF and DOCX are accepted.' });
    }
  } catch (parseErr: any) {
    console.error('[CV-UPLOAD] File parse error:', parseErr);
    return res.status(422).json({ error: 'Failed to extract text from the uploaded file. Please ensure it is a valid PDF or DOCX.' });
  }

  const cleanText = cvText.replace(/\s+/g, ' ').trim();
  if (cleanText.length < 50) {
    return res.status(422).json({ error: 'The uploaded CV appears to be empty or unreadable. Please upload a text-based PDF or DOCX file.' });
  }

  if (isGeminiEnabled && ai) {
    try {
      const prompt = `You are an expert HR Lead and Technical Recruiter. Analyze the following candidate CV text for a target role of "${targetRole}".
Evaluate the CV and return a JSON structure with exactly these keys:
- "score" (number from 0 to 100 based on its fit, clarity, and metrics representation)
- "strengths" (array of 3-4 strings detailing strong aspects)
- "weaknesses" (array of 3-4 strings detailing areas of concern or missing depth)
- "skillsFound" (array of skills detected in the text)
- "skillsMissing" (array of 5-8 relevant skills typically expected for a "${targetRole}" that were not detected or weak)
- "improvements" (array of objects, each with "section", "before", "after", "reason", showing exact bullet points or summaries rewritten to be impact-focused and quantitative)

CV Text:
${cleanText.substring(0, 8000)}`;

      const response = await callGeminiWithRetry(() =>
        ai!.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      section: { type: Type.STRING },
                      before: { type: Type.STRING },
                      after: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ['section', 'before', 'after', 'reason']
                  }
                }
              },
              required: ['score', 'strengths', 'weaknesses', 'skillsFound', 'skillsMissing', 'improvements']
            }
          }
        })
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('[CV-UPLOAD] Gemini analysis error:', err);
    }
  }

  return res.status(503).json({ error: 'Our CV analysis service is temporarily busy. Please try again in a few moments.' });
});


// ==========================================
// API ROUTES: Authenticated Live User Storage & Verification
// ==========================================

// Register a new user with verification code
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password, targetRole, targetIndustry, experienceLevel } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const encryptedPassword = hashPassword(password);
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { data: existingUser } = await supabase.from('users').select('email').eq('email', email.trim()).single();
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const { error: insertError } = await supabase.from('users').insert({
      email: email.trim(),
      name,
      password: encryptedPassword,
      target_role: targetRole,
      target_industry: targetIndustry,
      experience_level: experienceLevel,
      resume_score: 0,
      email_verified: false,
      verification_code: code,
      role: email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user'
    });

    if (insertError) {
      console.error('[AUTH] Register insert error:', insertError);
      return res.status(500).json({ error: `Registration failed: ${insertError.message}` });
    }

    try {
      await sendMail(
        email.trim(),
        'Your AURA AI Verification Code',
        `<p>Your verification code is: <strong>${code}</strong></p>`
      );
      console.log(`[AUTH] Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error('[AUTH] Email send error:', emailErr);
    }

    console.log(`[AUTH] Registered ${email} with encrypted password.`);

    res.json({
      success: true,
      email: email.trim(),
      verificationCode: code,
      message: 'Registration successful! Check your email for verification code.'
    });
  } catch (err) {
    console.error('[AUTH] Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Verify 6-digit code
app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }

  try {
    const { data: user } = await supabase.from('users').select('*').eq('email', email.trim()).single();
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.verification_code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    await supabase.from('users').update({ email_verified: true }).eq('email', email.trim());

    console.log(`[AUTH] Verified email for ${email}`);

    const tokenPayload = { email: user.email, role: user.role || 'user' };
    res.json({
      success: true,
      token: issueToken(tokenPayload),
      user: {
        name: user.name,
        email: user.email,
        targetRole: user.target_role,
        targetIndustry: user.target_industry,
        experienceLevel: user.experience_level,
        resumeScore: user.resume_score,
        emailVerified: true,
        role: user.role || 'user',
        isAdmin: user.role === 'admin'
      }
    });
  } catch (err) {
    console.error('[AUTH] Verify error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// Login user
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.trim();
    if (normalizedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      await ensureAdminUserSeeded();
    }

    const { data: user, error: fetchError } = await supabase.from('users').select('*').eq('email', normalizedEmail).single();
    if (fetchError || !user) {
      console.error('[AUTH] Verify fetch error:', fetchError);
      return res.status(404).json({ error: 'Account not found. If you just registered, the database may still be initializing or the registration insert failed.' });
    }

    const encryptedPasswordInput = hashPassword(password);
    const isHashMatch = user.password === encryptedPasswordInput;
    const isPlaintextMatch = user.password === password && user.password.length !== 64;

    if (!isHashMatch && !isPlaintextMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (isPlaintextMatch) {
      await supabase.from('users').update({ password: encryptedPasswordInput }).eq('email', normalizedEmail);
    }

    const tokenPayload = { email: user.email, role: user.role || 'user' };
    res.json({
      success: true,
      token: issueToken(tokenPayload),
      emailVerified: user.email_verified,
      user: {
        name: user.name,
        email: user.email,
        targetRole: user.target_role,
        targetIndustry: user.target_industry,
        experienceLevel: user.experience_level,
        resumeScore: user.resume_score,
        emailVerified: user.email_verified,
        role: user.role || 'user',
        isAdmin: user.role === 'admin'
      }
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Resend verification code
app.post('/api/auth/resend-code', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data: existingUser } = await supabase.from('users').select('email').eq('email', email.trim()).single();
    if (!existingUser) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    await supabase.from('users').update({ verification_code: code }).eq('email', email.trim());

    try {
      await sendMail(
        email.trim(),
        'Your New AURA AI Verification Code',
        `<p>Your new verification code is: <strong>${code}</strong></p>`
      );
      console.log(`[AUTH] Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error('[AUTH] Email send error:', emailErr);
    }

    console.log(`[AUTH] Resent code to ${email}.`);

    res.json({
      success: true,
      verificationCode: code,
      message: 'Verification code resent successfully!'
    });
  } catch (err) {
    console.error('[AUTH] Resend code error:', err);
    res.status(500).json({ error: 'Failed to resend code.' });
  }
});

// Forgot password - send reset code
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const { data: existingUser } = await supabase.from('users').select('email').eq('email', email.trim()).single();
    if (!existingUser) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from('users').update({ verification_code: resetCode }).eq('email', email.trim());

    try {
      await sendMail(
        email.trim(),
        'Your AURA AI Password Reset Code',
        `<p>Your password reset code is: <strong>${resetCode}</strong></p>`
      );
      console.log(`[AUTH] Password reset code sent to ${email}`);
    } catch (emailErr) {
      console.error('[AUTH] Password reset email error:', emailErr);
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email.'
    });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset.' });
  }
});

// Reset password with code
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required.' });
  }

  try {
    const { data: user } = await supabase.from('users').select('*').eq('email', email.trim()).single();
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.verification_code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid reset code.' });
    }

    const encryptedPassword = hashPassword(newPassword);
    await supabase.from('users').update({ password: encryptedPassword }).eq('email', email.trim());

    console.log(`[AUTH] Password reset successful for ${email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

// Get all registered users (admin only)
app.get('/api/admin/users', authMiddleware, generalLimiter, async (req, res) => {
  const userEmail = (req as any).user?.email;
  const userRole = (req as any).user?.role;

  if (userRole !== 'admin' && userEmail?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Access denied. You do not have administrator permissions.' });
  }

  try {
    const { data: users, error } = await supabase.from('users').select('name, email, target_role, target_industry, experience_level, resume_score, email_verified, role');
    if (error) throw error;

    const userList = (users || []).map((u: any) => ({
      name: u.name,
      email: u.email,
      targetRole: u.target_role,
      targetIndustry: u.target_industry,
      experienceLevel: u.experience_level,
      resumeScore: u.resume_score || 0,
      emailVerified: u.email_verified || false,
      role: u.role || 'user'
    }));

    res.json({ users: userList });
  } catch (err) {
    console.error('[ADMIN] Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Send newsletter to users (admin only)
app.post('/api/admin/send-newsletter', authMiddleware, generalLimiter, async (req, res) => {
  const adminEmail = (req as any).user?.email;
  const { subject, content, recipientEmails } = req.body;

  if (!adminEmail) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { data: adminUser } = await supabase.from('users').select('role').eq('email', adminEmail).single();
  if (!adminUser || adminUser.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. You do not have administrator privileges.' });
  }

  if (!subject || !content || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
    return res.status(400).json({ error: 'Subject, content, and at least one recipient are required.' });
  }

  const results = { success: [] as string[], failed: [] as { email: string; error: string }[] };

  for (const recipient of recipientEmails) {
    try {
      await sendMail(
        recipient.trim(),
        subject,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #065f46;">${subject.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2>
          <div style="white-space: pre-wrap; line-height: 1.6;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6b7280;">Sent via Aura Career</p>
        </div>`
      );
      results.success.push(recipient.trim());
    } catch (err: any) {
      results.failed.push({ email: recipient.trim(), error: err.message || 'Unknown error' });
    }
  }

  console.log(`[NEWSLETTER] Campaign "${subject}" dispatched by ${adminEmail}. Success: ${results.success.length}, Failed: ${results.failed.length}`);

  res.json({
    success: true,
    message: `Campaign "${subject}" dispatched.`,
    sent: results.success.length,
    failed: results.failed.length,
    failedEmails: results.failed,
    timestamp: new Date().toLocaleTimeString()
  });
});

// Load full live user data
app.get('/api/user/data', authMiddleware, generalLimiter, async (req, res) => {
  const userEmail = (req as any).user.email;

  try {
    const [usersRes, appsRes, resumesRes, roadmapsRes, chatsRes] = await Promise.all([
      supabase.from('users').select('name, email, target_role, target_industry, experience_level, resume_score, email_verified, role').eq('email', userEmail).single(),
      supabase.from('applications').select('data').eq('email', userEmail).single(),
      supabase.from('resumes').select('data').eq('email', userEmail).single(),
      supabase.from('roadmaps').select('data').eq('email', userEmail).single(),
      supabase.from('chats').select('data').eq('email', userEmail).single()
    ]);

    if (!usersRes.data) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      profile: {
        name: usersRes.data.name,
        email: usersRes.data.email,
        targetRole: usersRes.data.target_role,
        targetIndustry: usersRes.data.target_industry,
        experienceLevel: usersRes.data.experience_level,
        resumeScore: usersRes.data.resume_score,
        emailVerified: usersRes.data.email_verified,
        role: usersRes.data.role || 'user',
        isAdmin: usersRes.data.role === 'admin'
      },
      applications: appsRes.data?.data || [],
      resume: resumesRes.data?.data || null,
      roadmap: roadmapsRes.data?.data || [],
      chats: chatsRes.data?.data || {}
    });
  } catch (err) {
    console.error('[USER] Get data error:', err);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

// Save specific live user data section
app.post('/api/user/data/save', authMiddleware, generalLimiter, async (req, res) => {
  const userEmail = (req as any).user.email;
  const { type, data } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Data type is required.' });
  }

  try {
    if (type === 'profile') {
      await supabase.from('users').update({
        name: data.name,
        target_role: data.targetRole,
        target_industry: data.targetIndustry,
        experience_level: data.experienceLevel,
        resume_score: data.resumeScore
      }).eq('email', userEmail.trim());
    } else if (type === 'applications') {
      await supabase.from('applications').upsert({ email: userEmail.trim(), data });
    } else if (type === 'resume') {
      await supabase.from('resumes').upsert({ email: userEmail.trim(), data });
    } else if (type === 'roadmap') {
      await supabase.from('roadmaps').upsert({ email: userEmail.trim(), data });
    } else if (type === 'chats') {
      await supabase.from('chats').upsert({ email: userEmail.trim(), data });
    } else {
      return res.status(400).json({ error: 'Invalid data type.' });
    }

    res.json({ success: true, message: `${type} saved successfully.` });
  } catch (err) {
    console.error('[USER] Save data error:', err);
    res.status(500).json({ error: 'Failed to save data.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[EXPRESS] Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

// ==========================================
// EXPORT FOR VERCEL SERVERLESS
// ==========================================

export default app;

// ==========================================
// LOCAL DEVELOPMENT ENTRYPOINT
// ==========================================

if (!process.env.VERCEL) {
  (async () => {
    try {
      await startServer();
    } catch (err) {
      console.error('[SERVER] Failed to start local server:', err);
      process.exit(1);
    }
  })();
}

async function startServer() {
  await seedAdminUser();

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted for local development.');
    } catch (err) {
      console.error('[SERVER] Vite initialization failed, falling back to static files:', err);
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('Serving compiled static assets in production mode.');
    } else {
      console.warn('[SERVER] dist directory not found in production mode.');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express AURA AI server running at http://0.0.0.0:${PORT}`);
  });
}
