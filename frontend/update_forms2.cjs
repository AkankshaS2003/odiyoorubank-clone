const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx') && file.endsWith('Application.tsx') && file !== 'DepositApplication.tsx');

const fetchFunctionStr = `
  const fetchCustomerDetails = async (id: string) => {
    if (!id) return;
    const customer = await getCustomerByCustomerId(id);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        memberNo: customer.memberId || prev.memberNo,
        fullName: customer.fullName || prev.fullName,
        permHouse: customer.address || prev.permHouse,
        mobile: customer.phone || prev.mobile,
        dob: customer.dob || prev.dob,
        aadhaar: customer.aadharNumber || prev.aadhaar,
        pan: customer.panNumber || prev.pan,
        email: customer.email || prev.email,
      }));
    } else {
      alert("Customer not found");
    }
  };
`;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already processed the definition
  if (content.includes('const fetchCustomerDetails')) {
    console.log(`Skipped ${file} (already has fetchCustomerDetails definition)`);
    return;
  }

  // Add getCustomerByCustomerId to useAuth destructuring if not there
  if (!content.includes('getCustomerByCustomerId')) {
    content = content.replace(/const { user, submitServiceApplication } = useAuth\(\);/, 'const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();');
  } else {
    // If it's already there or in another form
    content = content.replace(/const { user, submitServiceApplication } = useAuth\(\);/, 'const { user, submitServiceApplication, getCustomerByCustomerId } = useAuth();');
  }

  // Insert fetchCustomerDetails after setSuccess state or generateAppNo
  const insertIndex = content.indexOf('const [formData, setFormData]');
  if (insertIndex !== -1) {
    content = content.slice(0, insertIndex) + fetchFunctionStr + '\n  ' + content.slice(insertIndex);
  }

  // Make setFormData accept any type to avoid strict TS errors on prev state
  content = content.replace('const [formData, setFormData] = useState({', 'const [formData, setFormData] = useState<any>({');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
