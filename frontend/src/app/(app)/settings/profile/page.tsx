'use client';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { uploadPhoto } from '@/lib/upload';
import { useAuthStore } from '@/stores/auth.store';

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
});
type Form = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: user?.full_name ?? '' },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadPhoto(file, 'avatars');
      setAvatarPreview(url);
      const { data } = await apiClient.patch('/users/me', { avatar_url: url });
      if (user && accessToken && refreshToken) {
        setAuth({ ...user, ...data }, accessToken, refreshToken);
      }
    } catch {
      setError('Failed to upload photo. Try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (form: Form) => {
    setError('');
    setSaved(false);
    try {
      const { data } = await apiClient.patch('/users/me', { full_name: form.full_name });
      if (user && accessToken && refreshToken) {
        setAuth({ ...user, ...data }, accessToken, refreshToken);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save changes.');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-on-surface mb-1">Profile</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.5)' }}>
        Update your name and profile picture.
      </p>

      {/* Avatar */}
      <div className="glass-panel p-6 mb-6">
        <p className="text-sm font-semibold text-on-surface mb-4">Profile picture</p>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: '3px solid rgba(139,75,30,0.2)' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: '#8b4b1e' }}
              >
                {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: '#8b4b1e', border: '2px solid #fcf9f4' }}
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-white" />
              }
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-primary text-sm px-4 py-2"
            >
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            <p className="text-xs mt-2" style={{ color: 'rgba(28,28,25,0.4)' }}>
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="glass-panel p-6">
        <p className="text-sm font-semibold text-on-surface mb-4">Personal info</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Full name
            </label>
            <input
              {...register('full_name')}
              className="glass-input"
              style={errors.full_name ? { borderColor: '#ba1a1a' } : undefined}
            />
            {errors.full_name && (
              <p className="text-xs mt-1" style={{ color: '#ba1a1a' }}>{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Email
            </label>
            <input
              value={user?.email ?? ''}
              disabled
              className="glass-input"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>

          {error && (
            <div className="rounded-2xl p-3 text-sm"
              style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', color: '#ba1a1a' }}>
              {error}
            </div>
          )}

          {saved && (
            <div className="rounded-2xl p-3 text-sm"
              style={{ background: 'rgba(34,139,34,0.08)', border: '1px solid rgba(34,139,34,0.2)', color: '#1a7a1a' }}>
              Changes saved.
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
