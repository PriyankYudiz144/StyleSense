'use client';

import { useState } from 'react';
import { Plus, Search, User, Phone } from 'lucide-react';
import { useCustomers, useCreateCustomer } from '@/lib/queries/customers';

export default function CustomersPage() {
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const { data, isLoading } = useCustomers(page, search || undefined);
  const createCustomer = useCreateCustomer();

  const handleAdd = async () => {
    if (!name.trim()) return;
    await createCustomer.mutateAsync({ full_name: name.trim(), phone: phone.trim() || undefined });
    setName('');
    setPhone('');
    setShowAdd(false);
  };

  return (
    <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Clients</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(28,28,25,0.45)' }}>
              {data?.total ?? 0} total clients
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-5 py-2.5 min-h-0">
            <Plus size={16} /> Add client
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 glass-panel px-4 py-3 mb-6 shadow-glass-sm"
          style={{ borderRadius: '100px', maxWidth: '360px' }}>
          <Search size={16} style={{ color: 'rgba(28,28,25,0.4)' }} />
          <input type="text" placeholder="Search clients…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: '#1c1c19' }} />
        </div>

        {/* Add client modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(28,28,25,0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-panel p-6 w-full max-w-sm shadow-glass-xl">
              <h2 className="text-lg font-bold text-on-surface mb-4">Add new client</h2>
              <div className="space-y-3">
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(28,28,25,0.35)' }} />
                  <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
                    className="glass-input" style={{ paddingLeft: '36px' }} />
                </div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(28,28,25,0.35)' }} />
                  <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="glass-input" style={{ paddingLeft: '36px' }} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                <button onClick={handleAdd} disabled={createCustomer.isPending || !name.trim()}
                  className="btn-primary flex-1 justify-center text-sm">
                  {createCustomer.isPending ? (
                    <div className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  ) : 'Add client'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="glass-panel p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }} />
            </div>
          ) : (data?.items ?? []).length === 0 ? (
            <div className="text-center py-12" style={{ color: 'rgba(28,28,25,0.4)' }}>
              <p className="text-sm">No clients yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(217,194,182,0.3)' }}>
                  {['Name', 'Phone', 'Added'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold px-4 py-3"
                      style={{ color: 'rgba(28,28,25,0.45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(217,194,182,0.15)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(240,237,233,0.5)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(139,75,30,0.1)', color: '#8b4b1e' }}>
                          {(c.full_name ?? 'WI').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{c.full_name ?? 'Walk-in'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'rgba(28,28,25,0.6)' }}>
                      {c.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(28,28,25,0.4)' }} suppressHydrationWarning>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </div>
  );
}
