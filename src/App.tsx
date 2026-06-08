import React, { useState, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AboutUs } from './pages/AboutUs';
import { Management } from './pages/Management';
import { ProductsPage } from './pages/ProductsPage';
import { MediaPage } from './pages/MediaPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { Footer } from './components/Footer';
import { AIChatAssistant } from './components/AIChatAssistant';
import { FloatingScrollButton } from './components/FloatingScrollButton';


export type Language = 'en';

interface TranslationDict {
  [key: string]: {
    en: string;
  };
}

export const translations: TranslationDict = {
  // --- Navbar ---
  home: {
    en: 'Home',
  },
  about: {
    en: 'About Us',
  },
  products: {
    en: 'Products',
  },
  media: {
    en: 'Media',
  },
  membership: {
    en: 'Membership',
  },
  management: {
    en: 'Management',
  },
  contact: {
    en: 'Contact Us',
  },
  login: {
    en: 'Login',
  },
  register: {
    en: 'Register',
  },
  dashboard: {
    en: 'Dashboard',
  },
  logout: {
    en: 'Logout',
  },


  // --- Products Section ---
  prod_title: {
    en: 'Premium Financial Products Crafted For You',
  },
  prod_desc: {
    en: 'Secure high returns on your hard-earned savings, or unlock flexible cooperative credit with lower rates.',
  },
  apply_now: {
    en: 'Apply Now',
  },
  savings_name: {
    en: 'Savings Deposit',
  },
  savings_desc: {
    en: 'Flexible savings account with competitive interest rates and no hidden maintenance charges.',
  },
  fd_name: {
    en: 'Fixed Deposit (FD)',
  },
  fd_desc: {
    en: 'Invest your surplus capital in high-return secure fixed deposit plans and secure your family future.',
  },
  rd_name: {
    en: 'Recurring Deposit (RD)',
  },
  rd_desc: {
    en: 'Develop a regular saving habit by investing a fixed amount every month with higher cooperative interest.',
  },
  gold_name: {
    en: 'Gold Loan',
  },
  gold_desc: {
    en: 'Leverage your gold assets for immediate funding with lowest processing fees and minimal documentation.',
  },

  // --- Why Choose Us ---
  core_pillars: {
    en: 'Core Pillars',
  },
  why_title: {
    en: 'Securing Your Financial Legacy With Trust',
  },
  why_desc: {
    en: 'For over two decades, thousands of families have relied on our credit society to grow their financial capital.',
  },
  rbi_title: {
    en: 'RBI Compliant Practices',
  },
  rbi_desc: {
    en: 'Operated in strict compliance with Cooperative Credit guidelines and audited regularly by state authorities.',
  },
  coop_title: {
    en: 'Trusted Cooperative Ethos',
  },
  coop_desc: {
    en: 'Owned by members, for members. We prioritize community wealth creation over commercial banking profits.',
  },
  pan_title: {
    en: 'PAN India Operations',
  },
  pan_desc: {
    en: 'Expanding network of branches and doorstep collections agents supporting rural and urban micro-entrepreneurs.',
  },
  swift_title: {
    en: 'Swift Loan Disbursements',
  },
  swift_desc: {
    en: 'Gold loans processed in 30 minutes. Transparent valuation checklists with lowest processing fees.',
  },
  best_title: {
    en: 'Industry-Best Deposit Rates',
  },
  Best_desc: {
    en: 'Earn up to 8.25% p.a. on Fixed Deposits, backed by sound capital reserve ratios.',
  },
  support_title: {
    en: 'Dedicated Local Support',
  },
  support_desc: {
    en: 'Get assistance from friendly bank tellers and localized customer relationship executives at every branch.',
  },

  // --- Membership Section ---
  coop_pride: {
    en: 'Cooperative Pride',
  },
  coowner_title: {
    en: "Don't Just Be a Customer. Be a Co-Owner.",
  },
  coowner_desc: {
    en: 'Unlike commercial retail banks, our cooperative credit society is owned and managed directly by our members.',
  },
  become_member: {
    en: 'Become Member Shareholder',
  },
  become_today: {
    en: 'Become a Member Today',
  },
  become_today_desc: {
    en: 'Invest a minimum of ₹10,000 in society share capital to instantly register as an active legal shareholder. Experience transparent community growth and financial security.',
  },
  dividend_highlight: {
    en: 'Receive up to 12% annual dividend disburser payouts!',
  },
  voting_title: {
    en: 'Democratic Voting Rights',
  },
  voting_desc: {
    en: 'Each shareholder member receives equal voting power at our Annual General Body meetings to elect board governance.',
  },
  profit_title: {
    en: 'Annual Profit Sharing & Dividends',
  },
  profit_desc: {
    en: 'Society profits are distributed back to member shareholders as competitive cash dividends pro-rata to share capital.',
  },
  priority_title: {
    en: 'Priority Interest Bonuses',
  },
  priority_desc: {
    en: 'Receive an additional +0.50% interest return premium on standard Fixed and Recurring Deposits.',
  },
  subsidized_title: {
    en: 'Subsidized Loan Processing',
  },
  subsidized_desc: {
    en: 'Enjoy priority queues, minimal evaluation checklists, and zero prepayment penalties on all loans.',
  },

  // --- Digital Banking ---
  fintech_core: {
    en: 'Fintech Core',
  },
  nextgen_title: {
    en: 'Next-Gen Cooperative Digital Experience',
  },
  nextgen_desc: {
    en: 'We bridge the personal touch of community cooperative credit with the robust speed, accessibility, and high-security architectures of modern mobile fintech platforms.',
  },
  ekyc_point: {
    en: 'Government approved Aadhaar e-KYC channels',
  },
  transfer_point: {
    en: 'Simulated IMPS/NEFT transfers disburser modules',
  },
  ledger_point: {
    en: 'Secure localStorage encrypted digital ledger logs',
  },
  forms_point: {
    en: 'Downloadable legal bank forms templates',
  },
  launch_portal: {
    en: 'Launch e-Banking Portal',
  },
  mob_sim_title: {
    en: 'Mobile App Simulator',
  },
  mob_sim_desc: {
    en: 'Track accounts, deposit slips, and statement drafts on your smartphone. Paperless passbooks inside.',
  },
  instant_title: {
    en: 'Instant Fund Transfers',
  },
  instant_desc: {
    en: 'Simulate instant RTGS, NEFT, and IMPS money transfers straight from your active savings accounts.',
  },
  ekyc_title: {
    en: 'e-KYC Document Uploads',
  },
  ekyc_desc: {
    en: 'Submit Aadhaar and PAN documents online. Instant mock verification within our secure portal.',
  },
  statement_title: {
    en: 'Download Bank Statements',
  },
  statement_desc: {
    en: 'Access your full statement history as highly structured simulated spreadsheets or print-ready PDF formats.',
  },

  // --- News ---
  society_journal: {
    en: 'Society Journal',
  },
  latest_news: {
    en: 'Latest News & Society Announcements',
  },
  news_desc: {
    en: 'Stay informed about our dividend declarations, financial awareness drives, and system upgrades.',
  },
  read_article: {
    en: 'Read Article',
  },
  news1_tag: {
    en: 'Interest Rates',
  },
  news1_title: {
    en: 'Cooperative Fixed Deposit Rates Increased to 8.25%',
  },
  news1_desc: {
    en: 'Our governing board has authorized an upward adjustment in FD yield returns to protect capital value for member families.',
  },
  news2_tag: {
    en: 'Awareness',
  },
  news2_title: {
    en: 'Financial Literacy Program Conducted in Rural Hubs',
  },
  news2_desc: {
    en: 'Held simulated training workshops supporting over 300+ women micro-entrepreneurs on savings structures and credit pathways.',
  },
  news3_tag: {
    en: 'Expansion',
  },
  news3_title: {
    en: 'New Digital Doorstep Banking Service Sanctioned',
  },
  news3_desc: {
    en: 'Launched mobile collection systems allowing members to deposit savings and pay EMIs directly through certified agents.',
  },

  // --- Testimonials ---
  member_voices: {
    en: 'Member Voices',
  },
  trusted_by: {
    en: 'Trusted By Over 50,000+ Indians',
  },
  rev1_review: {
    en: 'I have held a Fixed Deposit here for 8 years. The cooperative rates are consistently 1.5% higher than public sector retail banks. Extremely courteous staff and highly secure portal!',
  },
  rev1_name: {
    en: 'Dr. Suresh Kumar Malhotra',
  },
  rev1_role: {
    en: 'Member Shareholder',
  },
  rev1_branch: {
    en: 'Sector 15, Rohini Branch, New Delhi',
  },
  rev2_review: {
    en: 'My small business was struggling. Their doorstep collector agents visit my shop daily to collect savings, which are compounded quarterly. Sanctioned a gold loan within 20 minutes without credit history!',
  },
  rev2_name: {
    en: 'Sunita Devi Yadav',
  },
  rev2_role: {
    en: 'Micro-Entrepreneur',
  },
  rev2_branch: {
    en: 'Gomti Nagar Branch, Lucknow',
  },
  rev3_review: {
    en: 'The Monthly Income Scheme (MIS) keeps my retirement payouts secure with prompt direct transfers. The simulated dashboard is very clean, accessible, and transparent. Truly a modern cooperative!',
  },
  rev3_name: {
    en: 'Anirudh R. Deshmukh',
  },
  rev3_role: {
    en: 'Retiree',
  },
  rev3_branch: {
    en: 'Shivaji Nagar Branch, Pune',
  },

  // --- Downloads ---
  form_center: {
    en: 'Form Center',
  },
  download_docs: {
    en: 'Download Official Banking Documents',
  },
  download_desc: {
    en: 'Access, print, and fill official cooperative bank forms. Fill out forms at your convenience before visiting branch counters.',
  },
  form1_title: {
    en: 'Shareholder Membership Application Form',
  },
  form1_desc: {
    en: 'Required form to register as a shareholder co-owner and subscribe to initial society share units.',
  },
  form2_title: {
    en: 'Savings & FD Account Opening Mandate',
  },
  form2_desc: {
    en: 'Standard form to authorize opening checking, saving, recurring, or fixed deposit portfolios.',
  },
  form3_title: {
    en: 'Unified Customer e-KYC Declaration',
  },
  form3_desc: {
    en: 'Mandatory declaration sheet to append photocopies of Aadhaar Card, PAN Card, and passport photos.',
  },
  form4_title: {
    en: 'Gold Loan Valuation & Appraisal Checklist',
  },
  form4_desc: {
    en: 'Valuation criteria cataloguing purity testing parameters and sanction checklists for gold loan clients.',
  },
  download_btn: {
    en: 'Download Form',
  },
  compiling: {
    en: 'Compiling...',
  },
  downloaded: {
    en: 'Downloaded!',
  },

  // --- FAQ ---
  faq_guide: {
    en: 'FAQ Guide',
  },
  frequent_inquiries: {
    en: 'Frequently Answered Inquiries',
  },
  faq1_q: {
    en: 'Is Odiyooru Souharda Cooperative Society Ltd regulated by the RBI?',
  },
  faq1_a: {
    en: 'We operate as a Multi-State Cooperative Credit Society registered under the Multi-State Cooperative Societies Act, 2002. While commercial banks are directly governed under RBI Banking Regulation acts, credit societies are governed by state/central cooperative commissioners and maintain capital reserve ratios matching RBI compliance guidelines.',
  },
  faq2_q: {
    en: 'What is the maximum interest rate offered on cooperative Fixed Deposits?',
  },
  faq2_a: {
    en: 'We offer an industry-best standard FD interest rate of 8.25% p.a. for general depositors. Registered shareholder members and senior citizens receive a premium bonus rate of 8.75% p.a. interest compounded quarterly.',
  },
  faq3_q: {
    en: 'How do I become an active voting shareholder member of the society?',
  },
  faq3_a: {
    en: 'You can subscribe to initial Share Capital units (minimum investment ₹10,000) by visiting your nearest branch. Upon successful KYC checks and board sanction, you gain legal co-ownership, annual dividend rights, and voting powers at general body governance boards.',
  },
  faq4_q: {
    en: 'What is the processing time and security metrics for Gold Loans?',
  },
  faq4_a: {
    en: 'Gold Loans are disbursed at cheap rates starting from 8.50% p.a. within 30 minutes of counter valuations. Your physical gold ornaments are secured inside specialized government-grade vault keeps backed by comprehensive insurance coverage.',
  },
  faq5_q: {
    en: 'Do I get tax exemption benefits on deposits held inside cooperative societies?',
  },
  faq5_a: {
    en: 'Yes, interest earned on cooperative credit deposits receives exemptions under Section 80P of the Income Tax Act, offering better tax-adjusted yields than standard retail bank FD accounts.',
  },

  // --- Contact ---
  connect_us: {
    en: 'Connect With Us',
  },
  here_to_help: {
    en: 'We Are Here To Help You',
  },
  here_to_help_desc: {
    en: 'Reach out to our cooperative relationship managers for queries on gold loans, deposit schemes, or shareholder accounts.',
  },
  hq_office: {
    en: 'Headquarters Office',
  },
  central_address: {
    en: 'Odiyooru Souharda Cooperative Society Ltd',
  },
  hq_address_val: {
    en: 'Odiyoor post, Tq. Uppala Road 574243, Bantwal, Karnataka 574243',
  },
  direct_helpdesk: {
    en: 'Direct Helpdesk',
  },
  electronic_mail: {
    en: 'Electronic Mail',
  },
  operational_hours: {
    en: 'Operational Hours',
  },
  hours_val: {
    en: 'Monday - Saturday: 09:30 AM - 04:30 PM (Closed on Sundays, 2nd & 4th Saturdays)',
  },
  send_inquiry: {
    en: 'Send an Inquiry',
  },
  your_name: {
    en: 'Your Full Name',
  },
  mobile_number: {
    en: 'Mobile Number',
  },
  email_address: {
    en: 'Email Address',
  },
  msg_details: {
    en: 'Message / Inquiry Details',
  },
  msg_placeholder: {
    en: 'Describe your inquiry (e.g. interest rates details, gold loan valuation)...',
  },
  transmit_msg: {
    en: 'Transmit Inquiry Message',
  },
  inquiry_dispatched: {
    en: 'Inquiry Dispatched!',
  },
  inquiry_success_desc: {
    en: 'Thank you for contacting Odiyooru Souharda Cooperative Society Ltd. A relationship executive will contact you on your registered mobile number shortly.',
  },
  submit_another: {
    en: 'Submit another message',
  },

  // --- BranchLocator ---
  branches_title: {
    en: 'Branches',
  },
  locator_subtitle: {
    en: 'Cooperative Network Branch Locator',
  },
  locator_desc: {
    en: 'Find the nearest society office or deposit collection hub in your city.',
  },
  search_placeholder: {
    en: 'Search branch name, address, pin code...',
  },
  all_states: {
    en: 'All States',
  },
  no_branches: {
    en: 'No cooperative branches found matching your filters.',
  },
  central_hq_badge: {
    en: 'Central HQ',
  },

  // --- Calculators ---
  financial_tools: {
    en: 'Financial Tools',
  },
  interactive_calcs: {
    en: 'Interactive Financial Calculators',
  },
  calcs_desc: {
    en: 'Map out your financial goals and estimate loan EMIs or investment maturity payouts with clear interest formulas.',
  },
  loan_emi_tab: {
    en: 'Loan EMI',
  },
  fd_tab: {
    en: 'Fixed Deposit (FD)',
  },
  rd_tab: {
    en: 'Recurring Deposit (RD)',
  },
  elig_tab: {
    en: 'Loan Eligibility',
  },
  loan_principal: {
    en: 'Loan Principal',
  },
  interest_rate: {
    en: 'Interest Rate (% p.a.)',
  },
  tenure_months: {
    en: 'Tenure (Months)',
  },
  deposit_amt: {
    en: 'Deposit Amount',
  },
  tenure_years: {
    en: 'Tenure (Years)',
  },
  monthly_contrib: {
    en: 'Monthly Contribution',
  },
  duration_years: {
    en: 'Duration (Years)',
  },
  net_salary: {
    en: 'Net Monthly Salary',
  },
  existing_emi: {
    en: 'Existing Monthly EMI Outlays',
  },
  desired_tenure: {
    en: 'Loan Tenure Desired (Months)',
  },
  est_monthly_emi: {
    en: 'Estimated Monthly EMI',
  },
  principal_amt: {
    en: 'Principal Amount:',
  },
  total_interest: {
    en: 'Total Interest Payable:',
  },
  total_payable: {
    en: 'Total Amount Payable:',
  },
  emi_pie_info: {
    en: 'Interest constitutes a portion of the total loan repayment amount.',
  },
  maturity_wealth: {
    en: 'Maturity Wealth Value',
  },
  invested_capital: {
    en: 'Invested Capital:',
  },
  compound_acquired: {
    en: 'Compound Interest Acquired:',
  },
  total_wealth: {
    en: 'Total Wealth Accumulation:',
  },
  fd_rate_info: {
    en: 'Calculated with quarterly compounding, delivering better returns than simple monthly interest schemes.',
  },
  est_wealth_maturity: {
    en: 'Estimated Wealth Maturity',
  },
  total_outlay: {
    en: 'Total Outlay Deposited:',
  },
  interest_earned: {
    en: 'Interest Returns Earned:',
  },
  maturity_value: {
    en: 'Maturity Collection Value:',
  },
  rd_auto_info: {
    en: 'Auto-deduct instructions can be simulated inside your dashboard profile.',
  },
  est_eligible_loan: {
    en: 'Estimated Eligible Loan Sum',
  },
  max_allowed_emi: {
    en: 'Maximum Allowed EMI cap:',
  },
  debt_to_income: {
    en: 'Debt-to-Income Ratio:',
  },
  loan_status: {
    en: 'Status:',
  },
  loan_eligible: {
    en: 'Eligible to Apply',
  },
  loan_leveraged: {
    en: 'Leveraged Debt Cap Reached',
  },
  loan_verify_info: {
    en: 'Subject to documentation audits, property appraisals, or gold assay valuations at branch counters.',
  },

  // --- AIChatAssistant ---
  welcome_msg: {
    en: 'Namaste! Welcome to Odiyooru Souharda Cooperative Society Ltd Helpdesk. How may I assist you today with deposits, gold loans, or membership shares?',
  },
  chat_placeholder: {
    en: 'Ask anything about cooperative services...',
  },
  chat_suggest_fd: {
    en: 'FD Interest Rates',
  },
  chat_suggest_gold: {
    en: 'Gold Loan Details',
  },
  chat_suggest_member: {
    en: 'Become a Member',
  },
  chat_suggest_hours: {
    en: 'Branch Hours',
  },
  chat_title: {
    en: 'ICCS Digital Assistant',
  },
  chat_status: {
    en: 'Online Helpdesk • Simulated',
  },
  chat_resp_default: {
    en: "I apologize, but I didn't quite catch that. You can ask me about 'Fixed Deposit rates', 'how to apply for Gold Loans', 'society working hours', or 'membership dividend shares'.",
  },
  chat_resp_fd: {
    en: 'We offer a peak Fixed Deposit (FD) interest rate of 8.25% p.a. for general members, and an additional +0.50% premium (total 8.75% p.a.) for Senior Citizens and co-ownership shareholders. Interest is compounded quarterly.',
  },
  chat_resp_gold: {
    en: 'Our Gold Loans are sanctioned within 30 minutes at low cooperative rates starting from 8.50% p.a. Please carry your gold ornaments and KYC documents (Aadhaar & PAN) to the nearest branch for safe asset appraisals.',
  },
  chat_resp_member: {
    en: 'You can become an ICCS shareholder member by investing a minimum of ₹10,000 in society share capital. Benefits include democratic voting rights, up to 12% annual dividends, and subsidized loan rates!',
  },
  chat_resp_hours: {
    en: 'Our branches operate from Monday to Saturday, 09:30 AM to 04:30 PM. Please note that we are closed on Sundays, national holidays, and the 2nd & 4th Saturdays of every month.',
  },
  chat_resp_kyc: {
    en: "You can complete your e-KYC document uploads directly from the 'e-KYC Services' section in the Member Dashboard by submitting digital copies of your Aadhaar Card and PAN Card.",
  },
  chat_resp_hello: {
    en: 'Hello! How can I help you today? Ask me about FD interest rates, gold loans, or membership profiles.',
  },

  // --- Login Page ---
  secure_banking: {
    en: 'Secure Cooperative Banking',
  },
  secure_banking_desc: {
    en: 'Log in to subscribe to high interest fixed deposits, disburse gold loans directly to your savings, or complete Aadhaar e-KYC validation.',
  },
  iso_cert: {
    en: 'Certified ISO-27001 secure credentials database.',
  },
  govt_regd_no: {
    en: 'Govt Regd No: MSCS/CR/312/2012',
  },
  welcome_back: {
    en: 'Welcome Back',
  },
  access_portal: {
    en: 'Access Member Portal',
  },
  password_login: {
    en: 'Password Login',
  },
  mobile_otp: {
    en: 'Mobile OTP',
  },
  member_id_label: {
    en: 'Member ID or Email',
  },
  password_label: {
    en: 'Secure Password',
  },
  forgot_password: {
    en: 'Forgot Password?',
  },
  remember_me: {
    en: 'Remember Me on this device',
  },
  sign_in_btn: {
    en: 'Sign In To Account',
  },
  authenticating: {
    en: 'Authenticating...',
  },
  registered_mobile: {
    en: 'Registered Mobile Number',
  },
  send_otp_btn: {
    en: 'Send Verification OTP',
  },
  sending_otp: {
    en: 'Sending OTP...',
  },
  otp_code_label: {
    en: '6-Digit Verification Code',
  },
  verify_otp_btn: {
    en: 'Verify OTP & Log In',
  },
  verifying_otp: {
    en: 'Verifying OTP...',
  },
  or_continue_with: {
    en: 'Or Continue With',
  },
  google_login_btn: {
    en: 'Simulated Google Login',
  },
  google_fail: {
    en: 'Google simulation failure.',
  },
  invalid_credentials: {
    en: 'Invalid Credentials. Please use email: member@iccs.in and password: password or click OTP/Google demo shortcuts.',
  },
  invalid_mobile: {
    en: 'Please enter a valid 10-digit mobile number.',
  },
  otp_dispatch_error: {
    en: 'Could not dispatch OTP verification.',
  },
  invalid_otp_len: {
    en: 'Please enter a valid 6-digit code.',
  },
  invalid_otp_val: {
    en: 'Invalid OTP Verification code. Please enter 123456 or 111111 for simulated access.',
  },
  otp_verify_error: {
    en: 'Could not verify OTP token.',
  },
  new_to_society: {
    en: 'New to the Credit Society? Please contact your nearest cooperative branch to open an account.',
  },

  // --- Inline App sections ---
  about_title: {
    en: 'About Our Cooperative',
  },
  about_subtitle: {
    en: 'Our Heritage & Trust',
  },
  about_desc: {
    en: 'Established under Multi-State Cooperative Societies statutes, the Odiyooru Souharda Cooperative Society Ltd is a premier financial institution. We empower over 50,000+ members through high dividend-yielding deposits and subsidized micro-credit channels.',
  },
  board_governance: {
    en: 'Board of Governance',
  },
  board_c_name: {
    en: 'Shri Rajesh Kumar Sharma',
  },
  board_c_role: {
    en: 'Chairman',
  },
  board_c_bio: {
    en: 'Over 25 years of cooperative credit experience. Leading strategic expansion on PAN India scale.',
  },
  board_vc_name: {
    en: 'Dr. Sunita Devi Yadav',
  },
  board_vc_role: {
    en: 'Vice Chairperson',
  },
  board_vc_bio: {
    en: 'Academician and micro-finance expert. Overseeing rural literacy and development programs.',
  },
  board_md_name: {
    en: 'Shri Anirudh R. Deshmukh',
  },
  board_md_role: {
    en: 'Managing Director',
  },
  board_md_bio: {
    en: 'Fintech pioneer and risk manager. Directing the bank digital transition and ledger compliance.',
  },
  democratic_governance: {
    en: 'Democratic Governance',
  },
  democratic_desc: {
    en: 'Member-controlled board with pro-rata voting rights and transparent financial disclosure sheets.',
  },
  asset_security: {
    en: 'Asset Security',
  },
  asset_desc: {
    en: 'Rigorous audits, capital reserves protection, and safe vaults keeping systems.',
  },
  community_growth: {
    en: 'Community Growth',
  },
  community_desc: {
    en: 'Reinvesting interest profits to finance gold loans and local micro-entrepreneurs.',
  },

  // --- Dynamic Dashboard & Others ---
  virtual_fd_title: {
    en: 'Simulated Online FD Portal',
  },
  account_overview: {
    en: 'Account Overview',
  },
  savings_balance: {
    en: 'Savings Balance',
  },
  active_deposits: {
    en: 'Active Deposits',
  },
  loan_outstandings: {
    en: 'Loan Outstandings',
  },
  member_profile: {
    en: 'Member Profile',
  },
  ekyc_status: {
    en: 'e-KYC Status',
  },
  kyc_verified: {
    en: 'Verified',
  },
  kyc_pending: {
    en: 'Pending',
  },
  kyc_unsubmitted: {
    en: 'Unsubmitted',
  },
  upload_docs_btn: {
    en: 'Upload Documents',
  },
  open_fd_btn: {
    en: 'Open Fixed Deposit',
  },
  apply_loan_btn: {
    en: 'Apply For Loan',
  },
  deposit_list_hdr: {
    en: 'Your Asset Portfolio Deposits',
  },
  loan_list_hdr: {
    en: 'Active Loan Accounts',
  },
  transaction_history_hdr: {
    en: 'Recent Simulated Ledger Transactions',
  },
  amount_in_inr: {
    en: 'Amount (INR)',
  },
  maturity_term: {
    en: 'Maturity Term',
  },
  status_hdr: {
    en: 'Status',
  },
  accrued_int_label: {
    en: 'Accrued Interest',
  },
  pay_emi_btn: {
    en: 'Pay Monthly EMI',
  },
  emi_paid_status: {
    en: 'Paid EMI: {count} Months',
  },
  welcome_user: {
    en: 'Namaste, {name}',
  },
  member_id_value: {
    en: 'Member ID: {id}',
  },

  // --- Dynamic Product Catalog ---
  daily_deposit_name: {
    en: 'Daily Deposit',
  },
  daily_deposit_desc: {
    en: 'Ideal scheme for micro-merchants and small businesses. Daily collections collected directly from your storefront.',
  },
  mis_name: {
    en: 'Monthly Income Scheme',
  },
  mis_desc: {
    en: 'Deposit a lump sum and receive fixed monthly interest payouts straight to your savings account.',
  },
  share_capital_name: {
    en: 'Share Capital',
  },
  share_capital_desc: {
    en: 'Invest in the capital shares of our society, earn annual dividends, and gain legal voting rights.',
  },
  vehicle_name: {
    en: 'Vehicle Loan',
  },
  vehicle_desc: {
    en: 'Drive your dream car or two-wheeler home with cheap monthly EMIs and flexible payoff schedules.',
  },
  personal_name: {
    en: 'Personal Loan',
  },
  personal_desc: {
    en: 'Simulate personal financial security for weddings, travel, medical needs, or retail consolidation.',
  },
  education_name: {
    en: 'Education Loan',
  },
  education_desc: {
    en: 'Empower your child higher educational goals in top Indian and international universities with low interest rates.',
  },
  housing_name: {
    en: 'Housing Loan',
  },
  housing_desc: {
    en: 'Build or purchase your dream house with affordable cooperative society home loan schemes.',
  },

  // --- Footer Section ---
  footer_bio: {
    en: 'We have various strategic partnerships and alliances with eminent Indian and global companies which cater to various aspects of our daily operations on PAN India scale. Not only do these partnerships widen our business platform but they also lay a foundation for a sustainable future.',
  },
  quick_links: {
    en: 'Quick Links',
  },
  footer_prod_title: {
    en: 'Products',
  },
  copyright: {
    en: 'Copyright © 2026 Odiyooru Souharda Cooperative Society Ltd. All rights reserved.',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('iccs_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('iccs_language', lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>('home');

  const renderActiveTab = () => {
    // Restrict only dashboard tab to authenticated members
    let tabToRender = currentTab;
    if (tabToRender === 'dashboard' && !isAuthenticated) {
      tabToRender = 'login';
    }

    switch (tabToRender) {
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'login':
        return <Login setCurrentTab={setCurrentTab} />;
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'products':
        return <ProductsPage />;
      case 'membership':
        return <MembershipPage setCurrentTab={setCurrentTab} />;
      case 'contact':
      case 'branches':
      case 'calculators':
        return <ContactPage />;
      case 'media':
        return <MediaPage />;
      case 'management':
        return <Management setCurrentTab={setCurrentTab} />;
      case 'about':
        return <AboutUs setCurrentTab={setCurrentTab} />;
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* 1. Header Sticky Navbar matching Reference Image 1 */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* 2. Primary Page Body content */}
      <main className="flex-grow">
        {renderActiveTab()}
      </main>

      {/* 3. Simulated smart NLP floating assistant bubble */}
      {isAuthenticated && <AIChatAssistant />}

      {/* 4. Footer exact match with Reference Image 2 */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* 5. Sleek floating smart scroll indicator with rotation animations */}
      <FloatingScrollButton />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
