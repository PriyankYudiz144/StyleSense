'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, BarChart2, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/salons', icon: Store, label: 'Salons' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-72 flex flex-col z-50"
      style={{
        background: 'rgba(252,249,244,0.8)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '8px 0 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <h1
          className="font-bold tracking-tighter"
          style={{ fontSize: '28px', lineHeight: '32px', color: '#8b4b1e', letterSpacing: '-0.02em' }}
        >
          StyleSense
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: 'rgba(83,68,59,0.6)' }}>
          Root Administrator
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95"
              style={
                active
                  ? { background: 'rgba(139,75,30,0.1)', color: '#8b4b1e', fontWeight: 700 }
                  : { color: 'rgba(83,68,59,0.7)', fontWeight: 500 }
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2 pt-2" style={{ borderTop: '1px solid rgba(217,194,182,0.4)' }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#8b4b1e' }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface">Admin Profile</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(83,68,59,0.5)' }}>Primary Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
