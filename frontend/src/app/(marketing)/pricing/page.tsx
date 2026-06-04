'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Scissors, Home, Camera, User, Settings } from 'lucide-react';

const PLANS = [
  {
    id: 'trial',
    label: 'Trial',
    price: null,
    priceDisplay: 'Free',
    annualPrice: null,
    description: 'Perfect to experience the elegance.',
    features: ['Up to 50 clients', 'Basic scheduling'],
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
    features: ['Up to 200 clients', 'Online booking', 'SMS reminders'],
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
    features: ['Multiple locations', 'Custom API access', 'Dedicated success manager'],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: false,
    badge: null,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen font-inter overflow-x-hidden" style={{
      background: 'linear-gradient(135deg, #fcf9f4 0%, #ffdbc8 100%)',
      color: '#1c1c19',
    }}>

      {/* Desktop Nav */}
      <nav className="hidden md:flex fixed top-4 left-0 right-0 z-50 mx-auto max-w-5xl px-4">
        <div className="glass-nav flex items-center justify-between w-full px-8 py-3">
          <Link href="/" className="text-2xl font-bold" style={{ color: '#8b4b1e' }}>
            StyleSense
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-on-surface px-3 py-1 rounded-full" style={{ color: 'rgba(83,68,59,0.8)' }}>
              Landing
            </Link>
            <Link href="/pricing" className="text-sm font-bold px-3 py-1 rounded-full border-b-2" style={{ color: '#8b4b1e', borderColor: '#8b4b1e' }}>
              Pricing
            </Link>
          </div>
          <Link href="/login" className="text-sm font-semibold px-6 py-2 rounded-full border transition-colors hover:opacity-90" style={{ background: 'rgba(139,75,30,0.1)', color: '#8b4b1e', borderColor: 'rgba(139,75,30,0.2)' }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-20 rounded-t-2xl border-t" style={{ background: 'rgba(252,249,244,0.6)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.2)' }}>
        {[
          { icon: <Home size={22} />, label: 'Home', href: '/' },
          { icon: <Camera size={22} />, label: 'Scan', href: '#' },
          { icon: <User size={22} />, label: 'Clients', href: '#' },
          { icon: <Settings size={22} />, label: 'Settings', href: '#' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-transform active:scale-90" style={{ color: 'rgba(83,68,59,0.7)' }}>
            {item.icon}
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main */}
      <main className="pt-32 md:pt-48 pb-32 px-5 md:px-16 max-w-7xl mx-auto">

        {/* Header */}
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: '#1c1c19' }}>
            Built for salons of every size
          </h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(83,68,59,0.8)' }}>
            Simple, transparent pricing to help you manage your bookings, clients, and growth with elegance.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex relative p-1 rounded-full border" style={{ background: 'rgba(229,226,221,0.5)', borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
            {/* sliding bg */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-sm transition-transform duration-300"
              style={{
                background: '#fcf9f4',
                transform: annual ? 'translateX(100%)' : 'translateX(0)',
                left: 4,
              }}
            />
            <button
              onClick={() => setAnnual(false)}
              className="relative z-10 text-sm font-semibold px-8 py-3 rounded-full transition-colors"
              style={{ color: '#1c1c19' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="relative z-10 text-sm font-semibold px-8 py-3 rounded-full transition-colors"
              style={{ color: annual ? '#1c1c19' : 'rgba(83,68,59,0.7)' }}
            >
              Annually <span style={{ color: '#8b4b1e' }}>-20%</span>
            </button>
          </div>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-8 transition-transform duration-300 ${
                plan.highlighted ? 'scale-105 z-10' : 'hover:-translate-y-1'
              }`}
              style={plan.highlighted ? {
                background: 'rgba(252,249,244,0.6)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 16px 48px 0 rgba(139,75,30,0.15)',
              } : {
                background: 'rgba(252,249,244,0.4)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
              }}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap" style={{ background: '#8b4b1e' }}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={plan.highlighted ? { background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' } : { background: '#e5e2dd', color: '#53443b' }}>
                  {plan.label}
                </span>

                {/* Price */}
                {plan.priceDisplay ? (
                  <h2 className="text-2xl font-bold mb-2">{plan.priceDisplay}</h2>
                ) : (
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold">${annual ? plan.annualPrice : plan.price}</span>
                    <span className="text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>/mo</span>
                  </div>
                )}
                <p className="text-sm" style={{ color: 'rgba(83,68,59,0.7)' }}>{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: plan.highlighted ? '#8b4b1e' : '#8b4b1e' }}
                      strokeWidth={plan.highlighted ? 2.5 : 2}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className="block w-full py-3 px-6 rounded-full text-sm font-semibold text-center transition-all"
                style={plan.highlighted ? {
                  background: '#8b4b1e',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(139,75,30,0.3)',
                } : {
                  background: 'rgba(229,226,221,0.5)',
                  color: '#1c1c19',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm mt-14" style={{ color: 'rgba(83,68,59,0.5)' }}>
          All plans include a 14-day money-back guarantee.{' '}
          <a href="mailto:hello@stylesense.ai" style={{ color: '#8b4b1e' }} className="hover:underline">
            Contact us
          </a>{' '}
          with any questions.
        </p>
      </main>
    </div>
  );
}
