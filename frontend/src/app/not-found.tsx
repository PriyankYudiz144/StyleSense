import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-inter"
      style={{ background: '#fcf9f4' }}
    >
      <div className="glass-panel p-10 max-w-md w-full text-center shadow-glass-lg">
        <div className="text-6xl font-extrabold mb-4" style={{ color: 'rgba(139,75,30,0.2)' }}>404</div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Page not found</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(28,28,25,0.5)' }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard" className="btn-primary mx-auto inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
