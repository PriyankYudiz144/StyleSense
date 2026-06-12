'use client';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Scissors } from 'lucide-react';
import { apiClient } from '@/lib/api';

const schema = z.object({
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});
type Form = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setError('');
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    try {
      await apiClient.post('/auth/reset-password', { token, new_password: data.new_password });
      router.push('/login?reset=success');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 font-inter"
        style={{
          backgroundImage: `url('/salon-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="glass-panel w-full max-w-md p-8 shadow-glass-lg text-center">
          <p className="text-on-surface mb-4">Invalid reset link.</p>
          <Link href="/forgot-password" className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#8b4b1e' }}>
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

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

        <h1 className="text-2xl font-bold text-on-surface mb-1">Set new password</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.55)' }}>
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <input
              {...register('new_password')}
              type={showPw ? 'text' : 'password'}
              placeholder="New password"
              className="glass-input"
              style={{
                paddingRight: '48px',
                ...(errors.new_password ? { borderColor: '#ba1a1a' } : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              style={{ color: 'rgba(28,28,25,0.4)' }}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {errors.new_password && (
              <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.new_password.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register('confirm_password')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm password"
              className="glass-input"
              style={{
                paddingRight: '48px',
                ...(errors.confirm_password ? { borderColor: '#ba1a1a' } : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              style={{ color: 'rgba(28,28,25,0.4)' }}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {errors.confirm_password && (
              <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.confirm_password.message}</p>
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
              'Reset password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
