import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import { LoanApplicationModal } from '../components/LoanApplicationModal';

export const LoanDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoanOrApp = async () => {
      try {
        // First try fetching service applications
        const appsRes = await api.get('/service-applications/my');
        if (appsRes.data.success) {
          const apps = appsRes.data.data;
          const match = apps.find((a: any) => a._id === appId || a.applicationNo === appId);
          if (match) {
            setData({ application: match });
            setLoading(false);
            return;
          }
        }

        // Fallback to loan details endpoint
        const loanRes = await api.get(`/loans/details/${appId}`);
        if (loanRes.data.success) {
          setData({ loan: loanRes.data.data.loan });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanOrApp();
  }, [appId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81] gap-3">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading Loan Details...
      </div>
    );
  }

  const application = data?.application || {
    _id: appId,
    applicationType: data?.loan?.type || 'Loan Application',
    status: data?.loan?.status || 'Approved',
    submittedAt: data?.loan?.createdAt || Date.now(),
    formData: {
      loanAmount: data?.loan?.amount,
      loanTenure: `${data?.loan?.tenureMonths || 12} Months`,
      loanPurpose: data?.loan?.purpose || 'General Financial Assistance'
    },
    userId: data?.loan?.userId || authUser
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <LoanApplicationModal
        application={application}
        onClose={() => setCurrentTab('dashboard')}
        isFullPageView={true}
      />
    </div>
  );
};
