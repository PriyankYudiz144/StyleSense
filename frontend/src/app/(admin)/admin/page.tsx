'use client';

import { Search, Bell, HelpCircle, TrendingUp, TrendingDown, Store, Users, DollarSign, UserPlus, Plus, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useAdminStats, useAdminActivities } from '@/lib/queries/admin';

const CHART_MAX_H = 280;

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  new_salon: { icon: Plus, bg: 'rgba(139,75,30,0.12)', color: '#8b4b1e' },
  new_user: { icon: Star, bg: 'rgba(44,103,103,0.1)', color: '#2c6767' },
  kyc: { icon: CheckCircle, bg: 'rgba(44,103,103,0.1)', color: '#2c6767' },
  alert: { icon: AlertTriangle, bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATIC_BARS = [140, 160, 220, 190, 250, 280, 120];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: activities = [], isLoading: actLoading } = useAdminActivities();

  const metricCards = [
    {
      label: 'Total Salons',
      value: statsLoading ? '—' : (stats?.total_salons ?? 0).toLocaleString(),
      change: '+12%',
      positive: true,
      icon: Store,
      color: 'rgba(139,75,30,0.1)',
      iconColor: '#8b4b1e',
    },
    {
      label: 'Active Stylists',
      value: statsLoading ? '—' : (stats?.total_stylists ?? 0).toLocaleString(),
      change: '+8%',
      positive: true,
      icon: Users,
      color: 'rgba(44,103,103,0.1)',
      iconColor: '#2c6767',
    },
    {
      label: 'Monthly Sessions',
      value: statsLoading ? '—' : (stats?.monthly_sessions ?? 0).toLocaleString(),
      change: '+24%',
      positive: true,
      icon: DollarSign,
      color: 'rgba(68,100,53,0.1)',
      iconColor: '#446435',
    },
    {
      label: 'New Clients',
      value: statsLoading ? '—' : (stats?.new_clients_this_month ?? 0).toLocaleString(),
      change: (() => {
        if (!stats) return '—';
        const prev = stats.new_clients_last_month;
        const curr = stats.new_clients_this_month;
        if (!prev) return curr > 0 ? '+∞' : '0%';
        const pct = Math.round(((curr - prev) / prev) * 100);
        return `${pct >= 0 ? '+' : ''}${pct}%`;
      })(),
      positive: stats ? stats.new_clients_this_month >= stats.new_clients_last_month : true,
      icon: UserPlus,
      color: 'rgba(169,99,52,0.1)',
      iconColor: '#a96334',
    },
  ];

  return (
    <>
      {/* Top Nav */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-16 h-20"
        style={{ background: 'rgba(252,249,244,0.6)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-2xl" style={{ color: '#8b4b1e', letterSpacing: '-0.01em' }}>Salon Management</span>
          <div className="w-px h-6" style={{ background: 'rgba(217,194,182,0.6)' }} />
          <span className="text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>Global Overview</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Search size={16} style={{ color: 'rgba(83,68,59,0.5)' }} />
            <input className="bg-transparent border-none outline-none text-sm w-56 placeholder:opacity-50" placeholder="Search systems..." />
          </div>
          <button className="p-2 rounded-full transition-colors hover:bg-primary/5" style={{ color: 'rgba(83,68,59,0.6)' }}><Bell size={20} /></button>
          <button className="p-2 rounded-full transition-colors hover:bg-primary/5" style={{ color: 'rgba(83,68,59,0.6)' }}><HelpCircle size={20} /></button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-16 pb-12 pt-10 max-w-[1440px] mx-auto w-full space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#1c1c19', letterSpacing: '-0.02em' }}>System Statistics</h2>
            <p className="mt-1 text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>Snapshot of StyleSense network performance today.</p>
          </div>
          <div className="flex gap-3">
            <button className="glass-panel px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ color: '#8b4b1e' }}>Last 30 Days</button>
            <button className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110 active:scale-95"
              style={{ background: '#8b4b1e', boxShadow: '0 4px 16px rgba(139,75,30,0.25)' }}>
              Export Report
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-6">
          {metricCards.map(({ label, value, change, positive, icon: Icon, color, iconColor }) => (
            <div key={label} className="glass-panel p-6 rounded-[24px]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl" style={{ background: color }}><Icon size={22} style={{ color: iconColor }} /></div>
                <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ color: positive ? '#2c6767' : '#ba1a1a', background: positive ? 'rgba(44,103,103,0.08)' : 'rgba(186,26,26,0.08)' }}>
                  {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {change}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(83,68,59,0.6)' }}>{label}</p>
              <h3 className="text-[28px] font-bold" style={{ color: '#1c1c19', letterSpacing: '-0.02em' }}>{value}</h3>
            </div>
          ))}
        </div>

        {/* Bento */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chart */}
          <div className="col-span-8 glass-panel rounded-[24px] p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#1c1c19', letterSpacing: '-0.01em' }}>Salon Performance</h3>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(83,68,59,0.6)' }}>Session volume across all locations</p>
              </div>
              <div className="flex gap-3">
                {[['#8b4b1e', 'Sessions'], ['#2c6767', 'Completed']].map(([bg, lbl]) => (
                  <div key={lbl} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(240,237,233,0.9)', color: '#1c1c19' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: bg }} />
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex items-end gap-4 min-h-[280px] pt-6">
              {STATIC_BARS.map((h, i) => (
                <div key={DAYS[i]} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full rounded-t-lg relative cursor-pointer group"
                    style={{ height: `${h}px`, background: 'rgba(139,75,30,0.1)' }}>
                    <div className="absolute bottom-0 w-full rounded-t-lg transition-all group-hover:brightness-110"
                      style={{ height: `${Math.round(h * 0.7)}px`, background: 'rgba(139,75,30,0.4)' }} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase" style={{ color: 'rgba(83,68,59,0.5)' }}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="col-span-4 glass-panel rounded-[24px] p-8">
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#1c1c19', letterSpacing: '-0.01em' }}>Recent Activities</h3>
            {actLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: 'rgba(217,194,182,0.3)' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded-full w-3/4" style={{ background: 'rgba(217,194,182,0.3)' }} />
                      <div className="h-3 rounded-full w-full" style={{ background: 'rgba(217,194,182,0.2)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'rgba(83,68,59,0.4)' }}>No recent activity</p>
            ) : (
              <div className="flex flex-col gap-5">
                {activities.slice(0, 4).map((act, i) => {
                  const cfg = ACTIVITY_ICONS[act.type] ?? ACTIVITY_ICONS.new_salon;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: cfg.bg }}>
                        <Icon size={18} style={{ color: cfg.color }} />
                      </div>
                      <div className={`flex-1 pb-4 ${i < Math.min(activities.length, 4) - 1 ? 'border-b' : ''}`}
                        style={{ borderColor: 'rgba(217,194,182,0.3)' }}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm font-bold" style={{ color: '#1c1c19' }}>{act.title}</span>
                          <span className="text-[10px]" style={{ color: 'rgba(83,68,59,0.5)' }}>{timeAgo(act.time)}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(83,68,59,0.65)' }}>{act.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="w-full mt-6 py-3 rounded-xl border text-sm font-medium transition-colors hover:brightness-95"
              style={{ borderColor: 'rgba(217,194,182,0.5)', color: 'rgba(83,68,59,0.6)' }}>
              View All Activity
            </button>
          </div>

          {/* Bottom Row */}
          <div className="col-span-4 glass-panel rounded-[24px] p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,75,30,0.1)' }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#8b4b1e' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-base" style={{ color: '#1c1c19' }}>Expansion</h4>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(83,68,59,0.6)' }}>
                {statsLoading ? '—' : `${stats?.total_salons ?? 0} salons across the network.`}
              </p>
            </div>
          </div>

          <div className="col-span-8 glass-panel rounded-[24px] p-6 flex justify-between items-center overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-3" style={{ color: '#1c1c19' }}>System Health</h4>
              <div className="flex gap-10">
                {[
                  ['99.9%', 'Uptime'],
                  [statsLoading ? '—' : `${stats?.completed_sessions ?? 0}`, 'Completions'],
                  ['0 Errors', 'Last 24h'],
                ].map(([val, lbl]) => (
                  <div key={lbl} className="flex flex-col gap-1">
                    <span className="text-xl font-bold" style={{ color: '#2c6767' }}>{val}</span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(83,68,59,0.5)' }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(44,103,103,0.05)' }} />
            <div className="absolute right-10 -bottom-10 w-24 h-24 rounded-full blur-2xl" style={{ background: 'rgba(139,75,30,0.05)' }} />
          </div>
        </div>
      </div>
    </>
  );
}
