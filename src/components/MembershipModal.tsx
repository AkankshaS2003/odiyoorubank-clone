import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MembershipCard } from './MembershipCard';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  const { user, becomeMember } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [isSubmitted, setIsSubmitted] = useState(!!user?.memberId);

  // If user is already a member when opening, show card directly
  React.useEffect(() => {
    if (isOpen && user?.memberId) {
      setIsSubmitted(true);
    }
  }, [isOpen, user?.memberId]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && dob && bloodGroup) {
      becomeMember(address, dob, bloodGroup);
      setIsSubmitted(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isSubmitted ? 'Your Membership Card' : 'Shareholder Membership Application'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isSubmitted ? 'Digital cooperative society ID' : 'Complete details to generate your digital ID card'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {isSubmitted ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-full max-w-md mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Membership Generated</h3>
                  <p className="text-sm text-slate-500">Your official digital shareholder membership card is ready. You can download and print it.</p>
                </div>
                <MembershipCard />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name (Read-only) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={user.fullName}
                        readOnly
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-medium focus:outline-none cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium ml-1">Name is fetched from your verified profile.</p>
                  </div>

                  {/* DOB */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                    <select
                      required
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Communication Address</label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full residential address"
                      className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    By submitting this form, you agree to become a registered shareholder of Odiyooru Souharda Cooperative Society. 
                    A digital membership card will be generated instantly for your records.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg transition-colors"
                >
                  Generate Membership Card
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
