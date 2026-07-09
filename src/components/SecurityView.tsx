interface StaticPageProps {
  theme?: 'light' | 'dark';
  onBack: () => void;
}

const practices = [
  {
    title: 'Encryption at rest and in transit',
    body: `All data stored in our database is encrypted at rest using AES-256 encryption. All data transmitted between your browser and our servers is encrypted in transit using TLS 1.3. This includes your profile data, job applications, resume details, and any content processed by our AI features.`,
  },
  {
    title: 'Authentication and session security',
    body: `Passwords are hashed using bcrypt with a high work factor before being stored — we never store plaintext passwords. Authentication tokens are signed JWTs with short expiry windows.\n\nEmail verification is required for all new accounts. Password reset flows use time-limited, single-use tokens sent to your verified email address.`,
  },
  {
    title: 'CV and document handling',
    body: `When you upload a CV for analysis, the document is processed in memory to extract text for AI analysis. Raw document files are not permanently stored on our servers. Extracted text is used only for the duration of your analysis session and is not retained in our database.\n\nWe do not use your CV content to train AI models.`,
  },
  {
    title: 'Infrastructure security',
    body: `Career Copilot is hosted on Vercel's edge infrastructure, which provides DDoS protection, automatic HTTPS, and global CDN distribution. Our database is hosted on Supabase, which is SOC 2 Type II certified and runs on AWS infrastructure.\n\nAll production secrets and API keys are stored as environment variables and are never committed to source code.`,
  },
  {
    title: 'Access controls',
    body: `Access to production systems is restricted to authorised personnel only, using multi-factor authentication. Database access follows the principle of least privilege — application code only has the permissions it needs to function.\n\nAdmin accounts within the platform have elevated permissions and are subject to additional verification requirements.`,
  },
  {
    title: 'Vulnerability management',
    body: `We keep all dependencies up to date and monitor for known vulnerabilities using automated tooling. Our CI/CD pipeline includes static analysis checks on every code change before deployment.\n\nIf you discover a security vulnerability in Career Copilot, please report it responsibly to security@careercopilot.app. We commit to acknowledging reports within 24 hours and resolving confirmed vulnerabilities promptly.`,
  },
];

const certifications = [
  { label: 'TLS 1.3', sub: 'All data in transit' },
  { label: 'AES-256', sub: 'All data at rest' },
  { label: 'bcrypt', sub: 'Password hashing' },
  { label: 'JWT', sub: 'Signed auth tokens' },
  { label: 'SOC 2', sub: 'Database provider' },
  { label: 'HTTPS', sub: 'Enforced everywhere' },
];

export default function SecurityView({ theme = 'light', onBack }: StaticPageProps) {
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
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3">Trust & Safety</p>
          <h1 className={`font-display text-4xl sm:text-5xl font-bold mb-4 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Security</h1>
          <p className={`text-sm ${muted}`}>How we protect your data and keep Career Copilot secure.</p>
        </div>

        <p className={`text-base leading-relaxed mb-12 max-w-2xl ${muted}`}>
          Your career data is sensitive. We take security seriously at every layer — from how we store your password to how we handle your CV. Here's exactly what we do.
        </p>

        {/* Security badges */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-px border ${border} mb-16`}>
          {certifications.map((c) => (
            <div key={c.label} className={`${subtle} p-5 border ${border}`}>
              <p className={`font-display text-lg font-bold mb-0.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>{c.label}</p>
              <p className={`text-xs ${muted}`}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Practices */}
        <div className="space-y-0">
          {practices.map((s, i) => (
            <div key={i} className={`grid grid-cols-1 md:grid-cols-12 gap-6 py-10 ${i < practices.length - 1 ? `border-b ${border}` : ''}`}>
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
          <h3 className={`font-semibold mb-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>Found a security issue?</h3>
          <p className={`text-sm ${muted}`}>Please report it responsibly to <span className="text-indigo-500 font-medium">security@careercopilot.app</span>. We take all reports seriously and will respond within 24 hours.</p>
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
