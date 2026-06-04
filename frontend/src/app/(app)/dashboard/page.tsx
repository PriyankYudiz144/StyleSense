'use client';

import {
  Users,
  Scissors,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Plus,
  Bell,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboardStats, useRecentSessions, usePopularStyles } from '@/lib/queries/dashboard';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats } = useDashboardStats();
  const { data: recentSessions } = useRecentSessions();
  const { data: popularStyles } = usePopularStyles();

  return (
    <div className="min-h-screen">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(252,249,244,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(217,194,182,0.3)',
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-on-surface">Dashboard</h1>
            <p className="text-sm" style={{ color: 'rgba(28,28,25,0.45)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              style={{
                background: 'rgba(252,249,244,0.7)',
                border: '1px solid rgba(217,194,182,0.5)',
                borderRadius: '100px',
                padding: '10px 16px',
              }}
            >
              <Search size={15} style={{ color: 'rgba(28,28,25,0.4)' }} />
              <span className="text-sm hidden md:block" style={{ color: 'rgba(28,28,25,0.4)' }}>
                Search clients…
              </span>
            </div>
            <button
              className="relative w-10 h-10 flex items-center justify-center liquid-card"
              style={{ borderRadius: '12px' }}
            >
              <Bell size={18} style={{ color: 'rgba(28,28,25,0.6)' }} />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: '#8b4b1e' }}
              />
            </button>
            <Link href="/consultation/new" className="btn-primary text-sm px-5 py-2.5 min-h-0">
              <Plus size={16} />
              New consultation
            </Link>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Total consultations', value: stats?.total_sessions ?? '—', icon: <Scissors size={18} style={{ color: '#8b4b1e' }} />, bg: 'rgba(255,219,200,0.4)' },
              { label: 'Total clients', value: stats?.total_customers ?? '—', icon: <Users size={18} style={{ color: '#2c6767' }} />, bg: 'rgba(158,240,240,0.3)' },
              { label: 'AI credits left', value: stats?.ai_credits_remaining ?? '—', icon: <Star size={18} style={{ color: '#446435' }} />, bg: 'rgba(196,237,167,0.3)' },
              { label: 'Completed sessions', value: stats?.completed_sessions ?? '—', icon: <TrendingUp size={18} style={{ color: '#8b4b1e' }} />, bg: 'rgba(255,219,200,0.4)' },
            ].map((stat) => (
              <div key={stat.label} className="liquid-card p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-on-surface">{String(stat.value)}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(28,28,25,0.5)' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent consultations */}
            <div className="lg:col-span-2 glass-panel p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-on-surface">Recent consultations</h2>
                <Link
                  href="/sessions"
                  className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: '#8b4b1e' }}
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-1">
                {(recentSessions ?? []).length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'rgba(28,28,25,0.35)' }}>
                    No consultations yet. <Link href="/consultation/new" style={{ color: '#8b4b1e' }}>Start one →</Link>
                  </p>
                ) : (recentSessions ?? []).map((c) => (
                  <Link
                    key={c.id}
                    href={`/consultation/${c.id}/preview`}
                    className="flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-colors"
                    style={{ borderRadius: '16px', textDecoration: 'none' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(240,237,233,0.6)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(139,75,30,0.12)' }}>
                      <span className="text-xs font-bold" style={{ color: '#8b4b1e' }}>
                        {(c.customer_name ?? 'WI').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-on-surface truncate">{c.customer_name}</div>
                      <div className="text-xs" style={{ color: 'rgba(28,28,25,0.5)' }}>by {c.barber_name}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={c.status === 'completed'
                          ? { background: 'rgba(68,100,53,0.12)', color: '#446435' }
                          : { background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' }}>
                        {c.status}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(28,28,25,0.35)' }}>
                        <Clock size={11} /> {timeAgo(c.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Popular styles */}
              <div className="glass-panel p-6">
                <h2 className="text-base font-bold text-on-surface mb-5">Popular styles</h2>
                <div className="space-y-4">
                  {(popularStyles ?? []).length === 0 ? (
                    <p className="text-xs text-center py-2" style={{ color: 'rgba(28,28,25,0.35)' }}>No selections yet</p>
                  ) : (popularStyles ?? []).map((s) => (
                    <div key={s.style_name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-on-surface">{s.style_name}</span>
                        <span style={{ color: 'rgba(28,28,25,0.5)' }}>{s.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(240,237,233,0.9)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${s.pct}%`, background: '#8b4b1e' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team activity */}
              <div className="glass-panel p-6">
                <h2 className="text-base font-bold text-on-surface mb-5">Quick actions</h2>
                <div className="space-y-2">
                  {[
                    { label: 'New consultation', href: '/consultation/new', color: '#8b4b1e' },
                    { label: 'View all sessions', href: '/sessions', color: '#2c6767' },
                    { label: 'Manage team', href: '/settings/team', color: '#446435' },
                    { label: 'Salon settings', href: '/settings/salon', color: 'rgba(28,28,25,0.6)' },
                  ].map((a) => (
                    <Link key={a.href} href={a.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                      style={{ color: a.color }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(240,237,233,0.7)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}
                    >
                      <ChevronRight size={15} /> {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
