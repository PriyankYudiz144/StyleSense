'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Brain, Sparkles, CheckCircle } from 'lucide-react';
import { useSession, useAnalyzeFace, useGenerateHairstyles } from '@/lib/queries/sessions';

const STEPS = [
  { label: 'Analyzing face shape', icon: Brain, duration: 4000 },
  { label: 'Detecting hair texture & color', icon: Sparkles, duration: 3000 },
  { label: 'Generating 12 AI hairstyle previews', icon: Sparkles, duration: 25000 },
];

export default function AnalyzingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const ran = useRef(false);

  const { data: session } = useSession(sessionId);
  const analyzeFace = useAnalyzeFace(sessionId);
  const generateHairstyles = useGenerateHairstyles(sessionId);

  useEffect(() => {
    if (ran.current || !session) return;
    ran.current = true;

    const run = async () => {
      try {
        setCurrentStep(0);
        await analyzeFace.mutateAsync();
        setCurrentStep(1);
        await new Promise((r) => setTimeout(r, 1000));
        setCurrentStep(2);
        await generateHairstyles.mutateAsync();
        setDone(true);
        await new Promise((r) => setTimeout(r, 800));
        router.push(`/consultation/${sessionId}/preview`);
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setError(msg ?? 'AI generation failed. Please try again.');
      }
    };

    run();
  }, [session, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-inter"
      style={{
        background: `
          radial-gradient(ellipse at 30% 30%, rgba(255,219,200,0.4) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 70%, rgba(196,237,167,0.15) 0%, transparent 50%),
          #fcf9f4
        `,
      }}
    >
      <div className="glass-panel p-10 w-full max-w-md text-center shadow-glass-xl">
        {!done && !error ? (
          <>
            {/* Animated spinner */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div
                className="absolute inset-0 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(139,75,30,0.15)', borderTopColor: '#8b4b1e' }}
              />
              <div className="absolute inset-3 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(139,75,30,0.08)' }}>
                <Sparkles size={24} style={{ color: '#8b4b1e' }} className="animate-pulse" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-on-surface mb-2">
              {STEPS[Math.min(currentStep, STEPS.length - 1)].label}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.5)' }}>
              {currentStep < 2 ? 'Using AI to analyze your photo…' : 'Generating personalized previews with DALL-E 3…'}
            </p>

            {/* Step list */}
            <div className="space-y-3 text-left">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                  style={i === currentStep ? { background: 'rgba(139,75,30,0.08)' } : {}}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={
                      i < currentStep
                        ? { background: 'rgba(68,100,53,0.15)', color: '#446435' }
                        : i === currentStep
                        ? { background: 'rgba(139,75,30,0.15)', color: '#8b4b1e' }
                        : { background: 'rgba(240,237,233,0.9)', color: 'rgba(28,28,25,0.3)' }
                    }>
                    {i < currentStep ? (
                      <CheckCircle size={14} />
                    ) : (
                      <s.icon size={13} />
                    )}
                  </div>
                  <span className="text-sm"
                    style={{
                      fontWeight: i === currentStep ? 600 : 400,
                      color: i < currentStep ? '#446435' : i === currentStep ? '#1c1c19' : 'rgba(28,28,25,0.4)',
                    }}>
                    {s.label}
                  </span>
                  {i === currentStep && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs mt-6" style={{ color: 'rgba(28,28,25,0.35)' }}>
              This may take up to 30 seconds
            </p>
          </>
        ) : done ? (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(68,100,53,0.12)' }}>
              <CheckCircle size={36} style={{ color: '#446435' }} />
            </div>
            <h2 className="text-xl font-bold text-on-surface">Previews ready!</h2>
            <p className="text-sm mt-2" style={{ color: 'rgba(28,28,25,0.5)' }}>Redirecting to your hairstyle options…</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(186,26,26,0.08)' }}>
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Generation failed</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(28,28,25,0.5)' }}>{error}</p>
            <button
              onClick={() => { setError(''); ran.current = false; }}
              className="btn-primary mx-auto"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
