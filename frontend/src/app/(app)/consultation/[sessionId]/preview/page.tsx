'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Heart,
  CheckCircle,
  Download,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { useSession, useSessionHairstyles, useSelectHairstyle } from '@/lib/queries/sessions';

const ALL_FILTERS = ['All', 'Short', 'Medium', 'Long', 'Classic', 'Modern', 'Color', 'Trendy'];

function SkeletonCard() {
  return (
    <div className="rounded-[20px] overflow-hidden animate-pulse" style={{ aspectRatio: '3/4', background: 'rgba(240,237,233,0.8)' }}>
      <div className="w-full h-full flex items-center justify-center">
        <Sparkles size={24} style={{ color: 'rgba(139,75,30,0.2)' }} />
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: session } = useSession(sessionId);
  const { data: hairstyles, isLoading } = useSessionHairstyles(sessionId);
  const selectHairstyle = useSelectHairstyle(sessionId);

  const filtered = (hairstyles ?? []).filter((s) => {
    const tags = s.style_tags.map((t) => t.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      tags.some((t) => t.includes(activeFilter.toLowerCase())) ||
      s.style_name.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch = s.style_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      router.push(`/consultation/${sessionId}/selected`);
    } catch {
      // error handled by mutation
    }
  };

  const CARD_GRADIENTS = [
    'linear-gradient(160deg, rgba(255,219,200,0.6) 0%, rgba(240,237,233,0.8) 100%)',
    'linear-gradient(160deg, rgba(196,237,167,0.4) 0%, rgba(240,237,233,0.8) 100%)',
    'linear-gradient(160deg, rgba(158,240,240,0.4) 0%, rgba(240,237,233,0.8) 100%)',
    'linear-gradient(160deg, rgba(255,219,200,0.3) 0%, rgba(196,237,167,0.2) 100%)',
  ];

  return (
    <div className="min-h-screen font-inter" style={{ background: '#fcf9f4' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 px-6 py-4"
        style={{
          background: 'rgba(252,249,244,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(217,194,182,0.4)',
        }}
      >
        <div className="flex items-center gap-4 mb-4 max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(240,237,233,0.8)' }}
          >
            <ArrowLeft size={18} style={{ color: '#1c1c19' }} />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-on-surface">AI Hairstyle Previews</h1>
            {faceTags.length > 0 && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {faceTags.map((tag) => (
                  <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(139,75,30,0.08)', color: '#8b4b1e', border: '1px solid rgba(139,75,30,0.15)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{ background: 'rgba(252,249,244,0.7)', border: '1px solid rgba(217,194,182,0.5)', minWidth: '180px' }}>
            <Search size={15} style={{ color: 'rgba(28,28,25,0.4)' }} />
            <input
              type="text"
              placeholder="Search styles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm bg-transparent outline-none"
              style={{ color: '#1c1c19', width: '120px' }}
            />
          </div>

          <button className="w-10 h-10 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(240,237,233,0.8)' }}>
            <SlidersHorizontal size={18} style={{ color: '#1c1c19' }} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-7xl mx-auto" style={{ scrollbarWidth: 'none' }}>
          {ALL_FILTERS.map((chip) => (
            <button key={chip} onClick={() => setActiveFilter(chip)}
              className={`chip flex-shrink-0 ${activeFilter === chip ? 'active' : ''}`}>
              {chip}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: 'rgba(28,28,25,0.5)' }}>
            {isLoading ? 'Loading…' : `${filtered.length} styles · AI-generated previews`}
          </p>
          {selectedId && (
            <button onClick={() => setSelectedId(null)} className="text-sm flex items-center gap-1.5"
              style={{ color: '#8b4b1e' }}>
              <X size={14} /> Clear selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((style, idx) => {
                const isSelected = selectedId === style.id;
                const isFav = favourites.has(style.id);
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedId(isSelected ? null : style.id)}
                    className="relative cursor-pointer group transition-all duration-200"
                    style={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: isSelected
                        ? '0 0 0 3px #8b4b1e, 0 8px 32px rgba(0,0,0,0.1)'
                        : '0 4px 16px rgba(0,0,0,0.06)',
                      transform: isSelected ? 'scale(0.98)' : undefined,
                    }}
                  >
                    {/* Image */}
                    <div className="relative" style={{ aspectRatio: '3/4', background: CARD_GRADIENTS[idx % 4] }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={style.preview_url}
                        alt={style.style_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Favourite */}
                      <button onClick={(e) => toggleFavourite(style.id, e)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(252,249,244,0.8)', backdropFilter: 'blur(8px)' }}>
                        <Heart size={15} fill={isFav ? '#8b4b1e' : 'none'}
                          style={{ color: isFav ? '#8b4b1e' : 'rgba(28,28,25,0.5)' }} />
                      </button>

                      {/* Selected check overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: 'rgba(139,75,30,0.15)' }}>
                          <CheckCircle size={40} style={{ color: '#8b4b1e' }} />
                        </div>
                      )}

                      {/* Bottom name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3"
                        style={{ background: 'linear-gradient(to top, rgba(252,249,244,0.95) 0%, transparent 100%)' }}>
                        <div className="text-sm font-bold text-on-surface">{style.style_name}</div>
                        {style.style_tags.length > 0 && (
                          <div className="text-xs mt-0.5 capitalize" style={{ color: 'rgba(28,28,25,0.5)' }}>
                            {style.style_tags.slice(0, 2).join(' · ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Floating action bar */}
      {selectedId && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 shadow-glass-xl animate-slide-up"
          style={{
            background: 'rgba(252,249,244,0.9)',
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
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(240,237,233,0.8)' }}>
              <Share2 size={16} style={{ color: 'rgba(28,28,25,0.6)' }} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(240,237,233,0.8)' }}>
              <Download size={16} style={{ color: 'rgba(28,28,25,0.6)' }} />
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectHairstyle.isPending}
              className="btn-primary text-sm px-6 py-2.5 min-h-0"
            >
              {selectHairstyle.isPending ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              ) : (
                <>
                  <CheckCircle size={16} /> Confirm style
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
