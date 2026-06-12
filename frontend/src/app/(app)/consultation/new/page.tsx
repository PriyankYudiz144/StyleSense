'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  RotateCcw,
  ArrowRight,
  User,
  Phone,
  Scissors,
} from 'lucide-react';
import { useCreateSession, useValidatePhoto } from '@/lib/queries/sessions';
import { useCreateCustomer } from '@/lib/queries/customers';
import { uploadPhoto, dataUrlToFile } from '@/lib/upload';

type Step = 'capture' | 'customer' | 'uploading';

export default function NewConsultationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>('capture');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');

  const createSession = useCreateSession();
  const createCustomer = useCreateCustomer();
  const validatePhoto = useValidatePhoto();
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setError('Camera access denied. Use file upload instead.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    if (!v.videoWidth || !v.videoHeight || v.readyState < 2) {
      setError('Camera not ready yet. Wait a moment and try again.');
      return;
    }
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setCapturedImage(null);
    setError('');
  };

  const proceed = async () => {
    if (!capturedImage) return;
    setValidating(true);
    setError('');
    try {
      const result = await validatePhoto.mutateAsync(capturedImage);
      if (!result.valid) {
        setError(result.reason || 'No clear face detected. Make sure face is well-lit and fully visible, then retake.');
        setValidating(false);
        return;
      }
    } catch {
      // validation API failed — allow proceeding
    }
    setValidating(false);
    setStep('customer');
  };

  const startConsultation = useCallback(async () => {
    if (!capturedImage) return;
    setStep('uploading');
    setError('');
    try {
      // Upload photo
      setUploadProgress(20);
      const file = dataUrlToFile(capturedImage);
      const photoUrl = await uploadPhoto(file);
      setUploadProgress(60);

      // Optionally create customer record
      let customerId: string | undefined;
      if (customerName.trim()) {
        const customer = await createCustomer.mutateAsync({
          full_name: customerName.trim(),
          phone: customerPhone.trim() || undefined,
        });
        customerId = customer.id;
      }
      setUploadProgress(80);

      const session = await createSession.mutateAsync({
        original_photo_url: photoUrl,
        customer_id: customerId,
      });
      setUploadProgress(100);

      router.push(`/consultation/${session.id}/analyzing?gender=${gender}`);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to start consultation. Please try again.';
      setError(msg);
      setStep('customer');
    }
  }, [capturedImage, customerName, customerPhone, createSession, createCustomer, router]);

  return (
    <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,75,30,0.12)' }}>
              <Scissors size={20} style={{ color: '#8b4b1e' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">New Consultation</h1>
              <p className="text-sm" style={{ color: 'rgba(28,28,25,0.5)' }}>Capture a photo to generate AI hairstyle previews</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {['Photo', 'Client', 'Uploading'].map((label, i) => {
              const stepIdx = step === 'capture' ? 0 : step === 'customer' ? 1 : 2;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={
                      i <= stepIdx
                        ? { background: '#8b4b1e', color: '#fff' }
                        : { background: 'rgba(240,237,233,0.9)', color: 'rgba(28,28,25,0.4)' }
                    }
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium" style={{ color: i <= stepIdx ? '#8b4b1e' : 'rgba(28,28,25,0.4)' }}>
                    {label}
                  </span>
                  {i < 2 && <div className="w-8 h-px mx-1" style={{ background: 'rgba(217,194,182,0.5)' }} />}
                </div>
              );
            })}
          </div>

          {/* Photo capture step */}
          {step === 'capture' && (
            <div className="glass-panel p-6 space-y-5">
              {!capturedImage ? (
                <>
                  {/* Camera view */}
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(240,237,233,0.8)',
                      aspectRatio: '4/3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      style={{ display: cameraActive ? 'block' : 'none' }}
                    />
                    {!cameraActive && (
                      <div className="flex flex-col items-center gap-3 text-center p-8">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,75,30,0.1)' }}>
                          <Camera size={32} style={{ color: '#8b4b1e' }} />
                        </div>
                        <p className="text-sm font-medium text-on-surface">Camera not started</p>
                        <p className="text-xs" style={{ color: 'rgba(28,28,25,0.45)' }}>Click below to open camera or upload a photo</p>
                      </div>
                    )}
                    {/* Face guide overlay */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div
                          className="w-48 h-60 rounded-full border-2 border-dashed opacity-50"
                          style={{ borderColor: '#8b4b1e' }}
                        />
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />

                  {error && (
                    <div className="rounded-2xl p-3 text-sm" style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!cameraActive ? (
                      <button onClick={startCamera} className="btn-primary flex-1 justify-center">
                        <Camera size={18} />
                        Open Camera
                      </button>
                    ) : (
                      <button onClick={capturePhoto} className="btn-primary flex-1 justify-center">
                        <Camera size={18} />
                        Capture Photo
                      </button>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary flex-1 justify-center"
                    >
                      <Upload size={18} />
                      Upload Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 right-3">
                      <button onClick={retake} className="btn-secondary text-sm px-4 py-2 min-h-0" style={{ borderRadius: '100px' }}>
                        <RotateCcw size={15} />
                        Retake
                      </button>
                    </div>
                  </div>
                  <button onClick={proceed} disabled={validating} className="btn-primary w-full justify-center">
                    {validating ? (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                        Validating photo…
                      </>
                    ) : (
                      <>Continue <ArrowRight size={18} /></>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Customer info step */}
          {step === 'customer' && (
            <div className="glass-panel p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,75,30,0.1)' }}>
                  <User size={16} style={{ color: '#8b4b1e' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Client info (optional)</p>
                  <p className="text-xs" style={{ color: 'rgba(28,28,25,0.45)' }}>Skip to continue as walk-in</p>
                </div>
              </div>

              {/* Gender selector */}
              <div className="flex gap-3">
                {(['female', 'male'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all capitalize"
                    style={
                      gender === g
                        ? { background: '#8b4b1e', color: '#fff', border: '1.5px solid #8b4b1e' }
                        : { background: 'transparent', color: 'rgba(28,28,25,0.6)', border: '1.5px solid rgba(217,194,182,0.5)' }
                    }
                  >
                    {g === 'female' ? '♀ Female' : '♂ Male'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(28,28,25,0.35)' }} />
                  <input
                    type="text"
                    placeholder="Client name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(28,28,25,0.35)' }} />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl p-3 text-sm" style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('capture')} className="btn-secondary flex-1 justify-center">
                  Back
                </button>
                <button onClick={startConsultation} className="btn-primary flex-1 justify-center">
                  Start Consultation
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Uploading step */}
          {step === 'uploading' && (
            <div className="glass-panel p-10 flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,75,30,0.1)' }}>
                <div
                  className="w-10 h-10 border-3 rounded-full animate-spin"
                  style={{ border: '3px solid rgba(139,75,30,0.2)', borderTopColor: '#8b4b1e' }}
                />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-on-surface">Setting up consultation…</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(28,28,25,0.5)' }}>Uploading photo and preparing AI analysis</p>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(240,237,233,0.9)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%`, background: '#8b4b1e' }}
                />
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
