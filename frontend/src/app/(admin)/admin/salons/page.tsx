'use client';

import { useState } from 'react';
import { Search, Bell, HelpCircle, TrendingUp, Scissors, Clock, Pencil, Trash2, X, Plus, Copy, Check, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminSalons, useAdminStats, useCreateSalon, useDeleteSalon } from '@/lib/queries/admin';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active: { bg: 'rgba(68,100,53,0.1)', color: '#446435' },
  pending: { bg: 'rgba(169,99,52,0.1)', color: '#a96334' },
  suspended: { bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a' },
};

const TIERS = [
  { value: 'trial', label: 'Trial', credits: 50 },
  { value: 'starter', label: 'Starter', credits: 200 },
  { value: 'pro', label: 'Pro', credits: 500 },
  { value: 'enterprise', label: 'Enterprise', credits: 3000 },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg transition-all" style={{ color: copied ? '#446435' : 'rgba(83,68,59,0.5)' }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

interface CreatedCreds { salonName: string; email: string; password: string; tier: string; credits: number }

function CredentialsSummary({ creds, onClose }: { creds: CreatedCreds; onClose: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(28,28,25,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel w-full max-w-md p-8 rounded-[28px]">
        {/* Success header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(68,100,53,0.12)' }}>
            <CheckCircle size={32} style={{ color: '#446435' }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#1c1c19' }}>Salon Created!</h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(83,68,59,0.6)' }}>
            Share these credentials with the salon owner.
          </p>
        </div>

        {/* Salon name */}
        <div className="mb-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(240,237,233,0.6)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(83,68,59,0.5)' }}>Salon</p>
          <p className="text-sm font-bold" style={{ color: '#1c1c19' }}>{creds.salonName}</p>
        </div>

        {/* Credentials card */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid rgba(217,194,182,0.4)' }}>
          {/* Email row */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(217,194,182,0.3)', background: 'rgba(252,249,244,0.6)' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(83,68,59,0.5)' }}>Login Email</p>
              <p className="text-sm font-semibold" style={{ color: '#1c1c19' }}>{creds.email}</p>
            </div>
            <CopyButton text={creds.email} />
          </div>
          {/* Password row */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(252,249,244,0.6)' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(83,68,59,0.5)' }}>Password</p>
              <p className="text-sm font-semibold font-mono" style={{ color: '#1c1c19' }}>
                {showPw ? creds.password : '••••••••••'}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowPw(v => !v)} className="p-1.5 rounded-lg" style={{ color: 'rgba(83,68,59,0.5)' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <CopyButton text={creds.password} />
            </div>
          </div>
        </div>

        {/* Plan + credits */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 px-4 py-3 rounded-2xl text-center" style={{ background: 'rgba(139,75,30,0.06)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(83,68,59,0.5)' }}>Plan</p>
            <p className="text-sm font-bold capitalize" style={{ color: '#8b4b1e' }}>{creds.tier}</p>
          </div>
          <div className="flex-1 px-4 py-3 rounded-2xl text-center" style={{ background: 'rgba(139,75,30,0.06)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(83,68,59,0.5)' }}>AI Credits</p>
            <p className="text-sm font-bold" style={{ color: '#8b4b1e' }}>{creds.credits.toLocaleString()}</p>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-110"
          style={{ background: '#8b4b1e' }}>
          Done
        </button>
      </div>
    </div>
  );
}

function CreateSalonModal({ onClose }: { onClose: () => void }) {
  const create = useCreateSalon();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    admin_name: '', admin_email: '', admin_password: '',
    subscription_tier: 'trial',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [createdCreds, setCreatedCreds] = useState<CreatedCreds | null>(null);

  const selectedTier = TIERS.find(t => t.value === form.subscription_tier) ?? TIERS[0];

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.name || !form.email || !form.phone || !form.address || !form.admin_name || !form.admin_email || !form.admin_password) {
      setError('All fields are required');
      return;
    }
    try {
      await create.mutateAsync({ ...form, ai_credits: selectedTier.credits });
      setCreatedCreds({
        salonName: form.name,
        email: form.admin_email,
        password: form.admin_password,
        tier: form.subscription_tier,
        credits: selectedTier.credits,
      });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Failed to create salon');
    }
  };

  if (createdCreds) return <CredentialsSummary creds={createdCreds} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(28,28,25,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel w-full max-w-lg rounded-[28px] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-8 pb-5"
          style={{ borderBottom: '1px solid rgba(217,194,182,0.3)' }}>
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#1c1c19' }}>New Salon</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(83,68,59,0.55)' }}>Create salon + owner account in one step</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container transition-colors"
            style={{ color: 'rgba(83,68,59,0.5)' }}><X size={18} /></button>
        </div>

        <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Salon Info */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8b4b1e' }}>Salon Details</p>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Salon Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Maison de Beauté" className="glass-input w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Salon Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="contact@salon.com" className="glass-input w-full" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1-555-0100" className="glass-input w-full" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Address</label>
              <input type="text" value={form.address} onChange={set('address')} placeholder="123 Style St, City, Country" className="glass-input w-full" />
            </div>
          </div>

          {/* Subscription Tier */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8b4b1e' }}>Subscription Plan</p>
            <div className="grid grid-cols-4 gap-2">
              {TIERS.map(tier => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, subscription_tier: tier.value }))}
                  className="flex flex-col items-center py-3 px-2 rounded-2xl border transition-all"
                  style={form.subscription_tier === tier.value
                    ? { background: '#8b4b1e', borderColor: '#8b4b1e', color: '#fff' }
                    : { background: 'rgba(252,249,244,0.6)', borderColor: 'rgba(217,194,182,0.4)', color: 'rgba(83,68,59,0.7)' }
                  }
                >
                  <span className="text-xs font-bold">{tier.label}</span>
                  <span className="text-[10px] mt-1 opacity-80">{tier.credits} cr</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(139,75,30,0.06)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b4b1e' }} />
              <p className="text-xs" style={{ color: 'rgba(83,68,59,0.7)' }}>
                <span className="font-semibold capitalize" style={{ color: '#8b4b1e' }}>{selectedTier.label}</span>
                {' '}plan includes <span className="font-semibold">{selectedTier.credits.toLocaleString()} AI credits</span>
              </p>
            </div>
          </div>

          {/* Owner Account */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8b4b1e' }}>Owner Account</p>
            <p className="text-xs" style={{ color: 'rgba(83,68,59,0.55)' }}>These credentials will be shared with the salon owner to log in.</p>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Owner Full Name</label>
              <input type="text" value={form.admin_name} onChange={set('admin_name')} placeholder="e.g. Alex Chen" className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Login Email</label>
              <input type="email" value={form.admin_email} onChange={set('admin_email')} placeholder="owner@salon.com" className="glass-input w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(83,68,59,0.7)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.admin_password} onChange={set('admin_password')}
                  placeholder="Min. 8 characters" className="glass-input w-full" style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'rgba(83,68,59,0.4)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl text-sm" style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-5" style={{ borderTop: '1px solid rgba(217,194,182,0.3)' }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-colors"
            style={{ borderColor: 'rgba(217,194,182,0.5)', color: 'rgba(83,68,59,0.7)' }}>Cancel</button>
          <button onClick={submit} disabled={create.isPending}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: '#8b4b1e' }}>
            {create.isPending ? 'Creating…' : 'Create Salon'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalonsPage() {
  const { data: salons = [], isLoading } = useAdminSalons();
  const { data: stats } = useAdminStats();
  const deleteSalon = useDeleteSalon();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this salon? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteSalon.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {showCreate && <CreateSalonModal onClose={() => setShowCreate(false)} />}

      {/* Top Nav */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-16 h-20"
        style={{ background: 'rgba(252,249,244,0.6)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-2xl" style={{ color: '#8b4b1e', letterSpacing: '-0.01em' }}>Salon Management</span>
          <div className="w-px h-6" style={{ background: 'rgba(217,194,182,0.6)' }} />
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(44,103,103,0.1)', color: '#2c6767' }}>Enterprise</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <Search size={16} style={{ color: 'rgba(83,68,59,0.5)' }} />
            <input className="bg-transparent border-none outline-none text-sm w-56" placeholder="Search directory..." />
          </div>
          <button className="p-2 rounded-full hover:bg-primary/5" style={{ color: 'rgba(83,68,59,0.6)' }}><Bell size={20} /></button>
          <button className="p-2 rounded-full hover:bg-primary/5" style={{ color: 'rgba(83,68,59,0.6)' }}><HelpCircle size={20} /></button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-16 pb-12 pt-10 max-w-[1440px] mx-auto w-full space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#1c1c19', letterSpacing: '-0.02em' }}>Active Directory</h2>
            <p className="mt-1 text-sm max-w-lg" style={{ color: 'rgba(83,68,59,0.6)' }}>
              Manage, monitor, and scale your salon network.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: '#8b4b1e', boxShadow: '0 4px 16px rgba(139,75,30,0.25)' }}>
            <Plus size={18} /> New Salon
          </button>
        </div>

        {/* Bento Stats */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 glass-panel rounded-[24px] p-8 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(139,75,30,0.6)' }}>Network Overview</span>
              <div className="flex items-baseline gap-4 mt-2">
                <h4 className="font-bold" style={{ fontSize: '42px', lineHeight: 1, color: '#1c1c19', letterSpacing: '-0.02em' }}>
                  {(stats?.total_salons ?? 0).toLocaleString()} Salons
                </h4>
                <span className="font-bold flex items-center gap-1 text-sm" style={{ color: '#446435' }}>
                  <TrendingUp size={16} /> Active Network
                </span>
              </div>
              <p className="mt-2 text-sm" style={{ color: 'rgba(83,68,59,0.55)' }}>
                {(stats?.total_stylists ?? 0).toLocaleString()} stylists · {(stats?.total_customers ?? 0).toLocaleString()} clients
              </p>
            </div>
            <div className="relative z-10 h-24 w-full mt-4 rounded-xl border-b"
              style={{ background: 'linear-gradient(to top, rgba(139,75,30,0.05), transparent)', borderColor: 'rgba(139,75,30,0.1)' }}>
              <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-between px-2">
                {[40, 60, 45, 75, 55, 90, 65].map((h, i) => (
                  <div key={i} className="w-8 rounded-t-md" style={{ height: `${h}%`, background: `rgba(139,75,30,${0.15 + i * 0.05})` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-[24px] p-6 flex-1 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(44,103,103,0.1)' }}>
                <Scissors size={28} style={{ color: '#2c6767' }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(83,68,59,0.55)' }}>Active Salons</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1c1c19' }}>
                  {salons.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
            <div className="glass-panel rounded-[24px] p-6 flex-1 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#ffdbc8' }}>
                <Clock size={28} style={{ color: '#8b4b1e' }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(83,68,59,0.55)' }}>Pending</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1c1c19' }}>
                  {salons.filter(s => s.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-[24px] overflow-hidden">
          <div className="px-8 py-5 flex justify-between items-center"
            style={{ borderBottom: '1px solid rgba(217,194,182,0.3)', background: 'rgba(252,249,244,0.4)' }}>
            <h4 className="text-lg font-semibold" style={{ color: '#1c1c19' }}>Salon Directory</h4>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-full text-xs font-semibold border"
                style={{ borderColor: 'rgba(217,194,182,0.5)', color: 'rgba(83,68,59,0.7)' }}>Export CSV</button>
              <button className="px-4 py-2 rounded-full text-xs font-semibold border"
                style={{ borderColor: 'rgba(217,194,182,0.5)', color: 'rgba(83,68,59,0.7)' }}>Filters</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'rgba(246,243,238,0.3)' }}>
                  {['Salon Detail', 'Location', 'Status', 'Sessions', 'Tier', 'Actions'].map((h, i) => (
                    <th key={h} className="px-8 py-4 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'rgba(83,68,59,0.55)', textAlign: i >= 2 ? (i <= 4 ? 'center' : 'right') : 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(217,194,182,0.2)' }}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-8 py-5">
                          <div className="h-4 rounded-full animate-pulse" style={{ background: 'rgba(217,194,182,0.3)', width: j === 0 ? '160px' : '80px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : salons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-sm" style={{ color: 'rgba(83,68,59,0.4)' }}>
                      No salons found. Create the first one.
                    </td>
                  </tr>
                ) : (
                  salons.map((salon, idx) => {
                    const s = STATUS_STYLE[salon.status] ?? STATUS_STYLE.active;
                    return (
                      <tr key={salon.id} className="group transition-colors hover:bg-primary/5"
                        style={{ borderTop: idx > 0 ? '1px solid rgba(217,194,182,0.2)' : undefined }}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #c77b4a 0%, #8b4b1e 100%)' }}>
                              {salon.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: '#1c1c19' }}>{salon.name}</p>
                              <p className="text-[11px]" style={{ color: 'rgba(83,68,59,0.5)' }}>{salon.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm" style={{ color: 'rgba(83,68,59,0.7)' }}>{salon.address}</td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider capitalize"
                              style={{ background: s.bg, color: s.color }}>{salon.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-sm font-semibold" style={{ color: '#1c1c19' }}>{salon.session_count}</span>
                          <span className="text-[10px] ml-1" style={{ color: 'rgba(83,68,59,0.4)' }}>({salon.completed_sessions} done)</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize"
                              style={{ background: 'rgba(139,75,30,0.08)', color: '#8b4b1e' }}>{salon.subscription_tier}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-lg transition-colors hover:bg-secondary-container"
                              style={{ color: '#2c6767' }}>
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(salon.id)}
                              disabled={deletingId === salon.id}
                              className="p-2 rounded-lg transition-colors disabled:opacity-40"
                              style={{ color: '#ba1a1a' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(186,26,26,0.08)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 flex justify-between items-center"
            style={{ borderTop: '1px solid rgba(217,194,182,0.3)', background: 'rgba(246,243,238,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(83,68,59,0.55)' }}>
              Showing {salons.length} salon{salons.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
