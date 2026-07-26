const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/AIChatAssistant.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Headset icon
content = content.replace(/import \{ MessageSquare, X, Send, Landmark, User, ShieldAlert, BookOpen, Maximize, Minimize, Mic, MicOff \} from 'lucide-react';/,
"import { MessageSquare, X, Send, Landmark, User, ShieldAlert, BookOpen, Maximize, Minimize, Mic, MicOff, Headset } from 'lucide-react';");

// 2. Fix empty strings
content = content.replace(/text: "",/g, "text: 'Welcome to Odiyooru Cooperative Bank. How can I help you today?',");
content = content.replace(/let reply = "";/, "let reply = 'Sorry, I could not find that information in the bank records.';");
content = content.replace(/reply = "";/g, (match, offset) => {
    // There are 4 of these.
    if (content.substring(offset - 150, offset).includes("prompt.includes('fd')")) {
        return "reply = 'Fixed deposit rates start from 4.5% up to 9.00% for society shareholders.';";
    } else if (content.substring(offset - 150, offset).includes("prompt.includes('gold')")) {
        return "reply = 'Cooperative loans include Home Loans starting at 8.5% p.a. and Vehicle Loans at 9.5% p.a.';";
    } else if (content.substring(offset - 150, offset).includes("prompt.includes('time')")) {
        return "reply = 'Bank Timings: Monday-Friday 9:30 AM to 4:30 PM, Saturday 9:30 AM to 1:30 PM.';";
    } else if (content.substring(offset - 150, offset).includes("prompt.includes('hello')")) {
        return "reply = 'Hello! How can I assist you with bank details today?';";
    }
    return match;
});

// 3. Title and Status
content = content.replace(/<h4 className="font-extrabold text-sm">\{""\}<\/h4>/, '<h4 className="font-extrabold text-sm">Digital Assistant</h4>');
content = content.replace(/<span>\{""\}<\/span>/, '<span>Online  Help Desk</span>');

// 4. Icons
content = content.replace(/<MessageSquare className="h-6 w-6 text-\[#ED7F1E\]" \/>/g, '<Headset className="h-6 w-6 text-[#ED7F1E]" />');
content = content.replace(/<Landmark className="h-5 w-5 text-\[#ED7F1E\]" \/>/g, '<Headset className="h-5 w-5 text-[#ED7F1E]" />');
content = content.replace(/<Landmark className="h-3\.5 w-3\.5 text-\[#ED7F1E\]" \/>/g, '<Headset className="h-3.5 w-3.5 text-[#ED7F1E]" />');

// 5. Suggestions and Placeholder
content = content.replace(/\{ label: "", text: 'What is the interest rate for FD deposits\?' \}/, "{ label: 'FD Rates', text: 'What is the interest rate for FD deposits?' }");
content = content.replace(/\{ label: "", text: 'What are the required documents and interest rate for a home loan\?' \}/, "{ label: 'Home Loan', text: 'What are the required documents and interest rate for a home loan?' }");
content = content.replace(/placeholder=\{""\}/, "placeholder='Ask me about timings, loans, deposits...'");

// Write back
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed assistant');
