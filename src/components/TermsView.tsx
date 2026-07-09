interface StaticPageProps {
  theme?: 'light' | 'dark';
  onBack: () => void;
}

const sections = [
  {
    title: 'Acceptance of terms',
    body: `By creating an account or using Career Copilot in any way, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.\n\nThese terms apply to all users of Career Copilot, including visitors to the landing page, registered users, and any administrators.`,
  },
  {
    title: 'Description of service',
    body: `Career Copilot is an AI-powered career platform that provides CV analysis, resume building, interview coaching, career mentoring, learning roadmaps, and job application tracking. The platform is powered by Google Gemini AI and is intended to assist — not replace — your own professional judgement.\n\nWe reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.`,
  },
  {
    title: 'Account responsibilities',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You must not share your account with others or use another person's account without permission.\n\nYou agree to provide accurate information when creating your account and to keep it up to date. Accounts created with false information may be suspended without notice.\n\nYou must be at least 16 years old to use Career Copilot.`,
  },
  {
    title: 'Acceptable use',
    body: `You agree not to use Career Copilot to upload content that is illegal, harmful, defamatory, or infringes on the intellectual property rights of others. You agree not to attempt to reverse-engineer, scrape, or extract data from the platform in an automated manner.\n\nYou agree not to use the platform to generate content intended to deceive employers, misrepresent your qualifications, or engage in any form of fraud. Career Copilot is a tool to help you present your genuine skills and experience more effectively — not to fabricate them.`,
  },
  {
    title: 'AI-generated content',
    body: `Career Copilot uses AI to generate career advice, interview questions, resume suggestions, and other content. This content is provided for informational and educational purposes only. It does not constitute professional career counselling, legal advice, or a guarantee of employment outcomes.\n\nAI-generated content may occasionally be inaccurate, incomplete, or not suited to your specific circumstances. You are responsible for reviewing and verifying any AI-generated content before acting on it or submitting it to employers.`,
  },
  {
    title: 'Intellectual property',
    body: `The Career Copilot platform, including its design, code, and branding, is owned by Career Copilot and protected by copyright law. You may not reproduce, distribute, or create derivative works from any part of the platform without written permission.\n\nContent you create using Career Copilot — such as your resume, cover letters, and career notes — remains yours. By using the platform, you grant us a limited licence to process that content solely for the purpose of providing the service to you.`,
  },
  {
    title: 'Limitation of liability',
    body: `Career Copilot is provided "as is" without warranties of any kind. We do not guarantee that the platform will be error-free, uninterrupted, or that AI-generated advice will lead to specific career outcomes.\n\nTo the maximum extent permitted by law, Career Copilot shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to loss of employment opportunities or reliance on AI-generated content.`,
  },
  {
    title: 'Termination',
    body: `You may delete your account at any time from the Settings page. We may suspend or terminate your account if you violate these terms, with or without prior notice depending on the severity of the violation.\n\nUpon termination, your right to use the platform ceases immediately. Provisions of these terms that by their nature should survive termination will do so.`,
  },
  {
    title: 'Governing law',
    body: `These terms are governed by and construed in accordance with applicable law. Any disputes arising from these terms or your use of Career Copilot shall be resolved through good-faith negotiation first, and if unresolved, through binding arbitration.`,
  },
];

export default function TermsView({ theme = 'light', onBack }: StaticPageProps) {
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-white';
  const border = isLight ? 'border-neutral-200' : 'border-neutral-800';
  const muted = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const subtle = isLight ? 'bg-neutral-50' : 'bg-neutral-900';

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
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3">Legal</p>
          <h1 className={`font-display text-4xl sm:text-5xl font-bold mb-4 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Terms of Service</h1>
          <p className={`text-sm ${muted}`}>Last updated: January 2026 · Please read these terms carefully before using Career Copilot.</p>
        </div>

        <p className={`text-base leading-relaxed mb-12 max-w-2xl ${muted}`}>
          These Terms of Service govern your use of Career Copilot. We've kept them as clear and readable as possible. If you have questions, reach out to us at <span className="text-indigo-500">legal@careercopilot.app</span>.
        </p>

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

        <div className={`mt-12 p-6 rounded-xl border ${border} ${subtle}`}>
          <h3 className={`font-semibold mb-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Questions about these terms?</h3>
          <p className={`text-sm ${muted}`}>Email us at <span className="text-indigo-500 font-medium">legal@careercopilot.app</span> and we'll respond within 48 hours.</p>
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
