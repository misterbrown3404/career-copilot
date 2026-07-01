import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Key, Mail, User, Briefcase, ShieldAlert, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLogin: (profile: UserProfile, token?: string) => void;
  isModal?: boolean;
}

export default function LoginView({ onLogin, isModal = false }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Executive'>('Mid');

  // Verification & loading state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isRegister) {
        // Sign up
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            targetRole,
            targetIndustry,
            experienceLevel
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create account.');
        }

        setVerificationEmail(email);
        setDebugCode(data.verificationCode || '');
        setIsVerifying(true);
        setSuccess('Account created! Please enter the 6-digit code to verify your email.');
      } else {
        // Sign in
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Invalid credentials.');
        }

        if (!data.emailVerified) {
          // Send verification code
          const resendResponse = await fetch('/api/auth/resend-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const resendData = await resendResponse.json();
          
          setVerificationEmail(email);
          setDebugCode(resendData.verificationCode || '');
          setIsVerifying(true);
          setError('Your email is not verified yet. We generated a verification code for you.');
        } else {
          // Successfully logged in
          onLogin(data.user, data.token);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setSuccess('Email successfully verified! Signing you in...');
      setTimeout(() => {
        onLogin(data.user, data.token);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code.');
      }

      setDebugCode(data.verificationCode || '');
      setSuccess('A new 6-digit verification code has been generated.');
    } catch (err: any) {
      setError(err.message || 'Error resending code.');
    } finally {
      setLoading(false);
    }
  };

  const formCard = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-lg bg-neutral-900 rounded-lg border border-neutral-800 shadow-2xl p-5 sm:p-10 relative z-10 max-h-[85vh] lg:max-h-none overflow-y-auto scrollbar-none"
    >
      {/* App Logo & Header with Futuristic Theme */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-neutral-950 mb-4 shadow-lg shadow-green-500/20 overflow-hidden group">
          <div className="absolute inset-0 border border-white/20 rounded-xl animate-[spin_8s_linear_infinite]" />
          <Sparkles className="w-6 h-6 text-neutral-950 relative z-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-green-300">Aura Copilot</h1>
        <p className="text-neutral-400 text-xs font-mono uppercase tracking-wider mt-1.5">Futuristic AI Job Search & Predictive Career Sandbox</p>
      </div>

      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-3 mb-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs font-sans flex items-start gap-2 shadow-lg shadow-red-950/30"
          >
            <ShieldAlert className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5 animate-bounce" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-3 mb-4 bg-green-950/20 border border-green-900/40 text-green-400 rounded-lg text-xs font-sans flex items-start gap-2 shadow-lg shadow-green-950/30"
          >
            <Sparkles className="w-4.5 h-4.5 text-green-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isVerifying ? (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Email Verification</h3>
            <p className="text-neutral-400 text-xs mt-1">
              Please enter the 6-digit code sent to <strong className="text-neutral-200">{verificationEmail}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                6-Digit Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                placeholder="123456"
                maxLength={6}
                className="w-full text-center tracking-[0.5em] text-lg py-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-white font-mono focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
              />
            </div>

            {debugCode && (
              <div className="p-3.5 bg-green-950/20 border border-dashed border-green-800/40 text-green-400 rounded-lg text-xs text-center space-y-1 font-mono">
                <div className="text-[10px] uppercase font-bold text-green-500">Sandbox Test Mail Inbox</div>
                <div className="text-base font-extrabold tracking-widest">{debugCode}</div>
                <div className="text-[9px] text-neutral-400">Copy the verification code above to satisfy email validation.</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 hover:bg-green-500 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-display font-extrabold uppercase tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => {
                setIsVerifying(false);
                setError(null);
                setSuccess(null);
              }}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-green-400 hover:text-green-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Form Toggle */}
          <div className="flex border-b border-neutral-800 mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-3 text-xs font-display font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                !isRegister
                  ? 'border-green-400 text-green-400 font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-3 text-xs font-display font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                isRegister
                  ? 'border-green-400 text-green-400 font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
                    placeholder="Alex Rivera"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
                  placeholder="alex.rivera@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans placeholder-neutral-650 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
                      placeholder="e.g. Full Stack Engineer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                      Target Industry
                    </label>
                    <input
                      type="text"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
                      placeholder="e.g. Technology / SaaS"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
                  >
                    <option value="Entry">Entry Level (0-2 years)</option>
                    <option value="Mid">Mid Level (2-5 years)</option>
                    <option value="Senior">Senior Level (5-10 years)</option>
                    <option value="Executive">Executive Level (10+ years)</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 hover:bg-green-500 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-display font-extrabold uppercase tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </>
      )}
    </motion.div>
  );

  if (isModal) {
    return formCard;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-80"></div>
      {formCard}
    </div>
  );
}
