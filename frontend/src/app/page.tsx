'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Scissors, PlayCircle, Check } from 'lucide-react';

const FEATURES = [
  {
    icon: 'face_retouching_natural',
    title: 'Precision Mapping',
    desc: 'Our spatial analysis captures 1,000+ data points on your face to ensure the virtual style falls perfectly according to your unique bone structure and hair texture.',
  },
  {
    icon: 'palette',
    title: 'True-Tone Color',
    desc: 'Experiment with complex color treatments. Our engine simulates salon-grade dyes, glosses, and balayage techniques under realistic lighting conditions.',
  },
  {
    icon: 'auto_awesome',
    title: 'Curated Aesthetics',
    desc: 'Browse our exclusive library of styles curated by top-tier editorial stylists, updated seasonally to reflect the bleeding edge of high fashion and practical luxury.',
  },
];

const PLANS = [
  {
    id: 'trial',
    label: 'Trial',
    price: null,
    priceDisplay: 'Free',
    annualPrice: null,
    description: 'Perfect to experience the elegance.',
    features: ['50 AI credits', 'Up to 50 clients', 'Basic scheduling'],
    cta: 'Start Free Trial',
    ctaHref: '/register',
    highlighted: false,
    badge: null,
  },
  {
    id: 'starter',
    label: 'Starter',
    price: 29,
    annualPrice: 23,
    description: 'For independent stylists.',
    features: ['200 AI credits', 'Up to 200 clients', 'Online booking', 'SMS reminders'],
    cta: 'Get Started',
    ctaHref: '/register?plan=starter',
    highlighted: false,
    badge: null,
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 79,
    annualPrice: 63,
    description: 'Everything a growing salon needs.',
    features: ['500 AI credits', 'Unlimited clients', 'Advanced reporting', 'Staff management (up to 5)', 'Marketing tools'],
    cta: 'Upgrade to Pro',
    ctaHref: '/register?plan=pro',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: null,
    annualPrice: null,
    priceDisplay: 'Custom',
    description: 'For multi-location franchises.',
    features: ['3,000 AI credits', 'Multiple locations', 'Custom API access', 'Dedicated success manager'],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: false,
    badge: null,
  },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'pricing'>('home');

  useEffect(() => {
    // Particles
    const container = document.getElementById('particles-container');
    if (container) {
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        const size = `${Math.random() * 4 + 2}px`;
        Object.assign(p.style, {
          position: 'absolute',
          width: size,
          height: size,
          background: 'white',
          borderRadius: '50%',
          opacity: '0.15',
          filter: 'blur(1px)',
          left: `${Math.random() * 100}vw`,
          top: `${Math.random() * 100}vh`,
          animation: `particleFloat ${Math.random() * 10 + 15}s ${Math.random() * 20}s infinite linear`,
        });
        container.appendChild(p);
      }
    }

    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-active'); }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Nav reveal
    setTimeout(() => document.querySelectorAll('nav').forEach(n => n.classList.add('reveal-active')), 100);

    // Active section tracking
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id === 'pricing' ? 'pricing' : 'home');
          }
        });
      },
      { threshold: 0.3 }
    );
    const heroEl = document.getElementById('hero');
    const pricingEl = document.getElementById('pricing');
    if (heroEl) sectionObserver.observe(heroEl);
    if (pricingEl) sectionObserver.observe(pricingEl);

    return () => { observer.disconnect(); sectionObserver.disconnect(); };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        html { scroll-behavior: smooth; }
        .lp-glass {
          background-color: rgba(252,249,244,0.4);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-top: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.08);
          border-radius: 15px;
          position: relative;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .lp-glass:hover {
          transform: translateY(-8px);
          backdrop-filter: blur(48px);
          -webkit-backdrop-filter: blur(48px);
          box-shadow: 0 16px 48px 0 rgba(0,0,0,0.12);
        }
        .lp-glass::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.1) 50%, transparent 55%);
          transform: rotate(-45deg);
          animation: shimmer 8s infinite linear;
          pointer-events: none;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) rotate(-45deg); }
          100% { transform: translateX(100%)  rotate(-45deg); }
        }
        .lp-glass-dark {
          background-color: rgba(49,48,45,0.6);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal-active { opacity: 1; transform: translateY(0); }
        .btn-glow:hover { box-shadow: 0 0 20px rgba(139,75,30,0.4); transform: scale(1.02); }
        .premium-transition { transition: all 0.6s cubic-bezier(0.22,1,0.36,1); }
        .plan-card:hover { transform: translateY(-6px); }
        .plan-card-highlighted { transform: scale(1.04); z-index: 10; overflow: visible !important; }
        .plan-card-highlighted:hover { transform: scale(1.04) translateY(-6px); }
        @keyframes particleFloat {
          0%   { transform: translate(0,0); opacity: 0.15; }
          33%  { transform: translate(30px,-50px); }
          66%  { transform: translate(-20px,-100px); }
          100% { transform: translate(0,-150px); opacity: 0; }
        }
      `}</style>

      {/* Fixed background */}
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/salon-bg.jpg')` }}>
        <div className="absolute inset-0" style={{ background: 'rgba(252,249,244,0.25)', mixBlendMode: 'overlay' }} />
      </div>

      {/* Particles */}
      <div id="particles-container" className="fixed inset-0 pointer-events-none z-[-1]" />

      {/* Desktop Nav */}
      <nav className="reveal fixed top-4 left-0 right-0 z-50 hidden md:flex justify-between items-center px-8 py-3 mx-auto premium-transition"
        style={{
          maxWidth: '1440px',
          background: 'rgba(252,249,244,0.4)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '9999px',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 128px)',
        }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#8b4b1e' }}>
            <Scissors size={16} className="text-white" />
          </div>
          <span className="font-bold tracking-tight" style={{ fontSize: '20px', color: '#8b4b1e' }}>StyleSense</span>
        </div>
        <ul className="flex space-x-8 items-center">
          <li>
            <button onClick={() => scrollTo('hero')}
              className="text-sm px-3 py-2 premium-transition"
              style={activeSection === 'home'
                ? { color: '#8b4b1e', fontWeight: 700, borderBottom: '2px solid #8b4b1e', paddingBottom: '4px' }
                : { color: 'rgba(83,68,59,0.8)', fontWeight: 400 }}>
              Home
            </button>
          </li>
          <li>
            <button onClick={() => scrollTo('pricing')}
              className="text-sm px-3 py-2 premium-transition"
              style={activeSection === 'pricing'
                ? { color: '#8b4b1e', fontWeight: 700, borderBottom: '2px solid #8b4b1e', paddingBottom: '4px' }
                : { color: 'rgba(83,68,59,0.8)', fontWeight: 400 }}>
              Pricing
            </button>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm font-semibold px-6 py-2 rounded-full border premium-transition active:scale-95"
            style={{ color: '#8b4b1e', borderColor: 'rgba(139,75,30,0.2)' }}>
            Sign In
          </Link>
          <Link href="/register"
            className="text-sm font-semibold px-6 py-2 rounded-full premium-transition active:scale-95"
            style={{ background: '#8b4b1e', color: '#fff' }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-4 md:hidden"
        style={{ background: 'rgba(252,249,244,0.4)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#8b4b1e' }}>
            <Scissors size={14} className="text-white" />
          </div>
          <span className="font-bold" style={{ fontSize: '20px', color: '#8b4b1e' }}>StyleSense</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-semibold" style={{ color: '#8b4b1e' }}>Sign In</Link>
          <Link href="/register"
            className="text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{ background: '#8b4b1e', color: '#fff' }}>
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section id="hero" className="min-h-screen flex items-center pt-24 pb-12 px-5 md:px-16"
          style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div className="lp-glass reveal w-full md:w-3/5 p-8 md:p-12">
            <div className="relative z-10">
              <h1 className="font-bold text-on-surface mb-6 leading-tight"
                style={{ fontSize: 'clamp(32px,5vw,48px)', lineHeight: '1.15', letterSpacing: '-0.02em', color: '#1c1c19' }}>
                See the haircut<br />before the cut
              </h1>
              <p className="mb-10 max-w-xl" style={{ fontSize: '18px', lineHeight: '28px', color: 'rgba(83,68,59,0.8)' }}>
                Experience the future of styling. Our AI technology maps your facial structure to preview high-end editorial looks with zero commitment. Find your perfect aesthetic today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link href="/register"
                  className="btn-glow premium-transition inline-flex items-center justify-center text-white font-semibold px-8 py-4 rounded-full"
                  style={{ background: '#8b4b1e', minWidth: '160px', fontSize: '13px', letterSpacing: '0.02em' }}>
                  Start free trial
                </Link>
                <button onClick={() => scrollTo('pricing')}
                  className="premium-transition inline-flex items-center justify-center font-semibold px-8 py-4 rounded-full border"
                  style={{
                    background: 'rgba(252,249,244,0.3)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(134,115,105,0.4)',
                    color: '#8b4b1e',
                    minWidth: '160px',
                    fontSize: '13px',
                    letterSpacing: '0.02em',
                  }}>
                  <PlayCircle size={18} className="mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-5 md:px-16" style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="lp-glass reveal p-8" style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 border"
                  style={{ background: 'rgba(139,75,30,0.1)', borderColor: 'rgba(139,75,30,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#8b4b1e' }}>{f.icon}</span>
                </div>
                <h3 className="font-semibold mb-3" style={{ fontSize: '24px', lineHeight: '32px', letterSpacing: '-0.01em', color: '#1c1c19' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '16px', lineHeight: '24px', color: 'rgba(83,68,59,0.75)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-5 md:px-16" style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Pricing header */}
          <div className="text-center mb-16 max-w-3xl mx-auto reveal">
            <div className="relative px-10 py-8 mb-10">
              {/* Smooth radial blur — fades at edges, no hard box */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backdropFilter: 'blur(98px)',
                WebkitBackdropFilter: 'blur(98px)',
                background: 'rgba(252,249,244,0.28)',
                WebkitMaskImage: 'radial-gradient(ellipse 90% 100% at 50% 50%, black 30%, transparent 75%)',
                maskImage: 'radial-gradient(ellipse 90% 100% at 50% 50%, black 30%, transparent 75%)',
              }} />
              <p className="relative text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(139,75,30,0.7)' }}>
                Simple Pricing
              </p>
              <h2 className="relative font-bold tracking-tight mb-5"  
                style={{ fontSize: 'clamp(28px,4vw,42px)', lineHeight: '1.1', letterSpacing: '-0.02em', color: '#1c1c19' }}>
                Built for salons of every size
              </h2>
              <p className="relative text-lg leading-relaxed" style={{ color: 'rgba(83,68,59,0.85)' }}>
                Simple, transparent pricing to help you manage your bookings, clients, and growth with elegance.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="inline-flex relative p-1 rounded-full"
              style={{ background: 'rgba(229,226,221,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="absolute top-1 bottom-1 rounded-full shadow-sm transition-all duration-300"
                style={{
                  background: '#fcf9f4',
                  width: 'calc(50% - 4px)',
                  left: 4,
                  transform: annual ? 'translateX(100%)' : 'translateX(0)',
                }} />
              <button onClick={() => setAnnual(false)}
                className="relative z-10 text-sm font-semibold px-8 py-3 rounded-full transition-colors"
                style={{ color: '#1c1c19' }}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)}
                className="relative z-10 text-sm font-semibold px-8 py-3 rounded-full transition-colors"
                style={{ color: annual ? '#1c1c19' : 'rgba(83,68,59,0.7)' }}>
                Annually <span style={{ color: '#8b4b1e' }}>-20%</span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start pt-6">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`reveal lp-glass flex flex-col p-8 ${plan.highlighted ? 'plan-card-highlighted' : 'plan-card'}`}
                style={{
                  transitionDelay: `${i * 10}ms`,
                  ...(plan.highlighted ? {
                    background: 'rgba(252,249,244,0.65)',
                    backdropFilter: 'blur(48px)',
                    WebkitBackdropFilter: 'blur(48px)',
                    boxShadow: '0 20px 60px rgba(139,75,30,0.18)',
                    borderTop: '1px solid rgba(255,255,255,0.5)',
                  } : {}),
                }}
              >
                {plan.highlighted && (
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                    <div style={{
                      position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                      background: 'linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',
                      animation: 'shimmer 8s infinite linear',
                    }} />
                  </div>
                )}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap"
                    style={{ background: '#8b4b1e', zIndex: 20 }}>
                    {plan.badge}
                  </div>
                )}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 self-start"
                  style={plan.highlighted
                    ? { background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' }
                    : { background: 'rgba(229,226,221,0.6)', color: '#53443b' }}>
                  {plan.label}
                </span>
                <div className="mb-2">
                  {plan.priceDisplay ? (
                    <h3 className="font-bold" style={{ fontSize: '32px', color: '#1c1c19', letterSpacing: '-0.02em' }}>
                      {plan.priceDisplay}
                    </h3>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <h3 className="font-bold" style={{ fontSize: '32px', color: '#1c1c19', letterSpacing: '-0.02em' }}>
                        ${annual ? plan.annualPrice : plan.price}
                      </h3>
                      <span className="text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>/mo</span>
                    </div>
                  )}
                </div>
                <p className="text-sm mb-8" style={{ color: 'rgba(83,68,59,0.7)' }}>{plan.description}</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#1c1c19' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: plan.highlighted ? 'rgba(139,75,30,0.12)' : 'rgba(229,226,221,0.6)' }}>
                        <Check size={11} style={{ color: '#8b4b1e' }} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaHref}
                  className="block w-full py-3.5 px-6 rounded-full text-sm font-semibold text-center premium-transition btn-glow"
                  style={plan.highlighted ? {
                    background: '#8b4b1e',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(139,75,30,0.3)',
                  } : {
                    background: 'rgba(252,249,244,0.6)',
                    backdropFilter: 'blur(12px)',
                    color: '#1c1c19',
                    border: '1px solid rgba(217,194,182,0.5)',
                  }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-20 reveal" style={{ color: 'rgba(83,68,59,0.8)' }}>
            All plans include a 14-day money-back guarantee.{' '}
            <a href="mailto:hello@stylesense.ai" style={{ color: '#8b4b1e' }} className="hover:underline">
              Contact us
            </a>{' '}
            with any questions.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="lp-glass-dark relative z-20 w-full py-12 px-5 md:px-16 mt-12 premium-transition">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Scissors size={14} className="text-white" />
            </div>
            <span className="font-bold tracking-tight opacity-90" style={{ fontSize: '24px', color: '#f3f0eb' }}>StyleSense</span>
          </div>
          <div className="flex space-x-6 opacity-70">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="premium-transition hover:opacity-100"
                style={{ fontSize: '16px', lineHeight: '24px', color: '#f3f0eb' }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(243,240,235,0.5)' }}>
            © 2024 StyleSense Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
