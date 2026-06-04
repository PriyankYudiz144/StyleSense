'use client';

import { useState } from 'react';
import { Plus, Mail, Shield, Trash2, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import { useTeamMembers, useInviteUser, useUpdateUser, useRemoveUser } from '@/lib/queries/users';
import { useAuthStore } from '@/stores/auth.store';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  salon_admin: 'Salon Admin',
  barber: 'Barber',
};

export default function TeamPage() {
  const { user: me } = useAuthStore();
  const { data: members, isLoading } = useTeamMembers();
  const inviteUser = useInviteUser();
  const updateUser = useUpdateUser();
  const removeUser = useRemoveUser();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('barber');
  const [newCreds, setNewCreds] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const handleInvite = async () => {
    setInviteError('');
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Name and email are required.');
      return;
    }
    try {
      const result = await inviteUser.mutateAsync({ full_name: inviteName, email: inviteEmail, role: inviteRole });
      setNewCreds({ email: result.user.email, password: result.temp_password });
      setShowInvite(false);
      setInviteName('');
      setInviteEmail('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setInviteError(msg ?? 'Failed to invite user.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Team management</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(28,28,25,0.45)' }}>
              Invite and manage your salon&apos;s stylists
            </p>
          </div>
          {me?.role !== 'barber' && (
            <button onClick={() => setShowInvite(true)} className="btn-primary text-sm px-5 py-2.5 min-h-0">
              <Plus size={16} /> Invite team member
            </button>
          )}
        </div>

        {/* New credentials banner */}
        {newCreds && (
          <div className="glass-panel p-5 mb-6 shadow-glass-sm"
            style={{ background: 'rgba(68,100,53,0.08)', border: '1px solid rgba(68,100,53,0.2)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: '#446435' }}>Invitation sent!</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(28,28,25,0.6)' }}>
                  Share these credentials with the new team member:
                </p>
                <div className="font-mono text-sm mt-2 space-y-1">
                  <div>Email: <span className="font-bold">{newCreds.email}</span></div>
                  <div>Password: <span className="font-bold">{newCreds.password}</span></div>
                </div>
              </div>
              <button onClick={() => copyToClipboard(`Email: ${newCreds.email}\nPassword: ${newCreds.password}`)}
                className="btn-secondary text-xs px-3 py-2 min-h-0 flex items-center gap-1.5">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setNewCreds(null)}
              className="text-xs mt-3" style={{ color: 'rgba(28,28,25,0.4)' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Team list */}
        <div className="glass-panel p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }} />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(217,194,182,0.3)' }}>
                  {['Member', 'Email', 'Role', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold px-4 py-3"
                      style={{ color: 'rgba(28,28,25,0.45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(members ?? []).map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(217,194,182,0.15)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(240,237,233,0.5)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: m.id === me?.id ? 'rgba(139,75,30,0.15)' : 'rgba(44,103,103,0.15)',
                            color: m.id === me?.id ? '#8b4b1e' : '#2c6767' }}>
                          {m.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-on-surface">{m.full_name}</span>
                          {m.id === me?.id && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' }}>You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(28,28,25,0.6)' }}>{m.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Shield size={13} style={{ color: m.role === 'salon_admin' ? '#8b4b1e' : 'rgba(28,28,25,0.4)' }} />
                        <span className="text-xs">{ROLE_LABELS[m.role] ?? m.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={m.is_active
                          ? { background: 'rgba(68,100,53,0.1)', color: '#446435' }
                          : { background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.id !== me?.id && me?.role !== 'barber' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateUser.mutate({ id: m.id, is_active: !m.is_active })}
                            title={m.is_active ? 'Deactivate' : 'Activate'}
                            style={{ color: m.is_active ? '#446435' : 'rgba(28,28,25,0.4)' }}>
                            {m.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${m.full_name} from team?`)) removeUser.mutate(m.id);
                            }}
                            style={{ color: 'rgba(186,26,26,0.6)' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invite modal */}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(28,28,25,0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-panel p-6 w-full max-w-sm shadow-glass-xl">
              <h2 className="text-lg font-bold text-on-surface mb-4">Invite team member</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Full name" value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)} className="glass-input" />
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(28,28,25,0.35)' }} />
                  <input type="email" placeholder="Email address" value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)} className="glass-input" style={{ paddingLeft: '36px' }} />
                </div>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="glass-input">
                  <option value="barber">Barber</option>
                  <option value="salon_admin">Salon Admin</option>
                </select>
              </div>
              {inviteError && (
                <p className="text-xs mt-2" style={{ color: '#ba1a1a' }}>{inviteError}</p>
              )}
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowInvite(false); setInviteError(''); }}
                  className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                <button onClick={handleInvite} disabled={inviteUser.isPending}
                  className="btn-primary flex-1 justify-center text-sm">
                  {inviteUser.isPending ? (
                    <div className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  ) : 'Send invite'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
