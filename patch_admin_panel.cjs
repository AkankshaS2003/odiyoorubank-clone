const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// 1. Insert State
const stateInjection = `
  const [branchVerificationModal, setBranchVerificationModal] = useState<{isOpen: boolean, type: 'account' | 'loan', id: string} | null>(null);
  const [checklist, setChecklist] = useState({
    aadhaar: false, pan: false, customerPresent: false, signature: false, photograph: false, income: false, kyc: false
  });
  
  const handleBranchVerificationSubmit = async () => {
    if (!branchVerificationModal) return;
    setActionLoading(true);
    try {
      if (branchVerificationModal.type === 'account') {
        await api.put(\`/applications/\${branchVerificationModal.id}/branch-verification\`);
        await fetchApplications();
      } else {
        await api.put(\`/loans/\${branchVerificationModal.id}/branch-verification\`);
        await fetchLoans();
      }
      setBranchVerificationModal(null);
      setChecklist({aadhaar: false, pan: false, customerPresent: false, signature: false, photograph: false, income: false, kyc: false});
      // Optionally show a success toast
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };
`;
// Insert after const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
code = code.replace(/(const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);\r?\n)/, '$1' + stateInjection);

// 2. Update Accounts Table
// Find: {app.status === 'Pending' ? (
// Note: AdminPanel.tsx might use {app.status === 'Pending' ? ( ... ) : ( <span ...>Processed</span> )}
const accountTableSearch = /\{app\.status === 'Pending' \? \([\s\S]*?className="text-\[10px\] text-slate-400 font-bold block pr-4">Processed<\/span>\r?\n\s*\)\}/;

const accountTableReplace = `
                                {app.status === 'Pending Branch Verification' ? (
                                  <button onClick={() => setBranchVerificationModal({isOpen: true, type: 'account', id: app._id})} className="px-3 py-1.5 bg-blue-50 hover:bg-[#0F4C81] text-[#0F4C81] hover:text-white rounded-lg border border-blue-100 font-bold text-[10px] uppercase tracking-wider transition-all">Verify Branch</button>
                                ) : app.status === 'Branch Verification Completed' || app.status === 'Pending' ? (
                                  <>
                                    <button
                                      onClick={() => handleApplicationStatusChange(app._id, 'Approved')}
                                      disabled={actionLoading}
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 hover:border-emerald-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                      title="Approve Account Application"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleApplicationStatusChange(app._id, 'Rejected')}
                                      disabled={actionLoading}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg border border-rose-100 hover:border-rose-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                      title="Reject Account Application"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold block pr-4">Processed</span>
                                )}
`;
code = code.replace(accountTableSearch, accountTableReplace.trim());

// 3. Update Loans Table
const loanTableSearch = /\{loan\.status === 'Pending' \? \([\s\S]*?className="text-\[10px\] text-slate-400 font-bold block pr-4">Processed<\/span>\r?\n\s*\)\}/;

const loanTableReplace = `
                                {loan.status === 'Pending Branch Verification' ? (
                                  <button onClick={() => setBranchVerificationModal({isOpen: true, type: 'loan', id: loan._id})} className="px-3 py-1.5 bg-blue-50 hover:bg-[#0F4C81] text-[#0F4C81] hover:text-white rounded-lg border border-blue-100 font-bold text-[10px] uppercase tracking-wider transition-all">Verify Branch</button>
                                ) : loan.status === 'Branch Verification Completed' || loan.status === 'Pending Review' || loan.status === 'Pending' ? (
                                  <>
                                    <button
                                      onClick={() => handleLoanStatusChange(loan._id, 'Approved')}
                                      disabled={actionLoading}
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 hover:border-emerald-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                      title="Approve Loan Application"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleLoanStatusChange(loan._id, 'Rejected')}
                                      disabled={actionLoading}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg border border-rose-100 hover:border-rose-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                      title="Reject Loan Application"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold block pr-4">Processed</span>
                                )}
`;
code = code.replace(loanTableSearch, loanTableReplace.trim());

// 4. Inject Modal at the bottom
const modalUI = `
      {/* Branch Verification Modal */}
      {branchVerificationModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase">Branch Verification Checklist</h2>
              <button onClick={() => setBranchVerificationModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: 'aadhaar', label: 'Original Aadhaar Verified' },
                { key: 'pan', label: 'Original PAN Verified' },
                { key: 'customerPresent', label: 'Customer Physically Present' },
                { key: 'signature', label: 'Signature Verified' },
                { key: 'photograph', label: 'Photograph Verified' },
                ...(branchVerificationModal.type === 'loan' ? [{ key: 'income', label: 'Income Documents Verified' }, { key: 'collateral', label: 'Collateral Verified (if applicable)' }] : []),
                { key: 'kyc', label: 'KYC Completed' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={(checklist as any)[item.key]} 
                    onChange={(e) => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))} 
                    className="w-5 h-5 accent-[#0F4C81] rounded cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setBranchVerificationModal(null)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={handleBranchVerificationSubmit} 
                disabled={actionLoading || Object.entries(checklist).some(([k, v]) => !v && (!['income', 'collateral'].includes(k) || branchVerificationModal.type === 'loan'))}
                className="px-6 py-2 bg-[#0F4C81] hover:bg-blue-900 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
              >
                {actionLoading ? 'Saving...' : 'Complete Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/(\s*)(<\/div>\s*<\/div>\s*)$/, (match, p1, p2) => p1 + modalUI + p2);

fs.writeFileSync('src/pages/AdminPanel.tsx', code);
console.log("Updated AdminPanel successfully!");
