const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!content.includes('SavingsSummaryCard')) {
  content = content.replace(
    /import \{ AddFundsModal \} from '\.\.\/components\/AddFundsModal';/,
    `import { AddFundsModal } from '../components/AddFundsModal';\nimport { SavingsSummaryCard } from '../components/SavingsSummaryCard';`
  );
  
  content = content.replace(
    /(<div className="flex justify-between items-center border-b border-slate-100 pb-3">\s*<span className="text-sm font-semibold text-slate-500">\{"Branch Name"\}<\/span>\s*<span className="text-sm font-bold text-slate-900">\{user\.branchName \|\| 'Head Office'\}<\/span>\s*<\/div>\s*<\/div>\s*<\/div>)/,
    `$1\n\n            <SavingsSummaryCard setCurrentTab={setCurrentTab} />`
  );

  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log('Dashboard.tsx updated');
}
