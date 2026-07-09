import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquareCode, 
  Play, 
  Award, 
  HelpCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  User,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { InterviewSession, InterviewQuestion, UserProfile } from '../types';
import { fetchJson } from '../utils/apiClient';

interface InterviewCoachViewProps {
  user: UserProfile;
  theme?: 'light' | 'dark';
}

export default function InterviewCoachView({ user, theme = 'dark' }: InterviewCoachViewProps) {
  const isLight = theme === 'light';
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Setup inputs
  const [role, setRole] = useState(user.targetRole);
  const [type, setType] = useState<'Technical' | 'Behavioral' | 'General'>('Technical');
  const [difficulty, setDifficulty] = useState<'Entry' | 'Mid' | 'Senior'>('Mid');

  // Input states during active practice
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<{ score: number; feedback: string } | null>(null);

  const startInterviewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMsg('Connecting to Interview Coach and compiling questions...');

    try {
      const response = await fetch('/api/gemini/interview-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionState: { role, type, difficulty, questions: [], currentIndex: 0 }
        })
      });

      if (!response.ok) {
        throw new Error('Could not compile initial question set');
      }

      const qData = await response.json() as InterviewQuestion;
      if (!qData.question) throw new Error('Invalid question response from server.');

      const newSession: InterviewSession = {
        id: `session-${Date.now()}`,
        role,
        type,
        difficulty,
        questions: [qData],
        currentIndex: 0,
        completed: false
      };

      setSession(newSession);
    } catch (err) {
      console.error('Error compiling mock questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !session || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    const activeQ = session.questions[session.currentIndex];

    try {
      const data = await fetchJson<{ score: number; feedback: string }>('/api/gemini/interview-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionState: {
            role: session.role,
            type: session.type,
            difficulty: session.difficulty,
            questions: session.questions,
            currentIndex: session.currentIndex
          },
          lastAnswer: userAnswer
        })
      });
      setActiveFeedback(data);

      // Save answer details onto the current question
      const updatedQs = [...session.questions];
      updatedQs[session.currentIndex] = {
        ...activeQ,
        userAnswer: userAnswer,
        score: data.score,
        feedback: data.feedback
      };

      setSession(prev => prev ? {
        ...prev,
        questions: updatedQs
      } : null);

    } catch (err) {
      console.error('Failed to submit answer for review:', err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    setIsLoading(true);
    setLoadingMsg('Analyzing criteria & preparing your next question...');

    try {
      const response = await fetch('/api/gemini/interview-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionState: session
        })
      });

      if (!response.ok) {
        throw new Error('Failed loading next question');
      }

      const qData = await response.json() as InterviewQuestion;
      
      const updatedQs = [...session.questions, qData];
      const nextIdx = session.currentIndex + 1;

      setSession(prev => prev ? {
        ...prev,
        questions: updatedQs,
        currentIndex: nextIdx
      } : null);

      setUserAnswer('');
      setActiveFeedback(null);
    } catch (err) {
      console.error('Could not load next mock interview question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const finishSession = () => {
    if (!session) return;
    
    // Calculate simple average score
    const total = session.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const avgScore = Math.round(total / session.questions.length);

    setSession(prev => prev ? {
      ...prev,
      score: avgScore,
      currentIndex: -1 // Mark as finalized
    } : null);
  };

  const handleReset = () => {
    setSession(null);
    setUserAnswer('');
    setActiveFeedback(null);
  };

  const activeQuestion = session && session.currentIndex >= 0 ? session.questions[session.currentIndex] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase ${
          isLight ? 'text-neutral-900' : 'text-white'
        }`}>
          <MessageSquareCode className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
          <span>Interactive Interview Coach</span>
        </h1>
        <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Sharpen your delivery. Enter a custom role to sit face-to-face with an adaptive Interview Coach who grills you with customized tech questions and checks your response structures.
        </p>
      </div>

      {!session ? (
        /* SETUP PORTAL FORM */
        <form onSubmit={startInterviewSession} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`lg:col-span-8 border rounded-lg p-5 sm:p-6 space-y-5 transition-colors ${
            isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <h3 className={`font-display font-bold text-xs uppercase tracking-wider border-b pb-2 ${
              isLight ? 'border-neutral-100 text-neutral-800' : 'border-neutral-800 text-white'
            }`}>Interview Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400'
                }`}>Target Career Position</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    isLight 
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                      : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                  }`}
                  placeholder="e.g. Senior Architect"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>Practice Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                      isLight 
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                        : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                    }`}
                  >
                    <option value="Technical">Technical (Algorithms & Systems Architecture)</option>
                    <option value="Behavioral">Behavioral (Leadership & Team Scenarios)</option>
                    <option value="General">General Screening (Recruiter handshakes)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-display font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>Target Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'Entry' | 'Mid' | 'Senior')}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                      isLight 
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                        : 'border-neutral-850 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                    }`}
                  >
                    <option value="Entry">Entry Level screening</option>
                    <option value="Mid">Mid Level scaling standard</option>
                    <option value="Senior">Senior Leadership / Architect standard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`font-display font-black py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-1.5 text-xs cursor-pointer focus:outline-none focus:ring-2 ${
                  isLight 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' 
                    : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Commence Mock Interview</span>
              </button>
            </div>
          </div>

          <div className={`lg:col-span-4 border rounded-lg p-5 space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Award className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Coaching Strategy</span>
            </h3>
            <ul className={`space-y-3.5 text-xs leading-relaxed list-disc pl-4 font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              <li><strong>The STAR Framework:</strong> Answer behavioral questions by explaining the **Situation, Task, Action**, and **Result**.</li>
              <li><strong>Clarity & Metrics:</strong> Don't just say what you did; explain the outcome with numbers.</li>
              <li><strong>Honesty:</strong> If you don't know an architectural answer, trace your logical mental steps to show problem-solving.</li>
            </ul>
          </div>
        </form>
      ) : session.currentIndex >= 0 && activeQuestion ? (
        /* ACTIVE MOCK SESSION SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Question & Answer Input Box */}
          <div className={`lg:col-span-8 border rounded-lg p-5 sm:p-6 flex flex-col justify-between space-y-6 transition-colors ${
            isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <div className="space-y-4 flex-1">
              {/* Question metadata */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-green-950/40 border-green-900/20 text-green-400'
                }`}>
                  Question #{session.currentIndex + 1} of 3
                </span>
                <span className="text-xs text-neutral-400 font-mono font-bold">Category: {session.type}</span>
              </div>

              {/* Active question card */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-850'}`}>
                <h4 className={`text-sm font-display font-black uppercase tracking-wide flex items-center gap-1.5 ${
                  isLight ? 'text-neutral-900' : 'text-white'
                }`}>
                  <HelpCircle className="w-4 h-4 text-green-400" />
                  <span>Interactive Interview prompt</span>
                </h4>
                <p className={`text-xs sm:text-sm font-semibold leading-relaxed text-justify ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                  "{activeQuestion.question}"
                </p>
              </div>

              {/* Input section or static reviewed feedback */}
              {!activeFeedback ? (
                <div className="space-y-2">
                  <label className={`block text-[10px] font-display font-bold uppercase tracking-wider ${
                    isLight ? 'text-neutral-550' : 'text-neutral-400'
                  }`}>Your Answer Description</label>
                  <textarea
                    rows={8}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Whip up your answer using STAR methodology... Try to mention business metrics, scalability limits, or structural choices."
                    className={`w-full p-4 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                      isLight 
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:ring-indigo-500/10 focus:border-indigo-500' 
                        : 'border-neutral-800 bg-neutral-950 text-white focus:ring-green-400/50 focus:border-green-400'
                    }`}
                  />
                </div>
              ) : (
                /* INTERACTIVE CRITIQUE SCOREBOX */
                <div className={`p-5 rounded-xl border space-y-4 animate-fadeIn ${
                  isLight ? 'bg-indigo-50/40 border-indigo-100' : 'bg-neutral-950 border-neutral-850'
                }`}>
                  <div className="flex items-center justify-between">
                    <h5 className={`text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? 'text-neutral-900' : 'text-white'
                    }`}>
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span>Recruiter Critique</span>
                    </h5>
                    
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-green-400 bg-green-950/40 border border-green-900/30 px-2 py-0.5 rounded text-xs">
                      <span>Score: {activeFeedback.score}/100</span>
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed text-justify font-sans ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                    {activeFeedback.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom active controls */}
            <div className="flex items-center justify-between border-t border-neutral-850 pt-4 mt-2">
              <button
                type="button"
                onClick={handleReset}
                className={`font-display font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'border-neutral-200 hover:bg-neutral-50 text-neutral-600' 
                    : 'border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white'
                }`}
              >
                Reset Session
              </button>

              {!activeFeedback ? (
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim() || isSubmittingAnswer}
                  className={`font-display font-black uppercase tracking-widest text-[10px] py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                    userAnswer.trim() && !isSubmittingAnswer
                      ? isLight 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                      : isLight 
                      ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed' 
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingAnswer ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer for Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={session.currentIndex >= 2 ? finishSession : handleNextQuestion}
                  className={`font-display font-black uppercase tracking-widest text-[10px] py-2.5 px-5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                    isLight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                  }`}
                >
                  <span>{session.currentIndex >= 2 ? 'Finish Consultation & Review Score' : 'Next Recruiter Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Panelist sidebar info */}
          <div className={`lg:col-span-4 border rounded-lg p-5 sm:p-6 flex flex-col justify-between transition-colors ${
            isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <User className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Interview Coach Profile</h3>
              </div>

              <div className="text-center py-4 space-y-2">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-green-400 mx-auto flex items-center justify-center text-green-400 text-xl font-display font-black">
                  IC
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wide">Technical Recruiter Bot</h4>
                  <p className="text-[10px] text-neutral-500">Corporate Engineering Lead</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Session Objective</span>
                <p className={`leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-450'}`}>
                  Evaluating system scalability designs, container ingress topologies, responsive state flow components, and technical communication.
                </p>
              </div>
            </div>

            <div className={`text-[10px] border-t pt-4 text-neutral-500 text-center font-mono ${
              isLight ? 'border-neutral-100' : 'border-neutral-850'
            }`}>
              Mock Interview in progress...
            </div>
          </div>
        </div>
      ) : (
        /* SUMMARY REPORT FINALIZE CARD */
        <div className={`border rounded-lg p-6 sm:p-8 max-w-2xl mx-auto text-center space-y-6 transition-colors ${
          isLight ? 'bg-white border-neutral-200 text-neutral-950 shadow-sm' : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          <div className="w-14 h-14 rounded-full bg-green-950/40 border border-green-900/30 flex items-center justify-center text-green-400 mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest block">Consultation Completed</span>
            <h2 className="text-xl font-display font-black uppercase tracking-tight">Assessment Score report</h2>
            <p className="text-neutral-500 text-xs max-w-md mx-auto leading-relaxed">
              Congratulations! You have completed the simulated interview questions. Below is your final score based on your structural delivery andSTAR alignment.
            </p>
          </div>

          {/* Large final score board */}
          <div className="p-4 bg-neutral-950/20 border border-neutral-850 rounded-xl inline-block px-10">
            <div className="text-3xl font-display font-black text-green-400">{session.score}/100</div>
            <span className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mt-1">Average Evaluation Grade</span>
          </div>

          <div className={`border-t pt-5 flex gap-4 justify-center ${
            isLight ? 'border-neutral-100' : 'border-neutral-850'
          }`}>
            <button
              onClick={handleReset}
              className={`py-2.5 px-6 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isLight 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-green-400 hover:bg-green-500 text-neutral-950'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>
      )}

      {/* Full loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-lg p-6 sm:p-8 w-full max-w-sm text-center border border-neutral-850 space-y-4">
            <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto" />
            <div>
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Interactive Interview Coach</h3>
              <p className="text-neutral-400 text-xs mt-1 transition-all duration-300 min-h-[32px] flex items-center justify-center font-mono">
                {loadingMsg}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

