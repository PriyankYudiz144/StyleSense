'use client';

import { Search, Bell, HelpCircle, DollarSign, Calendar, Star, UserPlus, Lightbulb, ArrowRight } from 'lucide-react';
import { useAdminAnalytics, useAdminStats } from '@/lib/queries/admin';

export default function AnalyticsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const dailySessions = analytics?.daily_sessions ?? [];
  const maxSessions = Math.max(...dailySessions.map(d => d.total), 1);

  const metricCards = [
    {
      label: 'Monthly Sessions',
      value: statsLoading ? '—' : (stats?.monthly_sessions ?? 0).toLocaleString(),
      change: '+12.4%',
      positive: true,
      icon: DollarSign,
      color: 'rgba(139,75,30,0.1)',
      iconColor: '#8b4b1e',
    },
    {
      label: 'Completed',
      value: statsLoading ? '—' : (stats?.completed_sessions ?? 0).toLocaleString(),
      change: '+8.2%',
      positive: true,
      icon: Calendar,
      color: 'rgba(44,103,103,0.1)',
      iconColor: '#2c6767',
    },
    {
      label: 'Total Salons',
      value: statsLoading ? '—' : (stats?.total_salons ?? 0).toLocaleString(),
      change: 'Stable',
      positive: null,
      icon: Star,
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
      positive: stats ? stats.new_clients_this_month >= stats.new_clients_last_month : null,
      icon: UserPlus,
      color: 'rgba(169,99,52,0.1)',
      iconColor: '#a96334',
    },
  ];

  const popularStyles = analytics?.popular_styles ?? [];
  const tierBreakdown = analytics?.tier_breakdown ?? [];

  return (
    <>
      {/* Top Nav */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-16 h-20"
        style={{ background: 'rgba(252,249,244,0.6)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-2xl" style={{ color: '#8b4b1e', letterSpacing: '-0.01em' }}>Salon Management</span>
          <div className="w-px h-6" style={{ background: 'rgba(217,194,182,0.6)' }} />
          <span className="text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>Analytics & Stats</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Search size={16} style={{ color: 'rgba(83,68,59,0.5)' }} />
            <input className="bg-transparent border-none outline-none text-sm w-56" placeholder="Search analytics..." />
          </div>
          <button className="p-2 rounded-full hover:bg-primary/5" style={{ color: 'rgba(83,68,59,0.6)' }}><Bell size={20} /></button>
          <button className="p-2 rounded-full hover:bg-primary/5" style={{ color: 'rgba(83,68,59,0.6)' }}><HelpCircle size={20} /></button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-16 pb-12 pt-10 max-w-[1440px] mx-auto w-full space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(139,75,30,0.7)' }}>Performance Overview</p>
            <h2 className="text-3xl font-bold" style={{ color: '#1c1c19', letterSpacing: '-0.02em' }}>Market Intelligence</h2>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-xl p-1"
              style={{ background: 'rgba(229,226,221,0.2)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', backdropFilter: 'blur(8px)' }}>
              {['Last 30 Days', 'Quarterly', 'Yearly'].map((label, i) => (
                <button key={label} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={i === 0
                    ? { background: '#fcf9f4', color: '#8b4b1e', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
                    : { color: 'rgba(83,68,59,0.6)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-6">
          {metricCards.map(({ label, value, change, positive, icon: Icon, color, iconColor }) => (
            <div key={label} className="glass-panel p-6 rounded-[24px] space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl" style={{ background: color }}><Icon size={22} style={{ color: iconColor }} /></div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={positive === true
                    ? { color: '#2c6767', background: 'rgba(44,103,103,0.08)' }
                    : positive === false
                    ? { color: '#ba1a1a', background: 'rgba(186,26,26,0.08)' }
                    : { color: 'rgba(83,68,59,0.6)', background: 'rgba(229,226,221,0.3)' }}>
                  {change}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(83,68,59,0.55)' }}>{label}</p>
                <h4 className="text-2xl font-semibold mt-1" style={{ color: '#1c1c19', letterSpacing: '-0.01em' }}>{value}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Styles */}
        <div className="grid grid-cols-3 gap-6">
          {/* Booking Trends — real data */}
          <div className="col-span-2 glass-panel p-8 rounded-[24px] flex flex-col" style={{ height: '440px' }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-xl font-semibold" style={{ color: '#1c1c19', letterSpacing: '-0.01em' }}>Booking Trends</h4>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(83,68,59,0.6)' }}>Daily sessions over last 7 days</p>
              </div>
              <div className="flex gap-4">
                {[['#8b4b1e', 'Total'], ['rgba(217,194,182,0.8)', 'Completed']].map(([bg, lbl]) => (
                  <div key={lbl} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: bg }} />
                    <span className="text-xs" style={{ color: 'rgba(83,68,59,0.6)' }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div className="flex-1 flex items-end gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t-lg animate-pulse" style={{ height: `${60 + i * 20}px`, background: 'rgba(217,194,182,0.3)' }} />
                    <div className="h-3 w-8 rounded animate-pulse" style={{ background: 'rgba(217,194,182,0.3)' }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex-1 relative flex items-end gap-2">
                  <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-full border-t" style={{ borderColor: 'rgba(217,194,182,0.15)' }} />
                    ))}
                  </div>
                  <div className="flex-1 flex items-end justify-around h-full z-10 gap-2">
                    {dailySessions.map(({ day, total, completed }) => {
                      const barH = Math.max((total / maxSessions) * 250, 4);
                      const compH = total > 0 ? (completed / total) * barH : 0;
                      return (
                        <div key={day} className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-full rounded-t-lg relative group cursor-pointer"
                            style={{ height: `${barH}px`, background: 'rgba(139,75,30,0.1)' }}>
                            <div className="absolute bottom-0 w-full rounded-t-lg transition-all group-hover:brightness-110"
                              style={{ height: `${compH}px`, background: '#8b4b1e' }} />
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white text-xs px-2 py-1 rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                              style={{ borderColor: 'rgba(217,194,182,0.3)', color: '#8b4b1e' }}>
                              {total} sessions
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-around pt-3">
                  {dailySessions.map(({ day }) => (
                    <span key={day} className="text-[10px] font-semibold flex-1 text-center" style={{ color: 'rgba(83,68,59,0.45)' }}>{day}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Popular Styles — real data */}
          <div className="glass-panel p-8 rounded-[24px] flex flex-col">
            <h4 className="text-xl font-semibold" style={{ color: '#1c1c19', letterSpacing: '-0.01em' }}>Popular Styles</h4>
            <p className="text-sm mt-1 mb-6" style={{ color: 'rgba(83,68,59,0.6)' }}>Selected styles across network</p>

            {analyticsLoading ? (
              <div className="space-y-5 flex-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 rounded-full" style={{ background: 'rgba(217,194,182,0.3)' }} />
                    <div className="h-2 rounded-full" style={{ background: 'rgba(217,194,182,0.2)' }} />
                  </div>
                ))}
              </div>
            ) : popularStyles.length === 0 ? (
              <p className="text-sm py-8 text-center flex-1" style={{ color: 'rgba(83,68,59,0.4)' }}>No selections yet</p>
            ) : (
              <div className="space-y-5 flex-1">
                {popularStyles.map(({ style_name, pct }) => (
                  <div key={style_name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium" style={{ color: '#1c1c19' }}>{style_name}</span>
                      <span className="text-sm font-bold" style={{ color: '#8b4b1e' }}>{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(229,226,221,0.4)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'linear-gradient(135deg, #c77b4a 0%, #8b4b1e 100%)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tierBreakdown.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl flex items-center gap-3"
                style={{ background: 'rgba(229,226,221,0.2)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,75,30,0.1)' }}>
                  <Lightbulb size={18} style={{ color: '#8b4b1e' }} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(83,68,59,0.65)' }}>
                  <span className="font-bold" style={{ color: '#1c1c19' }}>Insight:</span>{' '}
                  {tierBreakdown.map(t => `${t.count} ${t.tier}`).join(', ')} tier salons.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tier Breakdown */}
        {tierBreakdown.length > 0 && (
          <div className="glass-panel rounded-[24px] p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-xl font-semibold" style={{ color: '#1c1c19', letterSpacing: '-0.01em' }}>Subscription Tiers</h4>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(83,68,59,0.6)' }}>Distribution across the network</p>
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8b4b1e' }}>
                View Details <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {tierBreakdown.map(({ tier, count }) => (
                <div key={tier} className="p-5 rounded-2xl text-center"
                  style={{ background: 'rgba(240,237,233,0.5)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#1c1c19' }}>{count}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider mt-1 capitalize" style={{ color: '#8b4b1e' }}>{tier}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
