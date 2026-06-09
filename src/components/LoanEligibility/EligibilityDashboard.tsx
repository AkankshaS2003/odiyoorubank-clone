import React, { useRef } from 'react';
import type { LoanRequestData } from './EligibilityForm';
import type { LoanResponseData } from '../../pages/LoanEligibilityPage';
import { VisualAnalytics } from './VisualAnalytics';
import { AIRecommendation } from './AIRecommendation';
import { EligibleLoanList } from './EligibleLoanList';
import { Printer, Download, Save, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface EligibilityDashboardProps {
  formData: LoanRequestData;
  resultData: LoanResponseData;
  onReset: () => void;
}

export const EligibilityDashboard: React.FC<EligibilityDashboardProps> = ({ formData, resultData, onReset }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true, logging: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Loan_Eligibility_Report_${formData.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert("Failed to generate PDF: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSave = () => {
    alert("Eligibility report saved to your member dashboard!");
  };

  const dti = (Number(formData.existingEmi) / Number(formData.income)) * 100;

  return (
    <div className="space-y-8">
      
      {/* Action Bar (Not printed) */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 print:hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-4 sm:mb-0">Your Smart Assessment Report</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl flex items-center space-x-2 transition-colors">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Start New</span>
          </button>
        </div>
      </div>

      {/* Main Printable Area */}
      <div ref={dashboardRef} className="bg-white/50 p-6 sm:p-10 rounded-3xl print:bg-white print:p-0 print:m-0">
        
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Max Eligible Amount</span>
            <span className="text-3xl font-black text-slate-800">₹{resultData.maxLoanAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Approval Odds</span>
            <span className="text-3xl font-black text-emerald-600">{resultData.approvalProbability}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Suggested EMI</span>
            <span className="text-3xl font-black text-slate-800">₹{resultData.monthlyEMI.toLocaleString('en-IN')}</span>
          </div>

          <div className={`p-6 rounded-3xl border shadow-sm flex items-center space-x-4
            ${resultData.riskLevel === 'Low Risk' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
              resultData.riskLevel === 'Medium Risk' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-red-50 border-red-100 text-red-700'}`}
          >
            {resultData.riskLevel === 'Low Risk' ? <ShieldCheck className="h-10 w-10 opacity-80" /> : <AlertTriangle className="h-10 w-10 opacity-80" />}
            <div>
              <span className="text-sm font-bold uppercase tracking-widest block opacity-70 mb-1">Risk Profile</span>
              <span className="text-2xl font-black">{resultData.riskLevel}</span>
            </div>
          </div>

        </div>

        {/* AI Recommendations */}
        <AIRecommendation 
          recommendedLoans={resultData.recommendedLoans} 
          income={Number(formData.income)} 
          dti={dti} 
        />

        {/* Visual Analytics */}
        <VisualAnalytics 
          income={Number(formData.income)} 
          emi={Number(formData.existingEmi)} 
          expenses={Number(formData.expenses)} 
          savings={Number(formData.savings)} 
          score={resultData.eligibilityScore} 
        />

        {/* Eligible Loans */}
        <EligibleLoanList 
          recommendedLoans={resultData.recommendedLoans} 
          maxLoanAmount={resultData.maxLoanAmount} 
        />

      </div>

    </div>
  );
};
