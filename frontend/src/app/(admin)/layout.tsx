'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    useAuthStore.persist.rehydrate();
    setTimeout(() => {
      if (!isAuthenticated()) {
        router.replace('/login');
      } else if (user?.role !== 'super_admin') {
        router.replace('/dashboard');
      }
    }, 0);
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated() || user?.role !== 'super_admin') return null;

  return (
    <div className="flex min-h-screen font-inter" style={{ background: '#fcf9f4' }}>
      <AdminSidebar />
      <div className="flex-1 ml-72 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
