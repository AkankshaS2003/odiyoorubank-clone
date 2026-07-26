const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

const targetStr = `                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || isEmployee}`;

const replacementStr = `                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Vehicle Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.vehicleLoanRate} onChange={(e) => setCmsState({ ...cmsState, vehicleLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Personal Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.personalLoanRate} onChange={(e) => setCmsState({ ...cmsState, personalLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Educational Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.educationalLoanRate} onChange={(e) => setCmsState({ ...cmsState, educationalLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Housing Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.housingLoanRate} onChange={(e) => setCmsState({ ...cmsState, housingLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mortgage Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.mortgageLoanRate} onChange={(e) => setCmsState({ ...cmsState, mortgageLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Agricultural Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.agriculturalLoanRate} onChange={(e) => setCmsState({ ...cmsState, agriculturalLoanRate: Number(e.target.value) })} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || isEmployee}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/AdminPanel.tsx', content);
  console.log('Success');
} else {
  console.log('Target string not found!');
}
