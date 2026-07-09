import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Key, Mail, User, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { useToast } from './Toast';

interface LoginViewProps {
  onLogin: (profile: UserProfile, token?: string) => void;
  isModal?: boolean;
  onForgotPassword?: () => void;
}

export default function LoginView({ onLogin, isModal = false, onForgotPassword }: LoginViewProps) {
  const toast = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Executive'>('Mid');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputClass = "w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-500 mb-1.5";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isRegister) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, targetRole, targetIndustry, experienceLevel }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create account.');
        setVerificationEmail(email);
        setIsVerifying(true);
        toast.showToast('Account created! Verification email sent.', 'success');
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid credentials.');
        if (!data.emailVerified) {
          await fetch('/api/auth/resend-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
          setVerificationEmail(email);
          setIsVerifying(true);
          setError('Your email is not verified yet. We sent a verification code.');
        } else {
          onLogin(data.user, data.token);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
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
        body: JSON.stringify({ email: verificationEmail, code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid verification code.');
      setSuccess('Email verified! Signing you in...');
      setTimeout(() => onLogin(data.user, data.token), 1000);
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
        body: JSON.stringify({ email: verificationEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend code.');
      setSuccess('A new verification code has been sent.');
      toast.showToast('Verification code resent.', 'success');
    } catch (err: any) {
      setError(err.message || 'Error resending code.');
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 relative z-10"
    >
      {/* Logo + heading */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{width:'100%',height:'100%'}}>
              <defs><linearGradient id="lbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
              <rect width="64" height="64" rx="14" fill="url(#lbg)"/>
              <rect x="12" y="26" width="40" height="26" rx="4" fill="white" opacity="0.95"/>
              <path d="M24 26v-4a8 8 0 0 1 16 0v4" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="32" cy="39" r="4" fill="url(#lbg)"/>
              <line x1="32" y1="33" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="47" x2="32" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="26" y1="39" x2="24" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="39" x2="38" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-sans font-semibold text-sm text-neutral-900">Career Copilot</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          {isVerifying ? 'Verify your email' : isRegister ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {isVerifying ? `Enter the 6-digit code sent to ${verificationEmail}` : isRegister ? 'Start your free career workspace today.' : 'Sign in to your workspace.'}
        </p>
      </div>

      {/* Alerts */}
      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isVerifying ? (
        <div className="space-y-5">
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className={labelClass}>6-digit code</label>
              <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required
                placeholder="123456" maxLength={6}
                className="w-full text-center tracking-[0.4em] text-lg py-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify code'}
            </button>
          </form>
          <div className="flex items-center justify-between text-sm">
            <button onClick={() => { setIsVerifying(false); setError(null); setSuccess(null); }}
              className="text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">← Back</button>
            <button onClick={handleResendCode} disabled={loading}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors disabled:opacity-50 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Resend code
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab toggle */}
          <div className="flex border-b border-neutral-200 mb-6">
            {[{ label: 'Sign in', val: false }, { label: 'Register', val: true }].map(({ label, val }) => (
              <button key={label} type="button" onClick={() => { setIsRegister(val); setError(null); setSuccess(null); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer -mb-px ${isRegister === val ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className={labelClass}>Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Alex Rivera"
                    className={`${inputClass} pl-10`} />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="alex@example.com"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Target role</label>
                    <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} required placeholder="Full Stack Engineer"
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Industry</label>
                    <input type="text" value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} required placeholder="Technology / SaaS"
                      className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Experience level</label>
                  <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as any)}
                    className={inputClass}>
                    <option value="Entry">Entry (0–2 years)</option>
                    <option value="Mid">Mid (2–5 years)</option>
                    <option value="Senior">Senior (5–10 years)</option>
                    <option value="Executive">Executive (10+ years)</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegister ? <><UserPlus className="w-4 h-4" /> Create account</> : <><LogIn className="w-4 h-4" /> Sign in</>}
            </button>

            {!isRegister && (
              <div className="text-center">
                <button type="button" onClick={onForgotPassword}
                  className="text-sm text-neutral-400 hover:text-indigo-600 transition-colors cursor-pointer">
                  Forgot password?
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </motion.div>
  );

  if (isModal) return card;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]" />
      {card}
    </div>
  );
}
