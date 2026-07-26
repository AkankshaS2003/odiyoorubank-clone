const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// 1. Update useState
content = content.replace(
  /const \[cmsState, setCmsState\] = useState\(\{[\s\S]*?rdRate: 7\.75,/m,
  `const [cmsState, setCmsState] = useState({
      fdRate: 8.50,
      goldLoanRate: 8.50,
      savingsRate: 4.50,
      rdRate: 7.75,
      vehicleLoanRate: 10.00,
      personalLoanRate: 11.50,
      educationalLoanRate: 7.90,
      housingLoanRate: 8.25,
      mortgageLoanRate: 9.50,
      agriculturalLoanRate: 8.50,`
);

// 2. Update loadCmsState
content = content.replace(
  /fdRate: systemSettings\.fdRate \|\| 8\.50,[\s\S]*?rdRate: systemSettings\.rdRate \|\| 7\.75,/m,
  `fdRate: systemSettings.fdRate || 8.50,
          goldLoanRate: systemSettings.goldLoanRate || 8.50,
          savingsRate: systemSettings.savingsRate || 4.50,
          rdRate: systemSettings.rdRate || 7.75,
          vehicleLoanRate: systemSettings.vehicleLoanRate || 10.00,
          personalLoanRate: systemSettings.personalLoanRate || 11.50,
          educationalLoanRate: systemSettings.educationalLoanRate || 7.90,
          housingLoanRate: systemSettings.housingLoanRate || 8.25,
          mortgageLoanRate: systemSettings.mortgageLoanRate || 9.50,
          agriculturalLoanRate: systemSettings.agriculturalLoanRate || 8.50,`
);

// 3. Update handleCmsSubmit payload
content = content.replace(
  /fdRate: Number\(cmsState\.fdRate\),[\s\S]*?rdRate: Number\(cmsState\.rdRate\)/m,
  `fdRate: Number(cmsState.fdRate),
        goldLoanRate: Number(cmsState.goldLoanRate),
        savingsRate: Number(cmsState.savingsRate),
        rdRate: Number(cmsState.rdRate),
        vehicleLoanRate: Number(cmsState.vehicleLoanRate),
        personalLoanRate: Number(cmsState.personalLoanRate),
        educationalLoanRate: Number(cmsState.educationalLoanRate),
        housingLoanRate: Number(cmsState.housingLoanRate),
        mortgageLoanRate: Number(cmsState.mortgageLoanRate),
        agriculturalLoanRate: Number(cmsState.agriculturalLoanRate)`
);

// 4. Update the UI section heading
content = content.replace(
  /Cooperative Deposit Products & Rates/g,
  'Cooperative Products & Rates'
);

// 5. Update the UI section inputs (append before the submit button)
const newInputs = `
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
                      type="submit"`;

content = content.replace(
  /<button\s+type="submit"\s+disabled=\{submitting\}\s+className="w-max/m,
  newInputs + '\n                      disabled={submitting}\n                      className="w-max'
);

fs.writeFileSync('src/pages/AdminPanel.tsx', content);
console.log('AdminPanel.tsx updated successfully.');
