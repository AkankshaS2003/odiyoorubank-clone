import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import { DepositApplicationModal } from '../components/DepositApplicationModal';

export const RDDetailsPage = ({ appId, setCurrentTab }: { appId: string, setCurrentTab: (tab: string) => void }) => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRD = async () => {
      try {
        const res = await api.get(`/rd/${appId}`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          const appRes = await api.get(`/applications/${appId}`);
          if (appRes.data.success) {
            setData({ application: appRes.data.data });
          }
        }
      } catch (err) {
        try {
          const appRes = await api.get(`/applications/${appId}`);
          if (appRes.data.success) {
            setData({ application: appRes.data.data });
          }
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRD();
  }, [appId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-[#0F4C81] gap-3">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading Recurring Deposit Details...
      </div>
    );
  }

  const rd = data?.rd;
  const user = data?.user || authUser;
  const application = rd?.applicationId || data?.application || {
    _id: appId,
    applicationType: 'Recurring Deposit',
    status: rd?.status === 'Active' ? 'Approved' : 'Approved',
    submittedAt: rd?.depositDate || rd?.createdAt || Date.now(),
    formData: {
      amount: rd?.monthlyAmount,
      depositPeriod: `${rd?.tenureMonths || 12} Months`,
      rdNumber: rd?.rdNumber,
      interestRate: rd?.interestRate
    },
    userId: user
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-4">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <DepositApplicationModal
        application={application}
        onClose={() => setCurrentTab('dashboard')}
        initialTab="certificate"
      />
    </div>
  );
};
