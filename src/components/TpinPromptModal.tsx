import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, AlertCircle } from 'lucide-react';

interface TpinPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tpin: string) => Promise<void>;
  title?: string;
  description?: string;
}

export const TpinPromptModal: React.FC<TpinPromptModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = 'Authorize Transaction',
  description = 'Enter your 6-digit Transaction PIN to securely authorize this action.'
}) => {
  const [tpin, setTpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (tpin.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await onSubmit(tpin);
      // If onSubmit succeeds, it typically closes the modal itself or redirects.
      setTpin('');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setTpin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-7 h-7 text-[#0F4C81]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 text-center">{title}</h2>
              <p className="text-slate-500 text-sm text-center mt-2">{description}</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={tpin}
                  onChange={(e) => setTpin(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-3xl tracking-[0.5em] focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                  maxLength={6}
                  placeholder="••••••"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || tpin.length !== 6}
                className="w-full py-3.5 px-4 bg-[#0F4C81] hover:bg-[#0A315C] text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Proceed'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
