import React from 'react';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRecommendationProps {
  recommendedLoans: string[];
  income: number;
  dti: number;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({ recommendedLoans, income, dti }) => {
  const isEligible = recommendedLoans.length > 0 && income > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-12 ${isEligible ? 'bg-gradient-to-br from-indigo-900 to-slate-900' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}
    >
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
        <Sparkles className="w-64 h-64 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <Sparkles className="h-6 w-6 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-white">AI Recommendation</h3>
        </div>

        {isEligible ? (
          <>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8 max-w-3xl">
              Based on your stable monthly income of ₹{income.toLocaleString()}, current repayment capacity, occupation, and existing liabilities (DTI: {dti.toFixed(1)}%), you have strong eligibility for the following credit lines.
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Recommended Products:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedLoans.map((loan, idx) => (
                  <div key={idx} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span className="text-white font-semibold">{loan}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Reasoning:</h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed">
                  Your monthly disposable income and low debt ratio indicate strong repayment capability, fitting well within our cooperative bank's low-risk threshold.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8 max-w-3xl">
              Based on your current financial profile{income > 0 ? ` (DTI: ${dti.toFixed(1)}%)` : ''}, we are unable to recommend any pre-approved loan offers at this time.
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="h-6 w-6 text-red-400" />
                <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Not Eligible</h4>
              </div>
              <p className="text-indigo-100/80 text-sm leading-relaxed">
                Your calculated disposable income is insufficient for new credit lines based on our cooperative bank's risk threshold. Please visit our branch to discuss alternative financial solutions.
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
