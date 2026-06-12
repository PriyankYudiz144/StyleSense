'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, XCircle, Loader, Trash2 } from 'lucide-react';
import { useRecentSessions } from '@/lib/queries/dashboard';
import { useDeleteSession } from '@/lib/queries/sessions';

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  completed: { bg: 'rgba(68,100,53,0.12)', color: '#446435', icon: <CheckCircle size={13} /> },
  in_progress: { bg: 'rgba(139,75,30,0.1)', color: '#8b4b1e', icon: <Loader size={13} /> },
  abandoned: { bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a', icon: <XCircle size={13} /> },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SessionsPage() {
  const { data: sessions, isLoading } = useRecentSessions();
  const [filter, setFilter] = useState<string>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { mutate: deleteSession, isPending: deleting } = useDeleteSession();

  const filtered = (sessions ?? []).filter((s) => filter === 'all' || s.status === filter);

  const handleDelete = (id: string) => {
    deleteSession(id, { onSuccess: () => setConfirmId(null) });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Consultations</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(28,28,25,0.45)' }}>
            {sessions?.length ?? 0} total sessions
          </p>
        </div>
        <Link href="/consultation/new" className="btn-primary text-sm px-5 py-2.5 min-h-0">
          <Plus size={16} /> New consultation
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'in_progress', 'completed', 'abandoned'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="chip" style={filter === f ? { background: '#8b4b1e', color: '#fff', borderColor: '#8b4b1e' } : {}}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="glass-panel p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'rgba(28,28,25,0.4)' }}>
            <p className="text-sm">No sessions found.</p>
            <Link href="/consultation/new" className="btn-primary mt-4 mx-auto inline-flex text-sm px-5 py-2.5 min-h-0">
              <Plus size={16} /> Start one
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(217,194,182,0.3)' }}>
                {['Client', 'Stylist', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold px-4 py-3"
                    style={{ color: 'rgba(28,28,25,0.45)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.in_progress;
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(217,194,182,0.15)' }}
                    className="transition-colors"
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(240,237,233,0.5)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' }}>
                          {(s.customer_name ?? 'WI').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{s.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(28,28,25,0.6)' }}>{s.barber_name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        {st.icon} {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(28,28,25,0.4)' }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(s.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/consultation/${s.id}/preview`}
                          className="text-xs font-semibold hover:opacity-70 transition-opacity"
                          style={{ color: '#8b4b1e' }}>
                          View →
                        </Link>
                        <button
                          onClick={() => setConfirmId(s.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: 'rgba(186,26,26,0.5)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm delete dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel p-6 w-full max-w-sm shadow-glass-lg">
            <h2 className="text-lg font-bold text-on-surface mb-2">Delete consultation?</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(28,28,25,0.55)' }}>
              This will permanently delete the session and all generated hairstyle previews. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
                style={{ background: 'rgba(28,28,25,0.08)', color: 'rgba(28,28,25,0.7)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={deleting}
                className="px-4 py-2 rounded-2xl text-sm font-medium text-white transition-opacity hover:opacity-80 flex items-center gap-2"
                style={{ background: '#ba1a1a' }}
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                ) : (
                  <><Trash2 size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
