'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/shared/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    useAuthStore.persist.rehydrate();
    setTimeout(() => {
      if (!isAuthenticated()) router.replace('/login');
    }, 0);
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen font-inter" style={{ background: '#fcf9f4' }}>
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
