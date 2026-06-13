import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CreditCard, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';

export const MembershipCard: React.FC = () => {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  
  if (!user || !user.memberId) return null;

  const handleDownload = async () => {
    if (!exportRef.current) return;
    
    try {
      const dataUrl = await toPng(exportRef.current as HTMLElement, {
        pixelRatio: 3,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `membership-card-${user.memberId}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download card", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto">
      {/* 3D Flip Card Container */}
      <div 
        className="relative w-full aspect-[1.586/1] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          ref={cardRef}
        >
          {/* Card Front */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-primary via-primary-dark to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-6 flex flex-col justify-between text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-secondary" />
                  Odiyooru Souharda
                </h3>
                <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Cooperative Society Ltd.</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Shareholder / Member ID</p>
                  <p className="font-mono text-xl tracking-widest font-bold text-secondary-light">
                    {user.memberId}
                  </p>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Member Name</p>
                    <p className="font-bold text-lg uppercase tracking-wide">{user.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Valid From</p>
                    <p className="font-bold text-sm">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div 
            className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-0 flex flex-col text-slate-800"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* Magnetic strip mock */}
            <div className="w-full h-12 bg-slate-800 mt-6"></div>
            
            <div className="p-5 flex flex-col h-full justify-between">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Blood Group</p>
                    <p className="text-sm font-bold text-rose-600">{user.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Date of Birth</p>
                    <p className="text-sm font-bold text-slate-700">{user.dob || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Address</p>
                  <p className="text-xs text-slate-700 font-medium leading-tight mt-0.5 line-clamp-2">
                    {user.address || 'Address not provided'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-primary">Odiyooru Souharda Cooperative Society</p>
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Odiyoor, Karnataka</p>
                <div className="flex items-center gap-3">
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 824 2441234</p>
                  <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> support@odiyoorubank.in</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Card
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm shadow-sm border border-slate-200 transition-colors"
        >
          Flip Card
        </button>
      </div>
      <p className="text-xs text-slate-500 text-center font-medium">
        This is a digitally generated card. You can download and print it.
      </p>

      {/* Hidden Export Container */}
      <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
        <div ref={exportRef} className="flex flex-col gap-6 p-6 bg-slate-50" style={{ width: '500px' }}>
          
          <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-primary via-primary-dark to-slate-900 rounded-2xl overflow-hidden border border-white/20 p-6 flex flex-col justify-between text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-secondary" />
                  Odiyooru Souharda
                </h3>
                <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Cooperative Society Ltd.</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Shareholder / Member ID</p>
                  <p className="font-mono text-xl tracking-widest font-bold text-secondary-light">
                    {user.memberId}
                  </p>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Member Name</p>
                    <p className="font-bold text-lg uppercase tracking-wide">{user.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Valid From</p>
                    <p className="font-bold text-sm">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full aspect-[1.586/1] bg-white rounded-2xl overflow-hidden border border-slate-200 p-0 flex flex-col text-slate-800 relative">
            <div className="w-full h-12 bg-slate-800 mt-6"></div>
            
            <div className="p-5 flex flex-col h-full justify-between">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Blood Group</p>
                    <p className="text-sm font-bold text-rose-600">{user.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Date of Birth</p>
                    <p className="text-sm font-bold text-slate-700">{user.dob || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Address</p>
                  <p className="text-xs text-slate-700 font-medium leading-tight mt-0.5 line-clamp-2">
                    {user.address || 'Address not provided'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-primary">Odiyooru Souharda Cooperative Society</p>
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Odiyoor, Karnataka</p>
                <div className="flex items-center gap-3">
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 824 2441234</p>
                  <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> support@odiyoorubank.in</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
