'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Scissors, Users, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/sessions', icon: Calendar, label: 'Sessions' },
  { href: '/settings/salon', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    NAV_ITEMS.forEach(({ href }) => router.prefetch(href));
  }, [router]);

  return (
    <aside className="sidebar-glass fixed left-0 top-0 h-full w-64 flex flex-col z-40">
      <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid rgba(217,194,182,0.3)' }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#8b4b1e' }}>
          <Scissors size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-on-surface">StyleSense</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-150"
              style={
                active
                  ? { background: 'rgba(139,75,30,0.12)', color: '#8b4b1e' }
                  : { color: 'rgba(28,28,25,0.55)' }
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(217,194,182,0.3)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#8b4b1e' }}
          >
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{user?.full_name}</p>
            <p className="text-xs capitalize truncate" style={{ color: 'rgba(28,28,25,0.45)' }}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="p-1 transition-colors"
            style={{ color: 'rgba(28,28,25,0.4)' }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
