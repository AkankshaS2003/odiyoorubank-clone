const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!content.includes('SavingsDepositApplication')) {
  content = content.replace(
    /import \{ DepositApplication \} from '\.\/pages\/DepositApplication';/,
    `import { DepositApplication } from './pages/DepositApplication';\nimport { SavingsDepositApplication } from './pages/SavingsDepositApplication';`
  );
}

// Add to condition
if (!content.includes('apply-savings-deposit')) {
  content = content.replace(
    /tabToRender === 'apply-deposit'/,
    `tabToRender === 'apply-savings-deposit' || tabToRender === 'apply-deposit'`
  );
  
  // Add to switch
  content = content.replace(
    /case 'apply-deposit':/,
    `case 'apply-savings-deposit':
          if (!isAuthenticated) {
            return <Home setCurrentTab={setCurrentTab} />;
          }
          return <SavingsDepositApplication setCurrentTab={setCurrentTab} />;
        case 'apply-deposit':`
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
