import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Loader2, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';

interface ForgotPasswordViewProps {
  onBack?: () => void;
  theme?: 'light' | 'dark';
}

export default function ForgotPasswordView({ onBack, theme = 'dark' }: ForgotPasswordViewProps) {
  const isLight = theme === 'light';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code.');
      }

      setSuccess('Reset code sent! Enter it below along with your new password.');
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error sending reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-80"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-neutral-900 rounded-lg border border-neutral-800 shadow-2xl p-6 sm:p-8 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-neutral-950 mb-4 shadow-lg shadow-green-500/20">
            <Mail className="w-6 h-6 relative z-10" />
          </div>
          <h1 className="text-xl font-display font-black text-white tracking-widest uppercase">AURA AI</h1>
          <p className="text-neutral-400 text-xs font-mono uppercase tracking-wider mt-1">Reset Password</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs font-sans flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-4 bg-green-950/20 border border-green-900/40 text-green-400 rounded-lg text-xs font-sans flex items-start gap-2"
          >
            <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-display font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-800 bg-neutral-950 text-white font-sans placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 hover:bg-green-500 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-display font-extrabold uppercase tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
          </button>
        </form>

        {onBack && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
