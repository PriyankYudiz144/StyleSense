'use client';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Scissors } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type Form = z.infer<typeof schema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const resetSuccess = searchParams.get('reset') === 'success';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      const { data: res } = await apiClient.post('/auth/login', data);
      setAuth(res.user, res.access_token, res.refresh_token);
      router.push(res.user.role === 'super_admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Invalid email or password');
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
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: '#8b4b1e' }}
          >
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface">StyleSense</span>
        </div>

        <h1 className="text-2xl font-bold text-on-surface mb-1">Welcome back</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.55)' }}>
          Sign in to your salon account
        </p>

        {resetSuccess && (
          <div
            className="rounded-2xl p-3 text-sm mb-6"
            style={{ background: 'rgba(34,139,34,0.08)', border: '1px solid rgba(34,139,34,0.2)', color: '#1a7a1a' }}
          >
            Password reset successfully. Sign in with your new password.
          </div>
        )}

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
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              className="glass-input"
              style={{
                paddingRight: '48px',
                ...(errors.password ? { borderColor: '#ba1a1a' } : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(28,28,25,0.4)' }}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.password.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: '#8b4b1e' }}
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <div
              className="rounded-2xl p-3 text-sm"
              style={{
                background: 'rgba(186,26,26,0.08)',
                border: '1px solid rgba(186,26,26,0.2)',
                color: '#ba1a1a',
              }}
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
              'Sign in'
            )}
          </button>
        </form>

        <div
          className="mt-6 pt-6 text-center text-sm"
          style={{ borderTop: '1px solid rgba(217,194,182,0.4)', color: 'rgba(28,28,25,0.5)' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold hover:opacity-70 transition-opacity"
            style={{ color: '#8b4b1e' }}
          >
            Register your salon
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
