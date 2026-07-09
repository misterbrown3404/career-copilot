import { useState } from 'react';
import type { FormEvent } from 'react';

interface StaticPageProps {
  theme?: 'light' | 'dark';
  onBack: () => void;
}

const channels = [
  {
    label: 'General enquiries',
    email: 'abdulsalamjibril5@gmail.com',
    desc: 'Questions about the platform, features, or your account.',
  },
  {
    label: 'Privacy & data',
    email: 'abdulsalamjibril5@gmail.com',
    desc: 'Data access requests, deletion requests, or GDPR enquiries.',
  },
  {
    label: 'Legal',
    email: 'abdulsalamjibril5@gmail.com',
    desc: 'Terms of service questions or legal correspondence.',
  },
];

export default function ContactView({ theme = 'light', onBack }: StaticPageProps) {
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-white';
  const border = isLight ? 'border-neutral-200' : 'border-neutral-800';
  const muted = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const subtle = isLight ? 'bg-neutral-50' : 'bg-neutral-900';
  const inputClass = `w-full px-4 py-2.5 text-sm rounded-lg border ${border} ${isLight ? 'bg-white text-neutral-900 placeholder-neutral-400' : 'bg-neutral-900 text-white placeholder-neutral-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors`;
  const labelClass = `block text-xs font-medium mb-1.5 ${muted}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate send — replace with real endpoint if needed
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className={`sticky top-0 z-40 border-b ${border} ${isLight ? 'bg-white/95' : 'bg-neutral-950/95'} backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm ${muted} hover:${isLight ? 'text-neutral-900' : 'text-white'} transition-colors cursor-pointer`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <span className={`text-sm font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>Career Copilot</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className={`pb-10 mb-10 border-b ${border}`}>
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3">Get in touch</p>
          <h1 className={`font-display text-4xl sm:text-5xl font-bold mb-4 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Contact</h1>
          <p className={`text-sm ${muted}`}>We typically respond within one business day.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left — contact channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className={`font-display text-xl font-bold mb-6 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Contact channels</h2>
              <div className="space-y-0">
                {channels.map((c, i) => (
                  <div key={c.label} className={`py-5 ${i < channels.length - 1 ? `border-b ${border}` : ''}`}>
                    <p className={`text-xs font-mono uppercase tracking-widest ${muted} mb-1`}>{c.label}</p>
                    <a href={`mailto:${c.email}`} className="text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors block mb-1">{c.email}</a>
                    <p className={`text-xs ${muted}`}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${border} ${subtle}`}>
              <p className={`text-xs font-mono uppercase tracking-widest ${muted} mb-2`}>Response times</p>
              <div className="space-y-2">
                {[['General', '1 business day'], ['Privacy', '48 hours'], ['Legal', '2 business days']].map(([type, time]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className={`text-sm ${muted}`}>{type}</span>
                    <span className={`text-sm font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — contact form */}
          <div className="lg:col-span-7">
            <h2 className={`font-display text-xl font-bold mb-6 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Send a message</h2>

            {sent ? (
              <div className={`p-8 rounded-xl border ${border} ${subtle} text-center space-y-3`}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className={`font-semibold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Message sent</p>
                <p className={`text-sm ${muted}`}>Thanks for reaching out. We'll get back to you within one business day.</p>
                <button onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Your name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Alex Rivera" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="alex@example.com" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} required className={inputClass}>
                    <option value="">Select a topic</option>
                    <option value="general">General enquiry</option>
                    <option value="account">Account issue</option>
                    <option value="billing">Billing question</option>
                    <option value="privacy">Privacy or data request</option>
                    <option value="security">Security report</option>
                    <option value="feedback">Product feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6} placeholder="Tell us how we can help..."
                    className={`${inputClass} resize-none`} />
                </div>
                <button type="submit" disabled={sending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer">
                  {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className={`border-t ${border} ${subtle}`}>
        <div className={`max-w-4xl mx-auto px-6 sm:px-10 py-6 text-xs ${muted}`}>
          © 2026 Career Copilot. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
