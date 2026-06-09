'use client';

import { Search, Bell, HelpCircle, Shield, Globe, Mail, Bell as BellIcon, Key, Users } from 'lucide-react';

const SETTING_SECTIONS = [
  {
    icon: Shield,
    title: 'Security & Access',
    desc: 'Manage authentication policies, 2FA requirements, and session controls.',
    color: 'rgba(139,75,30,0.1)',
    iconColor: '#8b4b1e',
    items: ['Two-factor authentication', 'Session timeout', 'IP allowlist', 'Audit logs'],
  },
  {
    icon: Globe,
    title: 'Platform Configuration',
    desc: 'Global settings for the StyleSense network including region and localization.',
    color: 'rgba(44,103,103,0.1)',
    iconColor: '#2c6767',
    items: ['Default language', 'Currency settings', 'Timezone', 'Data residency'],
  },
  {
    icon: Mail,
    title: 'Notifications & Alerts',
    desc: 'Configure system-wide alerts, escalation paths, and email templates.',
    color: 'rgba(68,100,53,0.1)',
    iconColor: '#446435',
    items: ['Email templates', 'Alert thresholds', 'Escalation rules', 'SMS providers'],
  },
  {
    icon: Key,
    title: 'API & Integrations',
    desc: 'Manage API keys, webhooks, and third-party service integrations.',
    color: 'rgba(169,99,52,0.1)',
    iconColor: '#a96334',
    items: ['API keys', 'Webhooks', 'OAuth apps', 'Rate limits'],
  },
  {
    icon: Users,
    title: 'Admin Roles & Permissions',
    desc: 'Define admin roles, permission scopes, and multi-admin access controls.',
    color: 'rgba(139,75,30,0.08)',
    iconColor: '#8b4b1e',
    items: ['Role definitions', 'Permission matrix', 'Admin invites', 'Access revocation'],
  },
  {
    icon: BellIcon,
    title: 'Billing & Subscriptions',
    desc: 'Manage platform billing cycles, invoice templates, and payment gateways.',
    color: 'rgba(44,103,103,0.08)',
    iconColor: '#2c6767',
    items: ['Payment gateways', 'Invoice templates', 'Tax settings', 'Proration rules'],
  },
];

export default function AdminSettingsPage() {
  return (
    <>
      {/* Top Nav */}
      <header
        className="sticky top-0 z-40 flex justify-between items-center px-16 h-20"
        style={{
          background: 'rgba(252,249,244,0.6)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="font-semibold text-2xl" style={{ color: '#8b4b1e', letterSpacing: '-0.01em' }}>Salon Management</span>
          <div className="w-px h-6" style={{ background: 'rgba(217,194,182,0.6)' }} />
          <span className="text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>Platform Settings</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Search size={16} style={{ color: 'rgba(83,68,59,0.5)' }} />
            <input className="bg-transparent border-none outline-none text-sm w-56" placeholder="Search settings..." />
          </div>
          <button className="p-2 rounded-full hover:bg-primary/5 transition-colors" style={{ color: 'rgba(83,68,59,0.6)' }}>
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-primary/5 transition-colors" style={{ color: 'rgba(83,68,59,0.6)' }}>
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-16 pb-12 pt-10 max-w-[1440px] mx-auto w-full space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(139,75,30,0.7)' }}>System Configuration</p>
          <h2 className="text-3xl font-bold" style={{ color: '#1c1c19', letterSpacing: '-0.02em' }}>Platform Settings</h2>
          <p className="mt-2 text-sm" style={{ color: 'rgba(83,68,59,0.6)' }}>
            Configure global system behavior, security policies, and admin controls.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {SETTING_SECTIONS.map(({ icon: Icon, title, desc, color, iconColor, items }) => (
            <div key={title} className="glass-panel p-7 rounded-[24px] group hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: color }}>
                  <Icon size={22} style={{ color: iconColor }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base" style={{ color: '#1c1c19' }}>{title}</h4>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(83,68,59,0.6)' }}>{desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => (
                  <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(240,237,233,0.5)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: iconColor }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(83,68,59,0.75)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
