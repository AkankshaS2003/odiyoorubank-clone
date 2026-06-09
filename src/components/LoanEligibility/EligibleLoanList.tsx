import React from 'react';
import { IndianRupee, Percent, ArrowRight } from 'lucide-react';

interface EligibleLoanListProps {
  recommendedLoans: string[];
  maxLoanAmount: number;
}

export const EligibleLoanList: React.FC<EligibleLoanListProps> = ({ recommendedLoans, maxLoanAmount }) => {
  const getLoanDetails = (loanType: string) => {
    switch (loanType) {
      case 'Home Loan': return { rate: 8.5, max: maxLoanAmount };
      case 'Agricultural Loan': return { rate: 7.0, max: Math.min(maxLoanAmount, 500000) };
      case 'Vehicle Loan': return { rate: 9.0, max: Math.min(maxLoanAmount, 750000) };
      case 'Personal Loan': return { rate: 11.5, max: Math.min(maxLoanAmount, 300000) };
      case 'Education Loan': return { rate: 8.0, max: Math.min(maxLoanAmount, 1000000) };
      case 'Gold Loan': return { rate: 8.5, max: Math.min(maxLoanAmount, 1500000) };
      default: return { rate: 10.0, max: maxLoanAmount };
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Pre-Approved Loan Offers</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedLoans.map((loan, idx) => {
          const details = getLoanDetails(loan);
          return (
            <div key={idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <h4 className="text-lg font-bold text-slate-800 mb-4">{loan}</h4>
              
              <div className="space-y-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Eligible Amount Up To</span>
                  <div className="flex items-center text-primary font-black text-2xl">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {details.max.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Starting Interest Rate</span>
                  <div className="flex items-center text-slate-700 font-bold text-xl">
                    {details.rate}% p.a.
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-50 group-hover:bg-primary group-hover:text-white text-slate-600 font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <span>Apply Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
