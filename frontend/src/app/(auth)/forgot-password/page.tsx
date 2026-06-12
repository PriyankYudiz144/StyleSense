'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Scissors, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Invalid email'),
});
type Form = z.infer<typeof schema>;

const RESEND_COOLDOWN = 60;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSentEmail(data.email);
      setSent(true);
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { email: sentEmail });
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-inter"
      style={{
        backgroundImage: `url('/salon-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="glass-panel w-full max-w-md p-8 shadow-glass-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#8b4b1e' }}>
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface">StyleSense</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(139,75,30,0.12)' }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#8b4b1e" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-on-surface mb-2">Check your email</h1>
            <p className="text-sm mb-2" style={{ color: 'rgba(28,28,25,0.55)' }}>
              We&apos;ve sent a reset link to <span className="font-medium text-on-surface">{sentEmail}</span>. It expires in 1 hour.
            </p>

            {error && (
              <div className="rounded-2xl p-3 text-sm mb-4"
                style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', color: '#ba1a1a' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-sm font-medium transition-opacity mb-6"
              style={{
                color: cooldown > 0 ? 'rgba(28,28,25,0.35)' : '#8b4b1e',
                cursor: cooldown > 0 ? 'default' : 'pointer',
              }}
            >
              {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
            </button>

            <div style={{ borderTop: '1px solid rgba(217,194,182,0.4)', paddingTop: '1.5rem' }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#8b4b1e' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-on-surface mb-1">Forgot password?</h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Email address"
                  className="glass-input"
                  style={errors.email ? { borderColor: '#ba1a1a' } : undefined}
                />
                {errors.email && (
                  <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.email.message}</p>
                )}
              </div>

              {error && (
                <div
                  className="rounded-2xl p-3 text-sm"
                  style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', color: '#ba1a1a' }}
                >
                  {error}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                {isSubmitting ? (
                  <div
                    className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <div
              className="mt-6 pt-6 text-center text-sm"
              style={{ borderTop: '1px solid rgba(217,194,182,0.4)', color: 'rgba(28,28,25,0.5)' }}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#8b4b1e' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
