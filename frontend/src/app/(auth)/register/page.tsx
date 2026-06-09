'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scissors } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const schema = z.object({
  salon_name: z.string().min(2, 'Salon name required'),
  salon_email: z.string().email('Invalid email'),
  salon_phone: z.string().min(6, 'Phone required'),
  salon_address: z.string().min(5, 'Address required'),
  admin_name: z.string().min(2, 'Name required'),
  admin_email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      const { data: result } = await apiClient.post('/auth/register-salon', {
        salon: { name: data.salon_name, email: data.salon_email, phone: data.salon_phone, address: data.salon_address },
        admin: { full_name: data.admin_name, email: data.admin_email, password: data.password },
      });
      setAuth(result.user, result.access_token, result.refresh_token);
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Registration failed');
    }
  };

  const fieldErr = (msg?: string) =>
    msg ? <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{msg}</p> : null;

  const inputStyle = (hasError?: boolean): React.CSSProperties =>
    hasError ? { borderColor: '#ba1a1a' } : {};

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
      <div className="glass-panel w-full max-w-lg p-8 shadow-glass-lg my-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#8b4b1e' }}>
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface">StyleSense</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-1">Register your salon</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.55)' }}>
          Get started with AI-powered consultations
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'rgba(28,28,25,0.45)' }}>
            Salon info
          </p>
          <div>
            <input {...register('salon_name')} placeholder="Salon name" className="glass-input" style={inputStyle(!!errors.salon_name)} />
            {fieldErr(errors.salon_name?.message)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input {...register('salon_email')} type="email" placeholder="Salon email" className="glass-input" style={inputStyle(!!errors.salon_email)} />
              {fieldErr(errors.salon_email?.message)}
            </div>
            <div>
              <input {...register('salon_phone')} placeholder="Phone" className="glass-input" style={inputStyle(!!errors.salon_phone)} />
              {fieldErr(errors.salon_phone?.message)}
            </div>
          </div>
          <div>
            <input {...register('salon_address')} placeholder="Address" className="glass-input" style={inputStyle(!!errors.salon_address)} />
            {fieldErr(errors.salon_address?.message)}
          </div>

          <p className="text-xs uppercase tracking-wider font-semibold pt-2" style={{ color: 'rgba(28,28,25,0.45)' }}>
            Admin account
          </p>
          <div>
            <input {...register('admin_name')} placeholder="Your full name" className="glass-input" style={inputStyle(!!errors.admin_name)} />
            {fieldErr(errors.admin_name?.message)}
          </div>
          <div>
            <input {...register('admin_email')} type="email" placeholder="Your email" className="glass-input" style={inputStyle(!!errors.admin_email)} />
            {fieldErr(errors.admin_email?.message)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input {...register('password')} type="password" placeholder="Password" className="glass-input" style={inputStyle(!!errors.password)} />
              {fieldErr(errors.password?.message)}
            </div>
            <div>
              <input {...register('confirm_password')} type="password" placeholder="Confirm" className="glass-input" style={inputStyle(!!errors.confirm_password)} />
              {fieldErr(errors.confirm_password?.message)}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl p-3 text-sm"
              style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', color: '#ba1a1a' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center mt-2">
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : (
              'Create salon account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 text-center text-sm"
          style={{ borderTop: '1px solid rgba(217,194,182,0.4)', color: 'rgba(28,28,25,0.5)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: '#8b4b1e' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
