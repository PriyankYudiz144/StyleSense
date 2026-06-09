'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Scissors } from 'lucide-react';

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
    features: [
      '500 AI credits',
      'Unlimited clients',
      'Advanced reporting',
      'Staff management (up to 5)',
      'Marketing tools',
    ],
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

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-active'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    setTimeout(() => document.querySelector('nav')?.classList.add('reveal-active'), 100);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .lp-glass {
          background-color: rgba(252,249,244,0.4);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-top: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.08);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .lp-glass:not(.plan-card-highlighted)::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.1) 50%, transparent 55%);
          transform: rotate(-45deg);
          animation: shimmer 8s infinite linear;
          pointer-events: none;
        }
        .plan-card-highlighted .shimmer-inner {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          overflow: hidden;
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
        .premium-transition { transition: all 0.6s cubic-bezier(0.22,1,0.36,1); }
        .btn-glow:hover { box-shadow: 0 0 20px rgba(139,75,30,0.4); transform: scale(1.02); }
        .plan-card:hover { transform: translateY(-6px); }
        .plan-card-highlighted { transform: scale(1.04); z-index: 10; overflow: visible !important; }
        .plan-card-highlighted:hover { transform: scale(1.04) translateY(-6px); }
      `}</style>

      {/* Fixed background — same as landing */}
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/salon-bg.jpg')` }}>
        <div className="absolute inset-0" style={{ background: 'rgba(252,249,244,0.25)', mixBlendMode: 'overlay' }} />
      </div>

      {/* Desktop Nav — identical to landing */}
      <nav className="reveal fixed top-4 left-0 right-0 z-50 hidden md:flex justify-between items-center px-8 py-3 premium-transition"
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
            <Link className="text-sm premium-transition px-3 py-2 block rounded-md"
              style={{ color: 'rgba(83,68,59,0.8)' }} href="/">Home</Link>
          </li>
          <li>
            <a className="text-sm font-bold border-b-2 pb-1 px-2 premium-transition"
              style={{ color: '#8b4b1e', borderColor: '#8b4b1e' }} href="#">Pricing</a>
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

      {/* Main */}
      <main className="relative z-10 pt-32 md:pt-44 pb-24 px-5 md:px-16 max-w-[1440px] mx-auto"
        style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto reveal">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(139,75,30,0.7)' }}>
            Simple Pricing
          </p>
          <h1 className="font-bold tracking-tight mb-5"
            style={{ fontSize: 'clamp(32px,5vw,48px)', lineHeight: '1.1', letterSpacing: '-0.02em', color: '#1c1c19' }}>
            Built for salons of every size
          </h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(83,68,59,0.8)' }}>
            Simple, transparent pricing to help you manage your bookings, clients, and growth with elegance.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex relative p-1 rounded-full"
            style={{ background: 'rgba(229,226,221,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div
              className="absolute top-1 bottom-1 rounded-full shadow-sm transition-all duration-300"
              style={{
                background: '#fcf9f4',
                width: 'calc(50% - 4px)',
                left: 4,
                transform: annual ? 'translateX(100%)' : 'translateX(0)',
              }}
            />
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

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center pt-6">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`reveal lp-glass flex flex-col p-8 ${plan.highlighted ? 'plan-card-highlighted' : 'plan-card'}`}
              style={{
                transitionDelay: `${i * 80}ms`,
                ...(plan.highlighted ? {
                  background: 'rgba(252,249,244,0.65)',
                  backdropFilter: 'blur(48px)',
                  WebkitBackdropFilter: 'blur(48px)',
                  boxShadow: '0 20px 60px rgba(139,75,30,0.18)',
                  borderTop: '1px solid rgba(255,255,255,0.5)',
                } : {}),
              }}
            >
              {/* Shimmer overlay clipped inside card bounds for highlighted card */}
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

              {/* Plan label */}
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 self-start"
                style={plan.highlighted
                  ? { background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' }
                  : { background: 'rgba(229,226,221,0.6)', color: '#53443b' }}>
                {plan.label}
              </span>

              {/* Price */}
              <div className="mb-2">
                {plan.priceDisplay ? (
                  <h2 className="font-bold" style={{ fontSize: '32px', color: '#1c1c19', letterSpacing: '-0.02em' }}>
                    {plan.priceDisplay}
                  </h2>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <h2 className="font-bold" style={{ fontSize: '32px', color: '#1c1c19', letterSpacing: '-0.02em' }}>
                      ${annual ? plan.annualPrice : plan.price}
                    </h2>
                    <span className="text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>/mo</span>
                  </div>
                )}
              </div>
              <p className="text-sm mb-8" style={{ color: 'rgba(83,68,59,0.7)' }}>{plan.description}</p>

              {/* Features */}
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

        {/* Footer note */}
        <p className="text-center text-sm mt-20 reveal" style={{ color: 'rgba(83,68,59,0.8)' }}>
          All plans include a 14-day money-back guarantee.{' '}
          <a href="mailto:hello@stylesense.ai" style={{ color: '#8b4b1e' }} className="hover:underline">
            Contact us
          </a>{' '}
          with any questions.
        </p>
      </main>

      {/* Footer — same as landing */}
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
