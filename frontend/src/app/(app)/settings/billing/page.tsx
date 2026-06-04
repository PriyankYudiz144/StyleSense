import Link from 'next/link';
import { CreditCard, ArrowRight } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(139,75,30,0.12)' }}>
            <CreditCard size={20} style={{ color: '#8b4b1e' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Billing</h1>
            <p className="text-sm" style={{ color: 'rgba(28,28,25,0.45)' }}>Manage your plan and credits</p>
          </div>
        </div>

        <div className="glass-panel p-8 text-center shadow-glass">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(139,75,30,0.08)' }}>
            <CreditCard size={28} style={{ color: '#8b4b1e' }} />
          </div>
          <h2 className="text-lg font-bold text-on-surface mb-2">Billing portal coming soon</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(28,28,25,0.5)' }}>
            Automated billing is not yet available. Contact us to upgrade your plan or purchase more AI credits.
          </p>
          <a href="mailto:hello@stylesense.ai" className="btn-primary mx-auto inline-flex">
            Contact us <ArrowRight size={16} />
          </a>
          <div className="mt-6">
            <Link href="/pricing" className="text-sm hover:opacity-70" style={{ color: '#8b4b1e' }}>
              View pricing plans →
            </Link>
          </div>
        </div>
    </div>
  );
}
