'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Scissors, ArrowLeft, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen font-inter"
      style={{ background: '#fcf9f4' }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(217,194,182,0.3)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: '#8b4b1e' }}>
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-on-surface">StyleSense</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#8b4b1e' }}>
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-on-surface mb-4">Talk to Sales</h1>
          <p className="text-lg" style={{ color: 'rgba(28,28,25,0.55)' }}>
            Let&apos;s find the right plan for your salon or chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-lg font-bold text-on-surface mb-6">Get in touch</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'sales@stylesense.ai' },
                  { icon: Phone, label: 'Phone', value: '+1 (555) 000-0000' },
                  { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,75,30,0.1)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#8b4b1e' }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(28,28,25,0.45)' }}>{label}</p>
                      <p className="text-sm font-semibold text-on-surface">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-on-surface mb-4">What&apos;s included in Enterprise</h2>
              <ul className="space-y-3">
                {[
                  'Unlimited AI consultations',
                  'Multi-location management',
                  'Custom branding & white-label',
                  'Dedicated account manager',
                  'SLA & priority support',
                  'Custom integrations & API access',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(28,28,25,0.7)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#8b4b1e' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="glass-panel p-6">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(139,75,30,0.12)' }}>
                  <CheckCircle className="w-8 h-8" style={{ color: '#8b4b1e' }} />
                </div>
                <h2 className="text-xl font-bold text-on-surface mb-2">Message sent!</h2>
                <p className="text-sm" style={{ color: 'rgba(28,28,25,0.55)' }}>
                  Our sales team will reach out within 1 business day.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-on-surface mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>Full name</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Smith" className="glass-input" />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>Work email</label>
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@salon.com" className="glass-input" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>Company / Salon name</label>
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Luxe Hair Studio" className="glass-input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>Message</label>
                    <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your salon and what you're looking for..."
                      rows={5} className="glass-input resize-none" style={{ height: 'auto' }} />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center">
                    Send message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
