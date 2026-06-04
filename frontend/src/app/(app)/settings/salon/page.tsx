'use client';

import { useEffect, useState } from 'react';
import { Save, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface SalonInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscription_tier: string;
  ai_credits_remaining: number;
}

export default function SalonSettingsPage() {
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get<SalonInfo>('/salons/me').then((r) => {
      setSalon(r.data);
      setName(r.data.name);
      setPhone(r.data.phone);
      setAddress(r.data.address);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/salons/me', { name, phone, address });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(139,75,30,0.12)' }}>
            <Building2 size={20} style={{ color: '#8b4b1e' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Salon Settings</h1>
            <p className="text-sm" style={{ color: 'rgba(28,28,25,0.45)' }}>Manage your salon profile</p>
          </div>
        </div>

        {/* Subscription info */}
        {salon && (
          <div className="liquid-card p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(28,28,25,0.45)' }}>
                Current plan
              </p>
              <p className="text-base font-bold text-on-surface capitalize mt-0.5">
                {salon.subscription_tier}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'rgba(28,28,25,0.45)' }}>AI credits remaining</p>
              <p className="text-2xl font-extrabold" style={{ color: '#8b4b1e' }}>
                {salon.ai_credits_remaining}
              </p>
            </div>
          </div>
        )}

        <div className="glass-panel p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Salon name
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="glass-input" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Email address
            </label>
            <input type="email" value={salon?.email ?? ''} disabled className="glass-input"
              style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Phone number
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="glass-input" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'rgba(28,28,25,0.55)' }}>
              Address
            </label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="glass-input" />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
            {saving ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : saved ? (
              <><Save size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save changes</>
            )}
          </button>
        </div>
    </div>
  );
}
