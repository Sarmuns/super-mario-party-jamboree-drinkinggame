import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setScanning(false);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }

  function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height);

    if (result?.data) {
      // Extrai o código da sala da URL: /sala/CODE/...
      const match = result.data.match(/\/sala\/([A-Z]{4})\//);
      if (match) {
        stopCamera();
        setScanning(false);
        onDetected(match[1]);
        return;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/90" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-bold text-white">Escanear QR Code</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 text-lg">×</button>
          </div>

          {/* Camera */}
          <div className="relative bg-black aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 relative">
                  {/* Corners */}
                  {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-white ${pos}`}
                      style={{
                        borderTopWidth: i < 2 ? 3 : 0,
                        borderBottomWidth: i >= 2 ? 3 : 0,
                        borderLeftWidth: i % 2 === 0 ? 3 : 0,
                        borderRightWidth: i % 2 === 1 ? 3 : 0,
                        borderRadius: '2px',
                      }} />
                  ))}
                  {/* Scan line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-green-400 opacity-80 animate-bounce" style={{ top: '50%' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 text-center text-xs text-gray-500">
            Aponte para o QR Code da sala
          </div>
        </div>
      </div>
    </>
  );
}
