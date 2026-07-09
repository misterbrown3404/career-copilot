interface StaticPageProps {
  theme?: 'light' | 'dark';
  onBack: () => void;
}

const sections = [
  {
    title: 'Information we collect',
    body: `When you create an account, we collect your name, email address, target role, target industry, and experience level. When you use our CV analysis tools, we temporarily process the content of uploaded documents to generate AI feedback — we do not permanently store the raw text of your CV on our servers beyond the duration of your session.\n\nWe also collect standard usage data such as pages visited, features used, and session duration to improve the product. This data is anonymised and aggregated.`,
  },
  {
    title: 'How we use your information',
    body: `Your profile information is used to personalise AI-generated career advice, interview questions, and learning roadmaps to your specific goals and experience level.\n\nYour email address is used to send account verification codes, password reset links, and — only if you opt in — occasional product updates. We do not send marketing emails without your explicit consent.\n\nWe do not sell, rent, or share your personal data with third parties for advertising purposes.`,
  },
  {
    title: 'AI processing and third-party services',
    body: `Career Copilot uses Google Gemini AI to power its analysis and coaching features. When you submit a CV, ask a career question, or request interview practice, relevant content is sent to Google's API for processing. This is governed by Google's data processing terms. We recommend reviewing Google's privacy policy at policies.google.com.\n\nWe use Supabase for database and authentication services, and Vercel for hosting. Each of these providers maintains their own data processing agreements and security certifications.`,
  },
  {
    title: 'Data retention',
    body: `Your account data — profile, job applications, and resume details — is retained for as long as your account is active. You may delete your account at any time from the Settings page, which will permanently remove all associated data within 30 days.\n\nSession-only data such as chat history with the Career Mentor is not persisted between sessions unless you explicitly save it.`,
  },
  {
    title: 'Your rights',
    body: `You have the right to access, correct, or delete any personal data we hold about you. You can update your profile information directly in the Settings page. To request a full data export or account deletion, contact us at abdulsalamjibril5@gmail.com.\n\nIf you are located in the European Economic Area, you have additional rights under GDPR including the right to data portability and the right to lodge a complaint with your local supervisory authority.`,
  },
  {
    title: 'Cookies',
    body: `We use a single session cookie to maintain your authenticated state. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. No cookie consent banner is required because we only use strictly necessary cookies.`,
  },
  {
    title: 'Changes to this policy',
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page and, for material changes, notify you by email. Continued use of Career Copilot after changes are posted constitutes your acceptance of the updated policy.`,
  },
];

export default function PrivacyView({ theme = 'light', onBack }: StaticPageProps) {
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-white';
  const border = isLight ? 'border-neutral-200' : 'border-neutral-800';
  const muted = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const subtle = isLight ? 'bg-neutral-50' : 'bg-neutral-900';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Nav */}
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
        {/* Header */}
        <div className={`pb-10 mb-10 border-b ${border}`}>
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3">Legal</p>
          <h1 className={`font-display text-4xl sm:text-5xl font-bold mb-4 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Privacy Policy</h1>
          <p className={`text-sm ${muted}`}>Last updated: January 2026 · Effective immediately upon account creation</p>
        </div>

        {/* Intro */}
        <p className={`text-base leading-relaxed mb-12 max-w-2xl ${muted}`}>
          Career Copilot is built on the principle that your career data is yours. This policy explains what we collect, why we collect it, and how you can control it. We've written it in plain language — no legal jargon.
        </p>

        {/* Sections */}
        <div className="space-y-0">
          {sections.map((s, i) => (
            <div key={i} className={`grid grid-cols-1 md:grid-cols-12 gap-6 py-10 ${i < sections.length - 1 ? `border-b ${border}` : ''}`}>
              <div className="md:col-span-4">
                <h2 className={`font-display text-lg font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{s.title}</h2>
              </div>
              <div className="md:col-span-8">
                {s.body.split('\n\n').map((para, j) => (
                  <p key={j} className={`text-sm leading-relaxed ${muted} ${j > 0 ? 'mt-4' : ''}`}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact box */}
        <div className={`mt-12 p-6 rounded-xl border ${border} ${subtle}`}>
          <h3 className={`font-semibold mb-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Questions about your privacy?</h3>
          <p className={`text-sm ${muted}`}>Email us at <span className="text-indigo-500 font-medium">abdulsalamjibril5@gmail.com</span> and we'll respond within 48 hours.</p>
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
