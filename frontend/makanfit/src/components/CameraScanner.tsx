
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface CameraScannerProps {
  category: string;
  currentCalories: number;
  targetCalories: number;
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ 
  category, 
  currentCalories, 
  targetCalories, 
  onCapture, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        onCapture(base64);
      }
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calProgress = Math.min((currentCalories / targetCalories) * 100, 100);

  // Dynamic icon based on category for that custom look
  const getCategoryEmoji = () => {
    switch(category.toLowerCase()) {
      case 'breakfast': return '🥐';
      case 'lunch': return '🍱';
      case 'dinner': return '🍲';
      default: return '🍎';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col">
      {/* Live Camera View */}
      {/* <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-gray-900/80">
            <p className="text-white font-bold">{error}</p>
          </div>
        )}
      </div> */}

      {/* Top Overlay Controls */}
      <div className="relative top-0 left-0 right-0 z-50 bg-[#E6F4F1] backdrop-blur-md px-6 pt-5 pb-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Meal Icon with Badge */}
          <div className="relative">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-3xl shadow-sm">
              {getCategoryEmoji()}
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#2D3E50] rounded-full flex items-center justify-center border-4 border-[#E6F4F1]">
              <span className="text-white text-[10px] font-black">1</span>
            </div>
          </div>

          {/* Meal Info */}
          <div className="flex flex-col">
            <h2 className="text-[#1A2A33] text-2xl font-black leading-tight tracking-tight">
              {category}
            </h2>
            <div className="flex flex-col mt-0.5">
              <span className="flex flex-col text-[#2D3E50]/60 text-[11px] font-black uppercase leading-tight tracking-widest">
                {currentCalories} / {targetCalories} Cal
              </span>
              <div className="w-28 h-2.5 bg-gray-200/50 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${calProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button 
          onClick={onClose}
          className="bg-[#1A2A33] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg"
        >
          Done
        </button>
      </div>

      {/* Centered Guide - Camera View */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-8 space-y-4">
            <p className="text-white/60 font-medium">{error}</p>
            <button onClick={startCamera} className="bg-sky-500 text-white px-6 py-2 rounded-full font-bold">Retry</button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Frame Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-start justify-center p-6">
            <div className="w-full aspect-square border-2 border-white/30 rounded-[40px] relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />

                {/* Text Overlay - Inside Frame */}
                <div className="px-6 py-3 bg-black/50 backdrop-blur-md border border-white/20 rounded-xl pointer-events-none">
                    <p className="text-white text-xs font-bold tracking-tight">
                    Take a photo to detect your meal
                    </p>
                </div>
            </div>
        </div>

        {/* Bottom Controls - ABSOLUTE OVERLAY ON CAMERA */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-around pb-8">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className="p-4 bg-white/10 rounded-full text-white group-active:scale-90 transition-transform">
              <ImageIcon size={24} />
            </div>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Gallery</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleGalleryClick} 
            />
          </button>

          <button 
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-[6px] border-white/20 active:scale-90 transition-transform"
          >
            <div className="w-full h-full rounded-full border-4 border-black/5 flex items-center justify-center">
              <Camera className="w-8 h-8 text-black" />
            </div>
          </button>

          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      {/* Hidden Elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default CameraScanner;
