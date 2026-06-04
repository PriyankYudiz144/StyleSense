import Link from 'next/link';
import {
  Sparkles,
  Camera,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  CheckCircle,
  Scissors,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="warm-bg min-h-screen font-inter">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
        <nav className="glass-nav flex items-center justify-between gap-8 px-6 py-3 w-full max-w-5xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Scissors size={16} className="text-white" />
            </div>
            <span className="font-bold text-on-surface text-[17px]">StyleSense</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-on-surface/70">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2.5 min-h-0">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(255,219,200,0.6) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 60%, rgba(196,237,167,0.2) 0%, transparent 50%),
            #fcf9f4
          `,
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-32 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,219,200,0.8), transparent)' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(158,240,240,0.6), transparent)' }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="chip mb-6 text-primary border-primary/20 bg-primary/8">
            <Sparkles size={14} />
            AI-Powered Hairstyle Preview
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-6">
            See the haircut
            <br />
            <span style={{ color: '#8b4b1e' }}>before the cut</span>
          </h1>

          <p className="text-lg text-on-surface/60 max-w-xl mb-10 leading-relaxed">
            StyleSense lets your clients preview any hairstyle on their own photo using AI — before a single snip. Boost confidence, reduce cancellations, and grow your salon.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/register" className="btn-primary text-base px-8 py-4 min-h-0">
              Start free trial
              <ArrowRight size={18} />
            </Link>
            <Link href="/pricing" className="btn-secondary text-base px-8 py-4 min-h-0">
              View pricing
            </Link>
          </div>

          {/* Hero glass card */}
          <div className="glass-panel w-full max-w-2xl p-1.5 shadow-glass-xl">
            <div className="rounded-[20px] overflow-hidden bg-surface-container aspect-[16/7] flex items-center justify-center relative">
              <div className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(135deg, rgba(139,75,30,0.08) 0%, rgba(68,100,53,0.05) 100%)
                  `,
                }} />
              {/* Mock before/after UI */}
              <div className="relative z-10 flex gap-4 p-4 w-full justify-center">
                {[
                  { label: 'Before', icon: '👤', desc: 'Original photo' },
                  { label: 'AI Preview', icon: '✨', desc: 'Bob cut style' },
                  { label: 'After', icon: '💇', desc: 'Client chose this' },
                ].map((item) => (
                  <div key={item.label} className="liquid-card flex-1 p-4 flex flex-col items-center gap-2 text-center">
                    <div className="text-3xl">{item.icon}</div>
                    <div className="text-xs font-semibold text-on-surface">{item.label}</div>
                    <div className="text-xs text-on-surface/50">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 mt-8 text-sm text-on-surface/50">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#8b4b1e" className="text-primary" />
                ))}
              </div>
              <span>4.9/5 from 200+ salons</span>
            </div>
            <div className="w-px h-4 bg-outline-variant" />
            <span>No credit card required</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Everything your salon needs
            </h2>
            <p className="text-on-surface/55 text-lg max-w-xl mx-auto">
              From AI previews to client management — StyleSense handles it all.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Camera size={24} className="text-primary" />,
                title: 'Instant AI Preview',
                desc: 'Upload a photo and get realistic hairstyle previews in seconds using DALL-E 3.',
                color: 'rgba(255,219,200,0.5)',
              },
              {
                icon: <Users size={24} className="text-secondary" />,
                title: 'Client Management',
                desc: 'Track consultation history, favourite styles, and client preferences in one place.',
                color: 'rgba(158,240,240,0.3)',
              },
              {
                icon: <TrendingUp size={24} className="text-tertiary" />,
                title: 'Salon Analytics',
                desc: 'See which styles convert best and grow revenue with data-driven insights.',
                color: 'rgba(196,237,167,0.4)',
              },
            ].map((f) => (
              <div key={f.title} className="glass-panel p-8 flex flex-col gap-4 hover:shadow-glass-lg transition-shadow">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-on-surface">{f.title}</h3>
                <p className="text-on-surface/55 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-surface-container/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">How it works</h2>
          <p className="text-on-surface/55 text-lg mb-16 max-w-xl mx-auto">
            Three simple steps to transform your consultation experience.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Capture', desc: 'Take or upload a client photo directly in the app.' },
              { step: '02', title: 'Generate', desc: 'AI creates realistic previews of any hairstyle in seconds.' },
              { step: '03', title: 'Choose', desc: 'Client picks their favourite — stylist gets to work.' },
            ].map((s, i) => (
              <div key={s.step} className="flex flex-col items-center gap-4 relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-px bg-outline-variant" />
                )}
                <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center shadow-glass">
                  <span className="text-2xl font-extrabold text-primary">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">{s.title}</h3>
                <p className="text-on-surface/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-panel p-12 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,219,200,0.5) 0%, rgba(252,249,244,0.4) 100%)' }}>
            <div className="flex justify-center mb-4">
              <CheckCircle size={40} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-on-surface mb-4">
              Ready to transform your salon?
            </h2>
            <p className="text-on-surface/55 text-lg mb-8 max-w-lg mx-auto">
              Join 200+ salons already using StyleSense. Start with 5 free AI credits — no credit card needed.
            </p>
            <Link href="/register" className="btn-primary text-base px-10 py-4 min-h-0 mx-auto">
              Start your free trial
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-outline-variant/40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-on-surface/45">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Scissors size={12} className="text-white" />
            </div>
            <span className="font-semibold text-on-surface/70">StyleSense</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>
          <span>© 2024 StyleSense. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
