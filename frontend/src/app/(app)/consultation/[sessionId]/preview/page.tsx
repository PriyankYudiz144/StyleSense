'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  CheckCircle,
  Sparkles,
  Scissors,
} from 'lucide-react';
import { useSession, useSessionHairstyles, useSelectHairstyle } from '@/lib/queries/sessions';

function SkeletonCard() {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden animate-pulse flex items-center justify-center"
      style={{ background: 'rgba(240,237,233,0.8)' }}>
      <Sparkles size={32} style={{ color: 'rgba(139,75,30,0.2)' }} />
    </div>
  );
}

export default function PreviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [likeAnim, setLikeAnim] = useState<string | null>(null);

  const { data: session } = useSession(sessionId);
  const { data: hairstyles, isLoading } = useSessionHairstyles(sessionId);
  const selectHairstyle = useSelectHairstyle(sessionId);

  const faceAnalysis = session?.face_analysis;
  const faceTags = faceAnalysis
    ? [
        faceAnalysis.face_shape && `${faceAnalysis.face_shape} face`,
        faceAnalysis.hair_texture && `${faceAnalysis.hair_texture} hair`,
        faceAnalysis.hair_color,
      ].filter(Boolean)
    : [];

  const toggleFavourite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeAnim(id);
    setTimeout(() => setLikeAnim(null), 400);
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    try {
      await selectHairstyle.mutateAsync(selectedId);
      router.push(`/consultation/${sessionId}/complete`);
    } catch { /* handled by mutation */ }
  };

  // ── Completed session ─────────────────────────────────────────────────────
  if (session?.status === 'completed') {
    const selectedStyle = session.hairstyles?.find((h) => h.id === session.selected_hairstyle_id);
    return (
      <div className="min-h-screen flex flex-col font-inter" style={{ background: '#fcf9f4' }}>
        <header className="sticky top-0 z-40 px-6 py-4 flex items-center gap-4 flex-shrink-0"
          style={{ background: 'rgba(252,249,244,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(217,194,182,0.4)' }}>
          <button onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(240,237,233,0.8)' }}>
            <ArrowLeft size={18} style={{ color: '#1c1c19' }} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-on-surface">Session complete</h1>
            <p className="text-sm" style={{ color: 'rgba(28,28,25,0.45)' }}>
              {session.final_result_photo_url ? 'Before & after comparison' : 'Completed session'}
            </p>
          </div>
        </header>

        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
          <div className={`grid gap-4 ${session.final_result_photo_url ? 'grid-cols-2' : 'grid-cols-1 max-w-xs mx-auto'}`}>
            <div>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(28,28,25,0.45)' }}>Before</p>
              <div className="rounded-2xl overflow-hidden shadow-glass" style={{ aspectRatio: '3/4' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={session.original_photo_url} alt="Before" className="w-full h-full object-cover" />
              </div>
            </div>
            {session.final_result_photo_url && (
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(28,28,25,0.45)' }}>After</p>
                <div className="rounded-2xl overflow-hidden shadow-glass" style={{ aspectRatio: '3/4' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={session.final_result_photo_url} alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          {selectedStyle && (
            <div className="glass-panel p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedStyle.preview_url} alt={selectedStyle.style_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(28,28,25,0.45)' }}>Selected style</p>
                <p className="text-base font-bold text-on-surface">{selectedStyle.style_name}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {selectedStyle.style_tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: 'rgba(139,75,30,0.08)', color: '#8b4b1e' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {session.face_analysis && (
            <div className="glass-panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Scissors size={14} style={{ color: '#8b4b1e' }} />
                <span className="text-xs font-semibold" style={{ color: '#8b4b1e' }}>Face analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['Face shape', session.face_analysis.face_shape], ['Hair texture', session.face_analysis.hair_texture],
                  ['Hair color', session.face_analysis.hair_color], ['Hair length', session.face_analysis.hair_length],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span style={{ color: 'rgba(28,28,25,0.45)' }}>{label}: </span>
                    <span className="font-medium text-on-surface capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <details className="glass-panel">
            <summary className="px-5 py-4 text-sm font-semibold cursor-pointer text-on-surface select-none">
              View all generated styles ({session.hairstyles?.length ?? 0})
            </summary>
            <div className="px-5 pb-5 grid grid-cols-3 gap-3">
              {(session.hairstyles ?? []).map((h) => (
                <div key={h.id}>
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.preview_url} alt={h.style_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs font-medium text-center py-1.5 text-on-surface">{h.style_name}</div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    );
  }

  // ── Active session — full-screen card layout ──────────────────────────────
  return (
    <div className="min-h-screen flex flex-col font-inter" style={{ background: '#fcf9f4' }}>

      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 flex items-center gap-4"
        style={{ background: 'rgba(252,249,244,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(217,194,182,0.4)' }}>
        <button onClick={() => router.push('/dashboard')}
          className="w-10 h-10 flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ background: 'rgba(240,237,233,0.8)' }}>
          <ArrowLeft size={18} style={{ color: '#1c1c19' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-on-surface">AI Hairstyle Previews</h1>
          {faceTags.length > 0 && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {faceTags.map((tag) => (
                <span key={tag} className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(139,75,30,0.08)', color: '#8b4b1e', border: '1px solid rgba(139,75,30,0.15)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm flex-shrink-0" style={{ color: 'rgba(28,28,25,0.45)' }}>
          Tap a style to select
        </p>
      </header>

      {/* Full-screen card grid */}
      <div className="flex-1 grid grid-cols-3 gap-4 px-6 py-5 pb-24" style={{ minHeight: 0 }}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 min-h-0">
                <div className="flex-1 min-h-0"><SkeletonCard /></div>
                <div className="h-4 rounded-full mx-auto w-24 animate-pulse" style={{ background: 'rgba(217,194,182,0.4)' }} />
              </div>
            ))
          : (hairstyles ?? []).map((style) => {
              const isSelected = selectedId === style.id;
              const isHovered = hoveredId === style.id;
              const isFav = favourites.has(style.id);
              return (
                <div
                  key={style.id}
                  className="flex flex-col gap-2 min-h-0 cursor-pointer"
                  onClick={() => setSelectedId(isSelected ? null : style.id)}
                  onMouseEnter={() => setHoveredId(style.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className="flex-1 relative overflow-hidden min-h-0"
                    style={{
                      borderRadius: '24px',
                      transform: isHovered ? 'scale(1.02)' : isSelected ? 'scale(0.98)' : 'scale(1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: isSelected
                        ? '0 0 0 3px #8b4b1e, 0 12px 40px rgba(0,0,0,0.15)'
                        : isHovered
                        ? '0 16px 48px rgba(0,0,0,0.14)'
                        : '0 4px 16px rgba(0,0,0,0.07)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={style.preview_url} alt={style.style_name}
                      className="w-full h-full object-cover" />

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 transition-opacity duration-200"
                      style={{ background: 'rgba(139,75,30,0.08)', opacity: isHovered && !isSelected ? 1 : 0 }}
                    />

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(139,75,30,0.18)' }}>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(252,249,244,0.9)', backdropFilter: 'blur(8px)' }}>
                          <CheckCircle size={28} style={{ color: '#8b4b1e' }} />
                        </div>
                      </div>
                    )}

                    {/* Favourite button */}
                    <button
                      onClick={(e) => toggleFavourite(style.id, e)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: isFav ? 'rgba(139,75,30,0.15)' : 'rgba(252,249,244,0.85)',
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s ease, transform 0.15s ease',
                        transform: likeAnim === style.id ? 'scale(1.4)' : isHovered ? 'scale(1.1)' : 'scale(1)',
                      }}>
                      <Heart
                        size={16}
                        fill={isFav ? '#8b4b1e' : 'none'}
                        style={{
                          color: isFav ? '#8b4b1e' : 'rgba(28,28,25,0.5)',
                          transition: 'transform 0.15s ease',
                          transform: likeAnim === style.id ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    </button>

                    {/* Bottom gradient name */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-4 pt-8 pb-3 transition-opacity duration-200"
                      style={{
                        background: 'linear-gradient(to top, rgba(28,28,25,0.55) 0%, transparent 100%)',
                        opacity: isHovered || isSelected ? 1 : 0,
                      }}
                    >
                      <p className="text-sm font-bold" style={{ color: '#fff' }}>{style.style_name}</p>
                      <p className="text-xs capitalize mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {style.style_tags.slice(0, 2).join(' · ')}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
      </div>

      {/* Floating confirm bar */}
      {selectedId && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 shadow-glass-xl animate-slide-up"
          style={{
            background: 'rgba(252,249,244,0.92)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRadius: '100px',
            border: '1px solid rgba(217,194,182,0.5)',
          }}
        >
          <div className="text-sm font-semibold text-on-surface">
            {hairstyles?.find((s) => s.id === selectedId)?.style_name}
          </div>
          <div className="w-px h-5" style={{ background: 'rgba(217,194,182,0.5)' }} />
          <button
            onClick={handleConfirm}
            disabled={selectHairstyle.isPending}
            className="btn-primary text-sm px-6 py-2.5 min-h-0"
          >
            {selectHairstyle.isPending ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : (
              <><CheckCircle size={16} /> Confirm style</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
