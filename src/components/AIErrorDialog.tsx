import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface AIErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
  theme?: 'light' | 'dark';
}

export default function AIErrorDialog({ open, message, onClose, onRetry, theme = 'dark' }: AIErrorDialogProps) {
  const isLight = theme === 'light';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-4 ${
              isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ai-error-title"
            aria-describedby="ai-error-desc"
          >
            <button
              onClick={onClose}
              className={`absolute right-4 top-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'
              }`}
              aria-label="Close error dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 id="ai-error-title" className="font-display font-black text-sm uppercase tracking-wide">
                  AI Request Failed
                </h3>
                <p id="ai-error-desc" className={`text-xs leading-relaxed font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {message}
                </p>
              </div>
            </div>

            <div className={`text-[10px] font-mono px-3 py-2 rounded-lg border ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}>
              This may be due to a model overload, invalid API key, or a temporary service outage. Please try again in a moment.
            </div>

            <div className="flex gap-2 pt-1">
              {onRetry && (
                <button
                  onClick={() => { onClose(); onRetry(); }}
                  className={`flex-1 py-2 px-4 rounded-lg font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
              <button
                onClick={onClose}
                className={`flex-1 py-2 px-4 rounded-lg border font-display font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                  isLight ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-50' : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
