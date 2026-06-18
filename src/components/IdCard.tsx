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
        className="relative w-[350px] h-[220px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0A315C] via-[#0D407A] to-[#0A315C] border border-white/20 p-5 text-white flex flex-col justify-between"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#ED7F1E] rounded-full blur-[80px] opacity-30" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-400 rounded-full blur-[80px] opacity-20" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-[#ED7F1E]" />
            <div>
              <h4 className="font-black tracking-wider text-[10px] leading-tight uppercase">Odiyooru</h4>
              <p className="text-[7px] text-blue-200 tracking-widest uppercase">Souharda Sahakari</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Verified Member</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-blue-200 font-semibold tracking-wider uppercase mb-0.5">Cardholder Name</p>
              <p className="text-lg font-bold tracking-wide uppercase">{user.fullName}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
               <p className="text-[8px] text-blue-200 tracking-wider uppercase mb-0.5">Customer ID</p>
               <p className="text-sm font-mono font-bold tracking-widest bg-black/20 px-2 py-1 rounded inline-block">
                 {user.customerId}
               </p>
            </div>
            {membership.memberId && (
              <div className="text-right">
                <p className="text-[8px] text-blue-200 tracking-wider uppercase mb-0.5">Shareholder ID</p>
                <p className="text-xs font-mono font-bold">{membership.memberId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center border-t border-white/10 pt-3 mt-1">
          <div className="text-[8px] text-blue-200">
            DOB: <span className="text-white font-medium">{user.dob || 'N/A'}</span>
          </div>
          <div className="text-[8px] text-blue-200 text-right">
            Issued: <span className="text-white font-medium">{new Date(membership.issuedDate || Date.now()).toLocaleDateString()}</span>
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
