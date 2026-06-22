import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, Landmark } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface IdCardProps {
  user: {
    fullName: string;
    customerId: string;
    phone: string;
    dob: string;
    profileImageBase64?: string;
  };
  membership: {
    memberId: string;
    issuedDate: string;
  };
}

export const IdCard: React.FC<IdCardProps> = ({ user, membership }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1.0 });
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
    <div className="flex flex-col items-center space-y-4">
      {/* The actual Card UI */}
      <div 
        ref={cardRef}
        className="relative w-[380px] h-[240px] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#fdfdfd] to-[#e8ebef] border border-gray-300 flex flex-col text-gray-900 font-sans"
      >
        {/* Header */}
        <div className="flex bg-[#EAF2FA] w-full items-center justify-between px-4 py-2 border-b-2 border-[#0A315C]">
          <div className="flex flex-col items-center w-12">
            <img src="/logo-bg.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <div className="flex-1 text-center flex flex-col justify-center px-2">
            <h3 className="text-[13px] font-black text-[#0A315C] uppercase leading-tight tracking-wide">
              Odiyooru Souharda Sahakari
            </h3>
            <p className="text-[8px] font-bold text-[#0A315C] uppercase tracking-widest mt-0.5">
              Cooperative Society Ltd
            </p>
          </div>
          <div className="flex flex-col items-center w-12">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="text-[6px] font-bold uppercase tracking-widest text-emerald-700 mt-0.5">Verified</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 p-4 relative z-10">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
            <img src="/logo-bg.png" alt="Watermark Logo" className="w-48 h-48 object-contain grayscale" />
          </div>

          {/* Left Side Info */}
          <div className="flex flex-col flex-1 z-10 space-y-2">
            <div>
              <p className="text-[8px] text-gray-500 uppercase tracking-wide font-bold leading-tight mb-0.5">Cardholder Name</p>
              <p className="text-sm font-black text-gray-900 uppercase tracking-wide leading-tight">{user.fullName}</p>
            </div>
            
            <div>
              <p className="text-[8px] text-gray-500 uppercase tracking-wide font-bold leading-tight mb-0.5">Customer ID</p>
              <p className="text-sm font-black text-gray-900 uppercase tracking-wide leading-tight">{user.customerId}</p>
            </div>

            <div>
              <p className="text-[8px] text-gray-500 uppercase tracking-wide font-bold leading-tight mb-0.5">Date of Birth</p>
              <p className="text-sm font-black text-gray-900 leading-tight">{user.dob || 'N/A'}</p>
            </div>

            <div className="pt-1.5 mt-auto border-t border-gray-300">
              <p className="text-[8px] text-gray-500 uppercase tracking-wide font-bold mb-0.5">Shareholder ID / Member No.</p>
              <p className="text-lg font-black text-gray-900 uppercase tracking-widest font-mono leading-tight">
                {membership.memberId || 'N/A'}
              </p>
            </div>
          </div>

          {/* Right Side Photo & Signature */}
          <div className="w-[90px] ml-4 flex flex-col items-center z-10 shrink-0">
            <div className="w-[75px] h-[95px] bg-white border-2 border-gray-400 shadow-sm overflow-hidden flex items-center justify-center">
              <img 
                src={user.profileImageBase64 || `https://i.pravatar.cc/150?u=${user.customerId}`} 
                alt="Photo" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 w-[85px] h-[35px] bg-white border border-gray-300 flex items-center justify-center overflow-hidden">
              <span className="text-[14px] text-gray-800" style={{ fontFamily: "'Brush Script MT', cursive, 'Dancing Script', sans-serif" }}>
                {user.fullName.split(' ')[0]}
              </span>
            </div>
            <p className="text-[7px] text-gray-600 uppercase tracking-wider mt-1 font-bold">Signature</p>
          </div>
        </div>
      </div>

      <button 
        onClick={downloadImage}
        className="flex items-center space-x-2 text-xs font-bold text-[#0A315C] hover:text-[#ED7F1E] transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Download Digital Card</span>
      </button>
    </div>
  );
};
