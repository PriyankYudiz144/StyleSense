'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Brain, Sparkles, CheckCircle } from 'lucide-react';
import { useSession, useAnalyzeFace, useGenerateHairstyles, useSessionHairstyles } from '@/lib/queries/sessions';

const TOTAL = 3;

function SkeletonSlot() {
  return (
    <div
      className="w-full h-full rounded-3xl overflow-hidden animate-pulse flex items-center justify-center"
      style={{ background: 'rgba(240,237,233,0.8)' }}
    >
      <Sparkles size={32} style={{ color: 'rgba(139,75,30,0.2)' }} />
    </div>
  );
}

export default function AnalyzingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gender = (searchParams.get('gender') ?? 'female') as 'male' | 'female';

  const [step, setStep] = useState<'analyzing' | 'generating' | 'done'>('analyzing');
  const [error, setError] = useState('');
  const ran = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: session } = useSession(sessionId);
  const analyzeFace = useAnalyzeFace(sessionId);
  const generateHairstyles = useGenerateHairstyles(sessionId);
  const { data: hairstyles = [], refetch: refetchHairstyles } = useSessionHairstyles(sessionId);

  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const result = await refetchHairstyles();
      const count = result.data?.length ?? 0;
      if (count >= TOTAL) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setStep('done');
        setTimeout(() => router.push(`/consultation/${sessionId}/preview`), 800);
      }
    }, 2500);
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (ran.current || !session) return;
    ran.current = true;
    const run = async () => {
      try {
        setStep('analyzing');
        await analyzeFace.mutateAsync();
        await generateHairstyles.mutateAsync(gender);
        setStep('generating');
        startPolling();
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setError(msg ?? 'AI generation failed. Please try again.');
      }
    };
    run();
  }, [session, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loaded = hairstyles.length;
  const skeletons = Math.max(0, TOTAL - loaded);

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-inter" style={{ background: '#fcf9f4' }}>
        <div className="glass-panel p-10 max-w-sm w-full text-center">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-on-surface mt-4 mb-2">Generation failed</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(28,28,25,0.5)' }}>{error}</p>
          <button onClick={() => { setError(''); ran.current = false; }} className="btn-primary mx-auto">
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Done state ────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-inter" style={{ background: '#fcf9f4' }}>
        <div className="glass-panel p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(68,100,53,0.12)' }}>
            <CheckCircle size={36} style={{ color: '#446435' }} />
          </div>
          <h2 className="text-xl font-bold text-on-surface">All previews ready!</h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(28,28,25,0.5)' }}>Redirecting…</p>
        </div>
      </div>
    );
  }

  // ── Analyzing state ───────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-inter" style={{ background: '#fcf9f4' }}>
        <div className="glass-panel p-10 max-w-sm w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{ borderColor: 'rgba(139,75,30,0.15)', borderTopColor: '#8b4b1e' }} />
            <div className="absolute inset-2 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(139,75,30,0.08)' }}>
              <Brain size={22} style={{ color: '#8b4b1e' }} />
            </div>
          </div>
          <h2 className="text-lg font-bold text-on-surface">Analyzing your photo…</h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(28,28,25,0.5)' }}>Detecting face shape & hair texture</p>
        </div>
      </div>
    );
  }

  // ── Generating state — full screen cards ─────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col font-inter"
      style={{
        background: `
          radial-gradient(ellipse at 20% 10%, rgba(255,219,200,0.35) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 90%, rgba(196,237,167,0.15) 0%, transparent 50%),
          #fcf9f4
        `,
      }}
    >
      {/* Top bar */}
      <div className="px-8 pt-8 pb-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: '#8b4b1e' }} className="animate-pulse" />
          <h2 className="text-lg font-bold text-on-surface">Generating hairstyles…</h2>
        </div>
        <p className="text-sm" style={{ color: 'rgba(28,28,25,0.5)' }}>{loaded} of {TOTAL} ready</p>
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(217,194,182,0.4)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(loaded / TOTAL) * 100}%`, background: '#8b4b1e' }}
          />
        </div>
      </div>

      {/* Full-height card grid */}
      <div className="flex-1 grid grid-cols-3 gap-4 px-8 pb-8" style={{ minHeight: 0 }}>
        {hairstyles.map((h) => (
          <div key={h.id} className="flex flex-col gap-2 min-h-0">
            <div className="flex-1 rounded-3xl overflow-hidden shadow-glass-md" style={{ minHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.preview_url} alt={h.style_name} className="w-full h-full object-cover animate-fade-in" />
            </div>
            <p className="text-sm font-semibold text-center text-on-surface pb-1">{h.style_name}</p>
          </div>
        ))}
        {Array.from({ length: skeletons }).map((_, i) => (
          <div key={`sk-${i}`} className="flex flex-col gap-2 min-h-0">
            <div className="flex-1 min-h-0">
              <SkeletonSlot />
            </div>
            <div className="h-4 rounded-full mx-auto w-24 animate-pulse mb-1"
              style={{ background: 'rgba(217,194,182,0.4)' }} />
          </div>
        ))}
      </div>

      <p className="text-xs text-center pb-6" style={{ color: 'rgba(28,28,25,0.35)' }}>
        Each image takes ~20–30s
      </p>
    </div>
  );
}
