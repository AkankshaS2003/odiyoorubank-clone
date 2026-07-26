import React, { useRef, useState } from 'react';
import type { LoanRequestData } from './EligibilityForm';
import type { LoanResponseData } from '../../pages/LoanEligibilityPage';
import { Printer, Download, Save, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, IndianRupee, Activity, FileText, ArrowRight, BrainCircuit } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EligibilityDashboardProps {
  formData: LoanRequestData;
  resultData: LoanResponseData;
  onReset: () => void;
  setCurrentTab?: (tab: string) => void;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export const EligibilityDashboard: React.FC<EligibilityDashboardProps> = ({ formData, resultData, onReset, setCurrentTab }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const imgData = await toPng(dashboardRef.current, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc'
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Eligibility_Report_${formData.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert("Failed to generate PDF");
    }
  };

  const handleSave = () => {
    setShowModal(true);
    setSaveSuccess(false);
  };

  const handleConfirmSave = () => {
    const savedReport = { formData, resultData, date: new Date().toISOString() };
    localStorage.setItem('odiyooru_saved_eligibility_report', JSON.stringify(savedReport));
    setShowModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  const handleCancelSave = () => {
    setShowModal(false);
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const isEligible = resultData.isEligible;
  const statusColor = isEligible ? 'text-emerald-600' : 'text-red-600';
  const statusBg = isEligible ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100';
  const StatusIcon = isEligible ? ShieldCheck : AlertTriangle;

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .recharts-responsive-container {
            width: 100% !important;
          }
          /* Ensure page breaks avoid cutting cards in half */
          .shadow-sm, .shadow-xl {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 print:hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-4 sm:mb-0">Your Financial Analytics</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Main Printable Dashboard */}
      <div ref={dashboardRef} className="bg-slate-50 p-2 sm:p-4 rounded-3xl print:bg-white print:p-0 print:m-0 space-y-6">
        
        {/* Status Header */}
        <div className={`p-8 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between ${statusBg}`}>
          <div className="flex items-center space-x-6">
            <div className={`p-4 rounded-full bg-white shadow-sm ${statusColor}`}>
              <StatusIcon className="h-10 w-10" />
            </div>
            <div>
              <span className={`text-sm font-bold uppercase tracking-widest block opacity-80 mb-1 ${statusColor}`}>Eligibility Status</span>
              <h2 className={`text-4xl font-black tracking-tight ${statusColor}`}>
                {resultData.eligibilityStatus}
              </h2>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 text-center sm:text-right">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-1">Health Score</span>
            <div className="text-5xl font-black text-slate-800">{resultData.eligibilityScore}<span className="text-2xl text-slate-400">/100</span></div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Eligible Amount</span>
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <span className="text-3xl font-black text-slate-800">{formatCurrency(resultData.maxEligibleAmount)}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested EMI</span>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-3xl font-black text-slate-800">{formatCurrency(resultData.monthlyEMI)}</span>
            <span className="text-sm font-medium text-slate-500 block mt-1">at {resultData.interestRate}% interest</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disposable Income</span>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-3xl font-black text-slate-800">{formatCurrency(resultData.disposableIncome)}</span>
            <span className="text-sm font-medium text-slate-500 block mt-1">Post-EMI</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart: Repayment Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><PieChart className="h-5 w-5 mr-2 text-primary" /> Repayment Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultData.chartData.repaymentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resultData.chartData.repaymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Interest</div>
                <div className="text-lg font-bold text-slate-800">{formatCurrency(resultData.totalInterest)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Repayment</div>
                <div className="text-lg font-bold text-primary">{formatCurrency(resultData.totalRepaymentAmount)}</div>
              </div>
            </div>
          </div>

          {/* Chart: Financial Health */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><BarChart className="h-5 w-5 mr-2 text-primary" /> Monthly Financial Profile</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultData.chartData.financialBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                    {resultData.chartData.financialBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600">Debt-to-Income (DTI)</span>
              <span className={`text-lg font-black ${resultData.debtToIncomeRatio > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                {resultData.debtToIncomeRatio.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">AI Financial Analysis</h3>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <p className="text-slate-700 text-lg leading-relaxed font-medium">
              {resultData.aiRecommendation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Detailed Reasoning</h4>
              <ul className="space-y-3">
                {resultData.detailedReasoning.map((reason, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${isEligible ? 'text-emerald-500' : 'text-red-500'}`} />
                    <span className="text-slate-600 font-medium">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Improvement Suggestions</h4>
              <ul className="space-y-3">
                {resultData.improvementSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
                    <span className="text-slate-600 font-medium">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Apply Action */}
        {isEligible && (
          <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-3xl shadow-xl text-white flex justify-center print:hidden">
            <button 
              onClick={() => {
                const map: Record<string, string> = {
                  'Agricultural Loan': 'apply-agricultural-loan',
                  'Vehicle Loan': 'apply-vehicle-loan',
                  'Housing Loan': 'apply-housing-loan',
                  'Educational Loan': 'apply-educational-loan',
                  'Gold Loan': 'apply-gold-loan',
                  'Personal Loan': 'apply-personal-loan'
                };
                if (setCurrentTab) setCurrentTab(map[resultData.recommendedLoanType] || 'home');
              }}
              className="px-12 py-4 bg-white text-primary rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

      </div>

      {/* Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-md transform transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><Save className="mr-3 text-primary"/> Save Report</h3>
            <p className="text-slate-600 mb-8 text-lg font-medium">
              Save this eligibility report securely to your dashboard for future reference?
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={handleCancelSave} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmSave} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-colors">
                Save Securely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed bottom-8 right-8 z-50 bg-white border-l-4 border-emerald-500 p-5 rounded-2xl shadow-2xl flex items-center space-x-4 animate-bounce print:hidden">
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-slate-800 font-bold">Report Saved</h4>
            <span className="text-slate-500 text-sm font-medium">Available in your dashboard</span>
          </div>
        </div>
      )}

    </div>
  );
};
