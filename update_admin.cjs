const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// 1. Add import
if (!content.includes('getAllSavingsDeposits')) {
  content = content.replace(
    /import \{ useAuth \} from '\.\.\/context\/AuthContext';/,
    `import { useAuth } from '../context/AuthContext';\nimport { getAllSavingsDeposits } from '../services/savingsApi';`
  );
}

// 2. Add state
if (!content.includes('savingsDeposits')) {
  content = content.replace(
    /const \[applications, setApplications\] = useState<any\[\]>\(\[\]\);/,
    `const [applications, setApplications] = useState<any[]>([]);\n  const [savingsDeposits, setSavingsDeposits] = useState<any[]>([]);`
  );
}

// 3. Add fetch
if (!content.includes('setSavingsDeposits(res.deposits)')) {
  content = content.replace(
    /const loadApplications = async \(\) => \{([\s\S]*?)\};/,
    `const loadApplications = async () => {$1\n    try { const res = await getAllSavingsDeposits(); if (res.success) setSavingsDeposits(res.deposits); } catch(e) {} };`
  );
}

// 4. Render block
if (!content.includes('Savings Deposits')) {
  content = content.replace(
    /\{activeTab === 'applications' && \(/,
    `{activeTab === 'applications' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">Savings Deposits</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Review savings deposit applications.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                      <th className="p-4 rounded-l-xl">User</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Receipt</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savingsDeposits.map(dep => (
                      <tr key={dep._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{dep.userId?.fullName || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{dep.userId?.email || ''}</p>
                        </td>
                        <td className="p-4 font-black text-[#0A315C]">₹{dep.amount.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-xs font-bold text-slate-600">{dep.purpose}</td>
                        <td className="p-4">
                          <span className={\`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase \${dep.paymentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                            {dep.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono font-bold text-slate-500">{dep.receiptNumber}</td>
                        <td className="p-4 text-xs font-bold text-slate-500">
                          {new Date(dep.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">View details</button>
                        </td>
                      </tr>
                    ))}
                    {savingsDeposits.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-bold">No savings deposits found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Original content follows below... */}
`
  );
  
  // Also need to wrap the whole applications tab in the closing div
  content = content.replace(
    /\{activeTab === 'service_applications' && \(/,
    `        </div>\n        )}\n\n        {activeTab === 'service_applications' && (`
  );

  // remove the original closing bracket for applications tab
  content = content.replace(
    /<\/div>\n        \)\}\n\n        \{activeTab === 'service_applications' && \(/,
    `        {activeTab === 'service_applications' && (`
  );
}

fs.writeFileSync('src/pages/AdminPanel.tsx', content);
console.log('AdminPanel updated for savings deposits');
