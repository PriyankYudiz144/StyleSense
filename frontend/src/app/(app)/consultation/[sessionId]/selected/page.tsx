'use client';

import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Camera, ArrowRight, Scissors } from 'lucide-react';
import { useSession } from '@/lib/queries/sessions';

export default function SelectedPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useSession(sessionId);

  const selectedStyle = session?.hairstyles?.find((h) => h.id === session.selected_hairstyle_id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fcf9f4' }}>
        <div className="w-10 h-10 border-3 rounded-full animate-spin"
          style={{ border: '3px solid rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-inter"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(255,219,200,0.5) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 90%, rgba(196,237,167,0.2) 0%, transparent 50%),
          #fcf9f4
        `,
      }}
    >
      <div className="glass-panel w-full max-w-lg p-8 shadow-glass-xl text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(68,100,53,0.12)' }}>
          <CheckCircle size={36} style={{ color: '#446435' }} />
        </div>

        <h1 className="text-2xl font-bold text-on-surface mb-2">Style selected!</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(28,28,25,0.55)' }}>
          Ready to cut. Show this screen to your client as reference.
        </p>

        {/* Selected style preview */}
        {selectedStyle && (
          <div className="liquid-card p-4 mb-8">
            <div className="rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '3/4', maxHeight: '320px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedStyle.preview_url}
                alt={selectedStyle.style_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-lg font-bold text-on-surface">{selectedStyle.style_name}</div>
            {selectedStyle.style_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {selectedStyle.style_tags.map((tag) => (
                  <span key={tag} className="chip text-xs px-2.5 py-1 capitalize">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Face analysis summary */}
        {session?.face_analysis && (
          <div className="rounded-2xl p-4 mb-6 text-left"
            style={{ background: 'rgba(139,75,30,0.06)', border: '1px solid rgba(139,75,30,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Scissors size={14} style={{ color: '#8b4b1e' }} />
              <span className="text-xs font-semibold" style={{ color: '#8b4b1e' }}>Face analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Face shape', session.face_analysis.face_shape],
                ['Hair texture', session.face_analysis.hair_texture],
                ['Hair color', session.face_analysis.hair_color],
                ['Hair length', session.face_analysis.hair_length],
              ].map(([label, value]) => (
                <div key={label}>
                  <span style={{ color: 'rgba(28,28,25,0.45)' }}>{label}: </span>
                  <span className="font-medium text-on-surface capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/consultation/${sessionId}/complete`)}
            className="btn-primary w-full justify-center"
          >
            <Camera size={18} />
            Add after-photo
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary w-full justify-center"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
