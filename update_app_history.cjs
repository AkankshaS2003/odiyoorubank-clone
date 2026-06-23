const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('SavingsHistory')) {
  content = content.replace(
    /import \{ SavingsDepositApplication \} from '\.\/pages\/SavingsDepositApplication';/,
    `import { SavingsDepositApplication } from './pages/SavingsDepositApplication';\nimport { SavingsHistory } from './pages/SavingsHistory';`
  );
  
  content = content.replace(
    /tabToRender === 'apply-savings-deposit' \|\| tabToRender === 'apply-deposit'/,
    `tabToRender === 'savings-history' || tabToRender === 'apply-savings-deposit' || tabToRender === 'apply-deposit'`
  );
  
  content = content.replace(
    /case 'apply-savings-deposit':/,
    `case 'savings-history':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <SavingsHistory setCurrentTab={setCurrentTab} />;
        case 'apply-savings-deposit':`
  );

  fs.writeFileSync('src/App.tsx', content);
  console.log('App.tsx updated for savings history');
}
