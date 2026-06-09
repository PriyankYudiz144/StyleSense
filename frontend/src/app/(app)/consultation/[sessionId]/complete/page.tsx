'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Camera, Upload, CheckCircle, RotateCcw, Star } from 'lucide-react';
import { useSession, useUploadFinalPhoto, useCompleteSession } from '@/lib/queries/sessions';
import { uploadPhoto, dataUrlToFile } from '@/lib/upload';

export default function CompletePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: session } = useSession(sessionId);
  const uploadFinal = useUploadFinalPhoto(sessionId);
  const completeSession = useCompleteSession(sessionId);

  const selectedStyle = session?.hairstyles?.find((h) => h.id === session.selected_hairstyle_id);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError('Camera access denied. Use file upload.');
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    setAfterPhoto(c.toDataURL('image/jpeg', 0.9));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAfterPhoto(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const finish = async (withPhoto = false) => {
    setSaving(true);
    setError('');
    try {
      if (withPhoto && afterPhoto) {
        let photoUrl = afterPhoto;
        try {
          const file = dataUrlToFile(afterPhoto);
          photoUrl = await uploadPhoto(file, 'after-photos');
        } catch {
          // fallback to data URL
        }
        await uploadFinal.mutateAsync(photoUrl);
      } else {
        await completeSession.mutateAsync({});
      }
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Failed to complete session.');
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-inter"
      style={{
        background: `
          radial-gradient(ellipse at 30% 30%, rgba(255,219,200,0.4) 0%, transparent 55%),
          #fcf9f4
        `,
      }}
    >
      <div className="glass-panel w-full max-w-lg p-8 shadow-glass-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(139,75,30,0.08)' }}>
            <Star size={28} style={{ color: '#8b4b1e' }} />
          </div>
          <h1 className="text-xl font-bold text-on-surface">Complete the session</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(28,28,25,0.5)' }}>
            Optionally capture an after-photo to compare results.
          </p>
        </div>

        {/* Before / After comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(28,28,25,0.45)' }}>Selected style</p>
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', background: 'rgba(240,237,233,0.8)' }}>
              {selectedStyle && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selectedStyle.preview_url} alt="Selected style" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(28,28,25,0.45)' }}>After photo</p>
            <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: '3/4', background: 'rgba(240,237,233,0.8)' }}>
              {cameraActive ? (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              ) : afterPhoto ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                  <button onClick={() => setAfterPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'rgba(252,249,244,0.9)' }}>
                    <RotateCcw size={12} style={{ color: '#8b4b1e' }} />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                  <Camera size={24} style={{ color: 'rgba(139,75,30,0.3)' }} />
                  <p className="text-xs text-center" style={{ color: 'rgba(28,28,25,0.4)' }}>After photo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <div className="rounded-2xl p-3 text-sm mb-4"
            style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>
            {error}
          </div>
        )}

        {!afterPhoto && (
          <div className="flex gap-3 mb-4">
            {!cameraActive ? (
              <button onClick={startCamera} className="btn-secondary flex-1 justify-center text-sm">
                <Camera size={16} /> Camera
              </button>
            ) : (
              <button onClick={capture} className="btn-primary flex-1 justify-center text-sm">
                <Camera size={16} /> Snap
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex-1 justify-center text-sm">
              <Upload size={16} /> Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {afterPhoto && (
            <button onClick={() => finish(true)} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : (
                <><CheckCircle size={16} /> Save with after-photo</>
              )}
            </button>
          )}
          <button onClick={() => finish(false)} disabled={saving} className="btn-secondary w-full justify-center">
            {saving && !afterPhoto ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }} />
            ) : (
              'Complete without after-photo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
