import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface IdCardProps {
  user: {
    fullName: string;
    customerId: string;
    phone: string;
    dob: string;
    profileImageBase64?: string;
    address?: string;
  };
  membership: {
    memberId: string;
    issuedDate: string;
  };
}

export const IdCard: React.FC<IdCardProps> = ({ user, membership }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (exportRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(exportRef.current, { quality: 1.0, cacheBust: true, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `Odiyooru_Card_${user.customerId}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate image', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* 3D Flip Card Container */}
      <div 
        className="relative w-[380px] h-[240px] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          ref={cardRef}
        >
          {/* Front of the Card */}
          <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#005BAC] via-[#004C8C] to-[#0A315C] border border-blue-400/30 flex flex-col text-white font-sans">
            {/* Header */}
            <div className="flex bg-white/10 w-full items-center justify-between px-4 py-2 border-b border-white/20 backdrop-blur-sm">
              <div className="flex flex-col items-center w-12">
                <img src="/logo-bg.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
              </div>
              <div className="flex-1 text-center flex flex-col justify-center px-2">
                <h3 className="text-[13px] font-black uppercase leading-tight tracking-wide text-white drop-shadow-sm">
                  Odiyooru Souharda Sahakari
                </h3>
                <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-blue-100">
                  Cooperative Society Ltd
                </p>
              </div>
              <div className="flex flex-col items-center w-12">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="text-[6px] font-bold uppercase tracking-widest text-emerald-400 mt-0.5">Verified</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 p-4 relative z-10">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none mix-blend-overlay">
                <img src="/logo-bg.png" alt="Watermark Logo" className="w-48 h-48 object-contain grayscale" />
              </div>

              <div className="flex flex-col flex-1 z-10 space-y-2">
                <div>
                  <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold leading-tight mb-0.5">Cardholder Name</p>
                  <p className="text-sm font-black text-white uppercase tracking-wide leading-tight">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold leading-tight mb-0.5">Customer ID</p>
                  <p className="text-sm font-black text-white uppercase tracking-wide leading-tight">{user.customerId}</p>
                </div>
                <div>
                  <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold leading-tight mb-0.5">Date of Birth</p>
                  <p className="text-sm font-black text-white leading-tight">{user.dob || 'N/A'}</p>
                </div>
                <div className="pt-1.5 mt-auto border-t border-white/20">
                  <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold mb-0.5">Shareholder ID / Member No.</p>
                  <p className="text-lg font-black text-white uppercase tracking-widest font-mono leading-tight drop-shadow-sm">
                    {membership.memberId || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="w-[90px] ml-4 flex flex-col items-center z-10 shrink-0">
                <div className="w-[75px] h-[95px] bg-white border-2 border-white/50 shadow-md overflow-hidden flex items-center justify-center rounded-sm">
                  <img 
                    src={user.profileImageBase64 || `https://i.pravatar.cc/150?u=${user.customerId}`} 
                    alt="Photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Back of the Card */}
          <div 
            className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl bg-[#002a52] border border-blue-400/30 flex flex-col text-white font-sans"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* Magnetic strip mock */}
            <div className="w-full h-12 bg-slate-900 mt-6 shadow-inner"></div>
            
            <div className="p-5 flex flex-col h-full justify-between z-10">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider mb-1">Residential Address</p>
                  <p className="text-xs text-white font-medium leading-relaxed line-clamp-3">
                    {user.address || 'Address not provided'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/20 text-[10px] text-blue-200 space-y-1.5">
                <p className="font-bold text-white uppercase tracking-wide">Odiyooru Souharda Cooperative Society</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> Odiyoor Main Branch, Gurudevadatta Samsthanam, Odiyoor, Karnataka 574220</p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-400" /> +91 824 2441234</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-emerald-400" /> support@odiyoorubank.in</p>
                </div>
              </div>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <img src="/logo-bg.png" alt="" className="w-32 h-32 object-contain grayscale" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4 w-full max-w-[380px]">
        <button
          onClick={downloadImage}
          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Card
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-[#0A315C] rounded-xl font-bold text-sm shadow-md border border-slate-200 transition-colors flex items-center justify-center"
        >
          Flip Card
        </button>
      </div>
      <p className="text-xs text-slate-500 text-center font-medium">
        Click the card or "Flip Card" button to see the back.
      </p>

      {/* Hidden Export Container for clean downloads */}
      <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
        <div ref={exportRef} className="relative w-[380px] h-[240px] rounded-xl overflow-hidden shadow-none bg-gradient-to-br from-[#005BAC] via-[#004C8C] to-[#0A315C] border border-blue-400/30 flex flex-col text-white font-sans">
          {/* Header */}
          <div className="flex bg-white/10 w-full items-center justify-between px-4 py-2 border-b border-white/20 backdrop-blur-sm">
            <div className="flex flex-col items-center w-12">
              <img src="/logo-bg.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            </div>
            <div className="flex-1 text-center flex flex-col justify-center px-2">
              <h3 className="text-[13px] font-black uppercase leading-tight tracking-wide text-white drop-shadow-sm">
                Odiyooru Souharda Sahakari
              </h3>
              <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-blue-100">
                Cooperative Society Ltd
              </p>
            </div>
            <div className="flex flex-col items-center w-12">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span className="text-[6px] font-bold uppercase tracking-widest text-emerald-400 mt-0.5">Verified</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 p-4 relative z-10">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none mix-blend-overlay">
              <img src="/logo-bg.png" alt="Watermark Logo" className="w-48 h-48 object-contain grayscale" />
            </div>

            <div className="flex flex-col flex-1 z-10 space-y-2">
              <div>
                <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold leading-tight mb-0.5">Cardholder Name</p>
                <p className="text-sm font-black text-white uppercase tracking-wide leading-tight">{user.fullName}</p>
              </div>
              <div>
                <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold leading-tight mb-0.5">Customer ID</p>
                <p className="text-sm font-black text-white uppercase tracking-wide leading-tight">{user.customerId}</p>
              </div>
              <div>
                <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold leading-tight mb-0.5">Date of Birth</p>
                <p className="text-sm font-black text-white leading-tight">{user.dob || 'N/A'}</p>
              </div>
              <div className="pt-1.5 mt-auto border-t border-white/20">
                <p className="text-[8px] text-blue-200 uppercase tracking-wide font-bold mb-0.5">Shareholder ID / Member No.</p>
                <p className="text-lg font-black text-white uppercase tracking-widest font-mono leading-tight drop-shadow-sm">
                  {membership.memberId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="w-[90px] ml-4 flex flex-col items-center z-10 shrink-0">
              <div className="w-[75px] h-[95px] bg-white border-2 border-white/50 shadow-md overflow-hidden flex items-center justify-center rounded-sm">
                <img 
                  src={user.profileImageBase64 || `https://i.pravatar.cc/150?u=${user.customerId}`} 
                  alt="Photo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
