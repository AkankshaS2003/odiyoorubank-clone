import React, { useState, createContext, useContext } from 'react';

export type Language = 'en' | 'kn';

interface TranslationDict {
  [key: string]: {
    en: string;
    kn: string;
  };
}

export const translations: TranslationDict = {
  // --- Navbar ---
  home: {
    en: 'Home',
    kn: `ಮುಖಪುಟ`,
  },
  about: {
    en: 'About Us',
    kn: `ನಮ್ಮ ಬಗ್ಗೆ`,
  },
  products: {
    en: 'Products',
    kn: `ಉತ್ಪನ್ನಗಳು`,
  },
  media: {
    en: 'Media',
    kn: `ಮಾಧ್ಯಮ`,
  },
  membership: {
    en: 'Membership',
    kn: `ಸದಸ್ಯತ್ವ`,
  },
  management: {
    en: 'Management',
    kn: `ಆಡಳಿತ`,
  },
  contact: {
    en: 'Contact Us',
    kn: `ಸಂಪರ್ಕಿಸಿ`,
  },
  login: {
    en: 'Login',
    kn: `ಲಾಗಿನ್`,
  },
  register: {
    en: 'Register',
    kn: `ನೋಂದಣಿ`,
  },
  dashboard: {
    en: 'Dashboard',
    kn: `ಡ್ಯಾಶ್‌ಬೋರ್ಡ್`,
  },
  logout: {
    en: 'Logout',
    kn: `ಲಾಗ್ ಔಟ್`,
  },
  loan_eligibility: {
    en: 'Eligibility Checker',
    kn: `ಅರ್ಹತೆ ಪರಿಶೀಲನೆ`,
  },


  // --- Products Section ---
  prod_title: {
    en: 'Premium Financial Products Crafted For You',
    kn: `ನಿಮಗಾಗಿ ರಚಿಸಲಾದ ಪ್ರೀಮಿಯಂ ಹಣಕಾಸು ಉತ್ಪನ್ನಗಳು`,
  },
  prod_desc: {
    en: 'Secure high returns on your hard-earned savings, or unlock flexible cooperative credit with lower rates.',
    kn: `ನಿಮ್ಮ ಉಳಿತಾಯದ ಮೇಲೆ ಹೆಚ್ಚಿನ ಆದಾಯವನ್ನು ಪಡೆಯಿರಿ, ಅಥವಾ ಕಡಿಮೆ ದರದಲ್ಲಿ ನಮ್ಯ ಸಾಲವನ್ನು ಪಡೆಯಿರಿ.`,
  },
  apply_now: {
    en: 'Apply Now',
    kn: `ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ`,
  },
  savings_name: {
    en: 'Savings Deposit',
    kn: `ಉಳಿತಾಯ ಖಾತೆ`,
  },
  savings_desc: {
    en: 'Flexible savings account with competitive interest rates and no hidden maintenance charges.',
    kn: `ಸ್ಪರ್ಧಾತ್ಮಕ ಬಡ್ಡಿದರಗಳು ಮತ್ತು ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲದ ನಮ್ಯ ಉಳಿತಾಯ ಖಾತೆ.`,
  },
  fd_name: {
    en: 'Fixed Deposit (FD)',
    kn: `ನಿಶ್ಚಿತ ಠೇವಣಿ (FD)`,
  },
  fd_desc: {
    en: 'Invest your surplus capital in high-return secure fixed deposit plans and secure your family future.',
    kn: `ಹೆಚ್ಚಿನ ಆದಾಯದ ಸುರಕ್ಷಿತ ನಿಶ್ಚಿತ ಠೇವಣಿ ಯೋಜನೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಬಂಡವಾಳವನ್ನು ಹೂಡಿಕೆ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಭವಿಷ್ಯವನ್ನು ಭದ್ರಪಡಿಸಿಕೊಳ್ಳಿ.`,
  },
  rd_name: {
    en: 'Recurring Deposit (RD)',
    kn: `ಆವರ್ತಕ ಠೇವಣಿ (RD)`,
  },
  rd_desc: {
    en: 'Develop a regular saving habit by investing a fixed amount every month with higher cooperative interest.',
    kn: `ಪ್ರತಿ ತಿಂಗಳು ನಿರ್ದಿಷ್ಟ ಮೊತ್ತವನ್ನು ಹೂಡಿಕೆ ಮಾಡುವ ಮೂಲಕ ನಿಯಮಿತ ಉಳಿತಾಯ ಅಭ್ಯಾಸವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ.`,
  },
  gold_name: {
    en: 'Gold Loan',
    kn: `ಚಿನ್ನದ ಸಾಲ`,
  },
  gold_desc: {
    en: 'Leverage your gold assets for immediate funding with lowest processing fees and minimal documentation.',
    kn: `ಕಡಿಮೆ ಪ್ರಕ್ರಿಯೆ ಶುಲ್ಕ ಮತ್ತು ಕನಿಷ್ಠ ದಾಖಲಾತಿಯೊಂದಿಗೆ ತಕ್ಷಣದ ಹಣಕಾಸಿಗಾಗಿ ನಿಮ್ಮ ಚಿನ್ನವನ್ನು ಬಳಸಿ.`,
  },

  // --- Why Choose Us ---
  core_pillars: {
    en: 'Core Pillars',
    kn: `ಮೂಲ ಸ್ತಂಭಗಳು`,
  },
  why_title: {
    en: 'Securing Your Financial Legacy With Trust',
    kn: `ನಂಬಿಕೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಹಣಕಾಸಿನ ಭವಿಷ್ಯವನ್ನು ಭದ್ರಪಡಿಸುವುದು`,
  },
  why_desc: {
    en: 'For over two decades, thousands of families have relied on our credit society to grow their financial capital.',
    kn: `ಎರಡು ದಶಕಗಳಿಗೂ ಹೆಚ್ಚು ಕಾಲ, ಸಾವಿರಾರು ಕುಟುಂಬಗಳು ನಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿವೆ.`,
  },
  rbi_title: {
    en: 'RBI Compliant Practices',
    kn: `ಆರ್‌ಬಿಐ ನಿಯಮಾವಳಿಗಳ ಪಾಲನೆ`,
  },
  rbi_desc: {
    en: 'Operated in strict compliance with Cooperative Credit guidelines and audited regularly by state authorities.',
    kn: `ಸಹಕಾರಿ ಸಾಲ ಮಾರ್ಗಸೂಚಿಗಳ ಕಟ್ಟುನಿಟ್ಟಾದ ಅನುಸರಣೆಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.`,
  },
  coop_title: {
    en: 'Trusted Cooperative Ethos',
    kn: `ವಿಶ್ವಾಸಾರ್ಹ ಸಹಕಾರಿ ತತ್ವಗಳು`,
  },
  coop_desc: {
    en: 'Owned by members, for members. We prioritize community wealth creation over commercial banking profits.',
    kn: `ಸದಸ್ಯರಿಗಾಗಿ ಸದಸ್ಯರಿಂದಲೇ ನಡೆಸಲ್ಪಡುತ್ತಿದೆ. ನಾವು ವಾಣಿಜ್ಯ ಲಾಭಗಳಿಗಿಂತ ಸಮುದಾಯದ ಏಳಿಗೆಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತೇವೆ.`,
  },
  pan_title: {
    en: 'PAN India Operations',
    kn: `ಅಖಿಲ ಭಾರತ ಕಾರ್ಯಾಚರಣೆ`,
  },
  pan_desc: {
    en: 'Expanding network of branches and doorstep collections agents supporting rural and urban micro-entrepreneurs.',
    kn: `ಗ್ರಾಮೀಣ ಮತ್ತು ನಗರದ ಸಣ್ಣ ಉದ್ಯಮಿಗಳನ್ನು ಬೆಂಬಲಿಸಲು ಶಾಖೆಗಳು ಮತ್ತು ಮನೆ ಬಾಗಿಲಿನ ಸಂಗ್ರಹಣೆ ಏಜೆಂಟ್‌ಗಳ ಜಾಲ.`,
  },
  swift_title: {
    en: 'Swift Loan Disbursements',
    kn: `ತ್ವರಿತ ಸಾಲ ವಿತರಣೆ`,
  },
  swift_desc: {
    en: 'Gold loans processed in 30 minutes. Transparent valuation checklists with lowest processing fees.',
    kn: `30 ನಿಮಿಷಗಳಲ್ಲಿ ಚಿನ್ನದ ಸಾಲ ವಿತರಣೆ.`,
  },
  best_title: {
    en: 'Industry-Best Deposit Rates',
    kn: `ಉತ್ತಮ ಠೇವಣಿ ದರಗಳು`,
  },
  Best_desc: {
    en: 'Earn up to 9.00% p.a. on Fixed Deposits, backed by sound capital reserve ratios.',
    kn: `ನಿಶ್ಚಿತ ಠೇವಣಿಗಳ ಮೇಲೆ 9.00% ವರೆಗೆ ಬಡ್ಡಿ ಪಡೆಯಿರಿ.`,
  },
  support_title: {
    en: 'Dedicated Local Support',
    kn: `ಮೀಸಲಾದ ಸ್ಥಳೀಯ ಬೆಂಬಲ`,
  },
  support_desc: {
    en: 'Get assistance from friendly bank tellers and localized customer relationship executives at every branch.',
    kn: `ಪ್ರತಿ ಶಾಖೆಯಲ್ಲಿ ಸ್ನೇಹಪರ ಗ್ರಾಹಕ ಬೆಂಬಲ.`,
  },

  // --- Membership Section ---
  coop_pride: {
    en: 'Cooperative Pride',
    kn: `ಸಹಕಾರಿ ಹೆಮ್ಮೆ`,
  },
  coowner_title: {
    en: "Don't Just Be a Customer. Be a Co-Owner.",
    kn: `ಕೇವಲ ಗ್ರಾಹಕರಾಗಿರಬೇಡಿ. ಸಹ-ಮಾಲೀಕರಾಗಿ.`,
  },
  coowner_desc: {
    en: 'Unlike commercial retail banks, our cooperative credit society is owned and managed directly by our members.',
    kn: `ವಾಣಿಜ್ಯ ಬ್ಯಾಂಕುಗಳಿಗಿಂತ ಭಿನ್ನವಾಗಿ, ನಮ್ಮ ಸಹಕಾರ ಸಂಘವು ನೇರವಾಗಿ ನಮ್ಮ ಸದಸ್ಯರಿಂದ ಒಡೆತನದಲ್ಲಿದೆ ಮತ್ತು ನಿರ್ವಹಿಸಲ್ಪಡುತ್ತಿದೆ.`,
  },
  become_member: {
    en: 'Become Member Shareholder',
    kn: `ಸದಸ್ಯ ಷೇರುದಾರರಾಗಿ`,
  },
  become_today: {
    en: 'Become a Member Today',
    kn: `ಇಂದೇ ಸದಸ್ಯರಾಗಿ`,
  },
  become_today_desc: {
    en: 'Invest a minimum of ₹10,000 in society share capital to instantly register as an active legal shareholder. Experience transparent community growth and financial security.',
    kn: `ಸಕ್ರಿಯ ಕಾನೂನುಬದ್ಧ ಷೇರುದಾರರಾಗಲು ಕನಿಷ್ಠ ₹10,000 ಹೂಡಿಕೆ ಮಾಡಿ.`,
  },
  dividend_highlight: {
    en: 'Receive up to 12% annual dividend disburser payouts!',
    kn: `12% ವರೆಗಿನ ವಾರ್ಷಿಕ ಲಾಭಾಂಶವನ್ನು ಪಡೆಯಿರಿ!`,
  },
  voting_title: {
    en: 'Democratic Voting Rights',
    kn: `ಪ್ರಜಾಸತ್ತಾತ್ಮಕ ಮತದಾನದ ಹಕ್ಕುಗಳು`,
  },
  voting_desc: {
    en: 'Each shareholder member receives equal voting power at our Annual General Body meetings to elect board governance.',
    kn: `ಪ್ರತಿ ಷೇರುದಾರ ಸದಸ್ಯರು ಮತದಾನದ ಹಕ್ಕನ್ನು ಹೊಂದಿರುತ್ತಾರೆ.`,
  },
  profit_title: {
    en: 'Annual Profit Sharing & Dividends',
    kn: `ವಾರ್ಷಿಕ ಲಾಭ ಹಂಚಿಕೆ ಮತ್ತು ಡಿವಿಡೆಂಡ್`,
  },
  profit_desc: {
    en: 'Society profits are distributed back to member shareholders as competitive cash dividends pro-rata to share capital.',
    kn: `ಸಂಘದ ಲಾಭವನ್ನು ಸದಸ್ಯರಿಗೆ ಡಿವಿಡೆಂಡ್ ರೂಪದಲ್ಲಿ ವಿತರಿಸಲಾಗುತ್ತದೆ.`,
  },
  priority_title: {
    en: 'Priority Interest Bonuses',
    kn: `ಆದ್ಯತೆಯ ಬಡ್ಡಿ ಬೋನಸ್‌ಗಳು`,
  },
  priority_desc: {
    en: 'Receive an additional +0.50% interest return premium on standard Fixed and Recurring Deposits.',
    kn: `ನಿಶ್ಚಿತ ಮತ್ತು ಆವರ್ತಕ ಠೇವಣಿಗಳ ಮೇಲೆ ಹೆಚ್ಚುವರಿ +0.50% ಬಡ್ಡಿ ಪಡೆಯಿರಿ.`,
  },
  subsidized_title: {
    en: 'Subsidized Loan Processing',
    kn: `ಸಬ್ಸಿಡಿ ಸಾಲ ಪ್ರಕ್ರಿಯೆ`,
  },
  subsidized_desc: {
    en: 'Enjoy priority queues, minimal evaluation checklists, and zero prepayment penalties on all loans.',
    kn: `ಎಲ್ಲಾ ಸಾಲಗಳ ಮೇಲೆ ಶೂನ್ಯ ಪೂರ್ವಪಾವತಿ ದಂಡವನ್ನು ಆನಂದಿಸಿ.`,
  },

  // --- Digital Banking ---
  fintech_core: {
    en: 'Fintech Core',
    kn: `ಫಿನ್ಟೆಕ್ ಕೋರ್`,
  },
  nextgen_title: {
    en: 'Next-Gen Cooperative Digital Experience',
    kn: `ಮುಂದಿನ ಪೀಳಿಗೆಯ ಸಹಕಾರಿ ಡಿಜಿಟಲ್ ಅನುಭವ`,
  },
  nextgen_desc: {
    en: 'We bridge the personal touch of community cooperative credit with the robust speed, accessibility, and high-security architectures of modern mobile fintech platforms.',
    kn: `ನಾವು ಆಧುನಿಕ ಫಿನ್‌ಟೆಕ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಳೊಂದಿಗೆ ಸಮುದಾಯ ಸಾಲವನ್ನು ಸೇರಿಸುತ್ತೇವೆ.`,
  },
  ekyc_point: {
    en: 'Government approved Aadhaar e-KYC channels',
    kn: `ಸರ್ಕಾರದಿಂದ ಅನುಮೋದಿತ ಆಧಾರ್ e-KYC`,
  },
  transfer_point: {
    en: 'Simulated IMPS/NEFT transfers disburser modules',
    kn: `IMPS/NEFT ವರ್ಗಾವಣೆ ವ್ಯವಸ್ಥೆ`,
  },
  ledger_point: {
    en: 'Secure localStorage encrypted digital ledger logs',
    kn: `ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಲೆಡ್ಜರ್`,
  },
  forms_point: {
    en: 'Downloadable legal bank forms templates',
    kn: `ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದಾದ ಬ್ಯಾಂಕ್ ಫಾರ್ಮ್‌ಗಳು`,
  },
  launch_portal: {
    en: 'Launch e-Banking Portal',
    kn: `ಇ-ಬ್ಯಾಂಕಿಂಗ್ ಪೋರ್ಟಲ್ ಪ್ರಾರಂಭಿಸಿ`,
  },
  mob_sim_title: {
    en: 'Mobile App Simulator',
    kn: `ಮೊಬೈಲ್ ಆಪ್`,
  },
  mob_sim_desc: {
    en: 'Track accounts, deposit slips, and statement drafts on your smartphone. Paperless passbooks inside.',
    kn: `ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ನಲ್ಲಿ ಖಾತೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.`,
  },
  instant_title: {
    en: 'Instant Fund Transfers',
    kn: `ತ್ವರಿತ ಹಣ ವರ್ಗಾವಣೆ`,
  },
  instant_desc: {
    en: 'Simulate instant RTGS, NEFT, and IMPS money transfers straight from your active savings accounts.',
    kn: `ನಿಮ್ಮ ಉಳಿತಾಯ ಖಾತೆಯಿಂದ ನೇರವಾಗಿ ಹಣ ವರ್ಗಾಯಿಸಿ.`,
  },
  ekyc_title: {
    en: 'e-KYC Document Uploads',
    kn: `e-KYC ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್`,
  },
  ekyc_desc: {
    en: 'Submit Aadhaar and PAN documents online. Instant mock verification within our secure portal.',
    kn: `ಆಧಾರ್ ಮತ್ತು ಪ್ಯಾನ್ ದಾಖಲೆಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಿ.`,
  },
  statement_title: {
    en: 'Download Bank Statements',
    kn: `ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ`,
  },
  statement_desc: {
    en: 'Access your full statement history as highly structured simulated spreadsheets or print-ready PDF formats.',
    kn: `ನಿಮ್ಮ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಇತಿಹಾಸವನ್ನು ಪಿಡಿಎಫ್ ರೂಪದಲ್ಲಿ ಪಡೆಯಿರಿ.`,
  },

  // --- News ---
  society_journal: {
    en: 'Society Journal',
    kn: `ಸಂಘದ ವರದಿ`,
  },
  latest_news: {
    en: 'Latest News & Society Announcements',
    kn: `ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು ಮತ್ತು ಪ್ರಕಟಣೆಗಳು`,
  },
  news_desc: {
    en: 'Stay informed about our dividend declarations, financial awareness drives, and system upgrades.',
    kn: `ನಮ್ಮ ಲಾಭಾಂಶ ಘೋಷಣೆಗಳು, ಮತ್ತು ಸಿಸ್ಟಮ್ ನವೀಕರಣಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.`,
  },
  read_article: {
    en: 'Read Article',
    kn: `ಲೇಖನ ಓದಿ`,
  },
  news1_tag: {
    en: 'Interest Rates',
    kn: `ಬಡ್ಡಿ ದರಗಳು`,
  },
  news1_title: {
    en: 'Cooperative Fixed Deposit Rates Increased to 8.50%',
    kn: `ಸ್ಥಿರ ಠೇವಣಿ ದರಗಳು 8.50% ಕ್ಕೆ ಹೆಚ್ಚಳ`,
  },
  news1_desc: {
    en: 'Our governing board has authorized an upward adjustment in FD yield returns to protect capital value for member families.',
    kn: `ನಮ್ಮ ಆಡಳಿತ ಮಂಡಳಿಯು FD ಬಡ್ಡಿದರಗಳನ್ನು ಹೆಚ್ಚಿಸಿದೆ.`,
  },
  news2_tag: {
    en: 'Awareness',
    kn: `ಜಾಗೃತಿ`,
  },
  news2_title: {
    en: 'Financial Literacy Program Conducted in Rural Hubs',
    kn: `ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಲ್ಲಿ ಆರ್ಥಿಕ ಸಾಕ್ಷರತಾ ಕಾರ್ಯಕ್ರಮ`,
  },
  news2_desc: {
    en: 'Held simulated training workshops supporting over 300+ women micro-entrepreneurs on savings structures and credit pathways.',
    kn: `300 ಕ್ಕೂ ಹೆಚ್ಚು ಮಹಿಳಾ ಉದ್ಯಮಿಗಳನ್ನು ಬೆಂಬಲಿಸುವ ತರಬೇತಿ ಕಾರ್ಯಾಗಾರಗಳು.`,
  },
  news3_tag: {
    en: 'Expansion',
    kn: `ವಿಸ್ತರಣೆ`,
  },
  news3_title: {
    en: 'New Digital Doorstep Banking Service Sanctioned',
    kn: `ಹೊಸ ಡಿಜಿಟಲ್ ಮನೆ-ಬಾಗಿಲಿನ ಬ್ಯಾಂಕಿಂಗ್ ಸೇವೆ ಮಂಜೂರು`,
  },
  news3_desc: {
    en: 'Launched mobile collection systems allowing members to deposit savings and pay EMIs directly through certified agents.',
    kn: `ಸದಸ್ಯರಿಗೆ ನೇರವಾಗಿ ಉಳಿತಾಯವನ್ನು ಠೇವಣಿ ಮಾಡಲು ಮೊಬೈಲ್ ಸಂಗ್ರಹಣಾ ವ್ಯವಸ್ಥೆಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.`,
  },

  // --- Testimonials ---
  member_voices: {
    en: 'Member Voices',
    kn: `ಸದಸ್ಯರ ಧ್ವನಿಗಳು`,
  },
  trusted_by: {
    en: 'Trusted By Over 50,000+ Indians',
    kn: `50,000 ಕ್ಕೂ ಹೆಚ್ಚು ಭಾರತೀಯರ ವಿಶ್ವಾಸಾರ್ಹ`,
  },
  rev1_review: {
    en: 'I have held a Fixed Deposit here for 8 years. The cooperative rates are consistently 1.5% higher than public sector retail banks. Extremely courteous staff and highly secure portal!',
    kn: `ನಾನು ಇಲ್ಲಿ 8 ವರ್ಷಗಳಿಂದ FD ಹೊಂದಿದ್ದೇನೆ. ಇಲ್ಲಿನ ದರಗಳು ಹೆಚ್ಚು ಲಾಭದಾಯಕವಾಗಿವೆ.`,
  },
  rev1_name: {
    en: 'Dr. Suresh Kumar Malhotra',
    kn: `ಡಾ. ಸುರೇಶ್ ಕುಮಾರ್ ಮಲ್ಹೋತ್ರಾ`,
  },
  rev1_role: {
    en: 'Member Shareholder',
    kn: `ಸದಸ್ಯ ಷೇರುದಾರ`,
  },
  rev1_branch: {
    en: 'Hampankatta Branch, Mangaluru',
    kn: `ಹಂಪನಕಟ್ಟೆ ಶಾಖೆ, ಮಂಗಳೂರು`,
  },
  rev2_review: {
    en: 'My small business was struggling. Their doorstep collector agents visit my shop daily to collect savings, which are compounded quarterly. Sanctioned a gold loan within 20 minutes without credit history!',
    kn: `ನನ್ನ ಸಣ್ಣ ವ್ಯಾಪಾರ ಕಷ್ಟದಲ್ಲಿತ್ತು. ಇವರ ಮನೆ ಬಾಗಿಲ ಸೇವೆ ನನಗೆ ತುಂಬಾ ಸಹಾಯಕವಾಗಿದೆ.`,
  },
  rev2_name: {
    en: 'Sunita Devi Yadav',
    kn: `ಸುನಿತಾ ದೇವಿ ಯಾದವ್`,
  },
  rev2_role: {
    en: 'Micro-Entrepreneur',
    kn: `ಸಣ್ಣ ಉದ್ಯಮಿ`,
  },
  rev2_branch: {
    en: 'Main Road Branch, Puttur',
    kn: `ಮುಖ್ಯ ರಸ್ತೆ ಶಾಖೆ, ಪುತ್ತೂರು`,
  },
  rev3_review: {
    en: 'The Monthly Income Scheme (MIS) keeps my retirement payouts secure with prompt direct transfers. The simulated dashboard is very clean, accessible, and transparent. Truly a modern cooperative!',
    kn: `ಮಾಸಿಕ ಆದಾಯ ಯೋಜನೆ (MIS) ನನ್ನ ನಿವೃತ್ತಿ ಪಾವತಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿದೆ.`,
  },
  rev3_name: {
    en: 'Anirudh R. Deshmukh',
    kn: `ಅನಿರುದ್ಧ ಆರ್. ದೇಶಮುಖ್`,
  },
  rev3_role: {
    en: 'Retiree',
    kn: `ನಿವೃತ್ತಿ ಹೊಂದಿದವರು`,
  },
  rev3_branch: {
    en: 'Car Street Branch, Udupi',
    kn: `ರಥಬೀದಿ ಶಾಖೆ, ಉಡುಪಿ`,
  },

  // --- Community Impact ---
  impact_badge: {
    en: 'Social Responsibility',
    kn: `ಸಾಮಾಜಿಕ ಜವಾಬ್ದಾರಿ`,
  },
  impact_main_title: {
    en: 'Cooperative Community Impact',
    kn: `ಸಹಕಾರಿ ಸಮುದಾಯದ ಪ್ರಭಾವ`,
  },
  impact_main_desc: {
    en: 'We dedicate a portion of our profits and extensive resources to drive financial inclusion, micro-enterprise growth, and rural development across the communities we serve.',
    kn: `ನಾವು ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳುವಿಕೆಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತೇವೆ.`,
  },
  impact_shg_title: {
    en: 'Women Self-Help Groups',
    kn: `ಮಹಿಳಾ ಸ್ವ-ಸಹಾಯ ಸಂಘಗಳು`,
  },
  impact_shg_desc: {
    en: 'Empowering rural women with micro-credit lines, skills training, and collective financial independence programs.',
    kn: `ಗ್ರಾಮೀಣ ಮಹಿಳೆಯರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.`,
  },
  impact_shg_stats: {
    en: 'Active Groups',
    kn: `ಸಕ್ರಿಯ ಗುಂಪುಗಳು`,
  },
  impact_agri_title: {
    en: 'Agricultural Subsidies',
    kn: `ಕೃಷಿ ಸಬ್ಸಿಡಿಗಳು`,
  },
  impact_agri_desc: {
    en: 'Providing low-interest crop loans, tractor financing, and seasonal cash advances for local farming families.',
    kn: `ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಕಡಿಮೆ ಬಡ್ಡಿದರದ ಬೆಳೆ ಸಾಲ ಒದಗಿಸುವುದು.`,
  },
  impact_agri_stats: {
    en: 'Funds Disbursed',
    kn: `ವಿತರಿಸಲಾದ ನಿಧಿಗಳು`,
  },
  impact_micro_title: {
    en: 'Micro-Enterprise Growth',
    kn: `ಸೂಕ್ಷ್ಮ-ಉದ್ಯಮ ಬೆಳವಣಿಗೆ`,
  },
  impact_micro_desc: {
    en: 'Supporting street vendors and small shop owners with daily collection accounts and collateral-free starter loans.',
    kn: `ಬೀದಿ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಸಣ್ಣ ಅಂಗಡಿ ಮಾಲೀಕರಿಗೆ ಬೆಂಬಲ.`,
  },
  impact_micro_stats: {
    en: 'Businesses Funded',
    kn: `ಧನಸಹಾಯ ಪಡೆದ ವ್ಯಾಪಾರಗಳು`,
  },
  impact_welfare_title: {
    en: 'Financial Literacy Camps',
    kn: `ಆರ್ಥಿಕ ಸಾಕ್ಷರತಾ ಶಿಬಿರಗಳು`,
  },
  impact_welfare_desc: {
    en: 'Conducting regular awareness workshops on savings, digital banking safety, and cooperative governance rights.',
    kn: `ಉಳಿತಾಯ ಮತ್ತು ಡಿಜಿಟಲ್ ಬ್ಯಾಂಕಿಂಗ್ ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ ನಿಯಮಿತ ಕಾರ್ಯಾಗಾರಗಳು.`,
  },
  impact_welfare_stats: {
    en: 'Annual Camps',
    kn: `ವಾರ್ಷಿಕ ಶಿಬಿರಗಳು`,
  },

  // --- FAQ ---
  faq_guide: {
    en: 'FAQ Guide',
    kn: `ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು`,
  },
  frequent_inquiries: {
    en: 'Frequently Answered Inquiries',
    kn: `ಸಾಮಾನ್ಯ ವಿಚಾರಣೆಗಳು`,
  },
  faq1_q: {
    en: 'Is Odiyooru Souharda Cooperative Society Ltd regulated by the RBI?',
    kn: `ಒಡಿಯೂರು ಸೌಹಾರ್ದ ಸಹಕಾರಿ ಸಂಘವು RBI ನಿಂದ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತದೆಯೇ?`,
  },
  faq1_a: {
    en: 'We operate as a Multi-State Cooperative Credit Society registered under the Multi-State Cooperative Societies Act, 2002. While commercial banks are directly governed under RBI Banking Regulation acts, credit societies are governed by state/central cooperative commissioners and maintain capital reserve ratios matching RBI compliance guidelines.',
    kn: `ನಾವು ಬಹು-ರಾಜ್ಯ ಸಹಕಾರ ಸಂಘಗಳ ಕಾಯಿದೆ ಅಡಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತೇವೆ.`,
  },
  faq2_q: {
    en: 'What is the maximum interest rate offered on cooperative Fixed Deposits?',
    kn: `ಸ್ಥಿರ ಠೇವಣಿಗಳ ಮೇಲೆ ನೀಡಲಾಗುವ ಗರಿಷ್ಠ ಬಡ್ಡಿ ದರ ಎಷ್ಟು?`,
  },
  faq2_a: {
    en: 'We offer an industry-best standard FD interest rate of 8.50% p.a. for general depositors. Registered shareholder members and senior citizens receive a premium bonus rate of 9.00% p.a. interest compounded quarterly.',
    kn: `ನಾವು ಸಾಮಾನ್ಯ ಠೇವಣಿದಾರರಿಗೆ ವಾರ್ಷಿಕ 8.50% ಬಡ್ಡಿ ದರವನ್ನು ನೀಡುತ್ತೇವೆ.`,
  },
  faq3_q: {
    en: 'How do I become an active voting shareholder member of the society?',
    kn: `ನಾನು ಸಂಘದ ಸಕ್ರಿಯ ಮತದಾನದ ಷೇರುದಾರನಾಗುವುದು ಹೇಗೆ?`,
  },
  faq3_a: {
    en: 'You can subscribe to initial Share Capital units (minimum investment ₹10,000) by visiting your nearest branch. Upon successful KYC checks and board sanction, you gain legal co-ownership, annual dividend rights, and voting powers at general body governance boards.',
    kn: `ನೀವು ಹತ್ತಿರದ ಶಾಖೆಗೆ ಭೇಟಿ ನೀಡಿ ಕನಿಷ್ಠ ₹10,000 ಹೂಡಿಕೆ ಮಾಡುವ ಮೂಲಕ ಸದಸ್ಯರಾಗಬಹುದು.`,
  },
  faq4_q: {
    en: 'What is the processing time and security metrics for Gold Loans?',
    kn: `ಚಿನ್ನದ ಸಾಲಗಳಿಗೆ ಪ್ರಕ್ರಿಯೆ ಸಮಯ ಎಷ್ಟು?`,
  },
  faq4_a: {
    en: 'Gold Loans are disbursed at cheap rates starting from 8.50% p.a. within 30 minutes of counter valuations. Your physical gold ornaments are secured inside specialized government-grade vault keeps backed by comprehensive insurance coverage.',
    kn: `ಚಿನ್ನದ ಸಾಲಗಳನ್ನು ಕೇವಲ 30 ನಿಮಿಷಗಳಲ್ಲಿ ನೀಡಲಾಗುತ್ತದೆ.`,
  },
  faq5_q: {
    en: 'Do I get tax exemption benefits on deposits held inside cooperative societies?',
    kn: `ಸಹಕಾರ ಸಂಘಗಳಲ್ಲಿನ ಠೇವಣಿಗಳ ಮೇಲೆ ತೆರಿಗೆ ವಿನಾಯಿತಿ ಸಿಗುತ್ತದೆಯೇ?`,
  },
  faq5_a: {
    en: 'Yes, interest earned on cooperative credit deposits receives exemptions under Section 80P of the Income Tax Act, offering better tax-adjusted yields than standard retail bank FD accounts.',
    kn: `ಹೌದು, ಆದಾಯ ತೆರಿಗೆ ಕಾಯಿದೆಯ ಸೆಕ್ಷನ್ 80P ಅಡಿಯಲ್ಲಿ ವಿನಾಯಿತಿಗಳಿವೆ.`,
  },

  // --- Contact ---
  connect_us: {
    en: 'Connect With Us',
    kn: `ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ`,
  },
  here_to_help: {
    en: 'We Are Here To Help You',
    kn: `ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾವಿದ್ದೇವೆ`,
  },
  here_to_help_desc: {
    en: 'Reach out to our cooperative relationship managers for queries on gold loans, deposit schemes, or shareholder accounts.',
    kn: `ಚಿನ್ನದ ಸಾಲಗಳು ಅಥವಾ ಠೇವಣಿ ಯೋಜನೆಗಳ ವಿಚಾರಣೆಗಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.`,
  },
  hq_office: {
    en: 'Headquarters Office',
    kn: `ಪ್ರಧಾನ ಕಛೇರಿ`,
  },
  central_address: {
    en: 'Odiyooru Souharda Cooperative Society Ltd',
    kn: `ಒಡಿಯೂರು ಸೌಹಾರ್ದ ಸಹಕಾರಿ ಸಂಘ ನಿಯಮಿತ`,
  },
  hq_address_val: {
    en: 'Odiyoor post, Tq. Uppala Road 574243, Bantwal, Karnataka 574243',
    kn: `ಒಡಿಯೂರು ಪೋಸ್ಟ್, ಉಪ್ಪಳ ರಸ್ತೆ, ಬಂಟ್ವಾಳ, ಕರ್ನಾಟಕ 574243`,
  },
  direct_helpdesk: {
    en: 'Direct Helpdesk',
    kn: `ನೇರ ಸಹಾಯವಾಣಿ`,
  },
  electronic_mail: {
    en: 'Electronic Mail',
    kn: `ಇಮೇಲ್`,
  },
  operational_hours: {
    en: 'Operational Hours',
    kn: `ಕಾರ್ಯಾಚರಣೆಯ ಸಮಯ`,
  },
  hours_val: {
    en: 'Monday - Saturday: 09:30 AM - 04:30 PM (Closed on Sundays, 2nd & 4th Saturdays)',
    kn: `ಸೋಮವಾರ - ಶನಿವಾರ: 09:30 AM - 04:30 PM (ಭಾನುವಾರ ರಜೆ)`,
  },
  send_inquiry: {
    en: 'Send an Inquiry',
    kn: `ವಿಚಾರಣೆ ಕಳುಹಿಸಿ`,
  },
  your_name: {
    en: 'Your Full Name',
    kn: `ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು`,
  },
  mobile_number: {
    en: 'Mobile Number',
    kn: `ಮೊಬೈಲ್ ಸಂಖ್ಯೆ`,
  },
  email_address: {
    en: 'Email Address',
    kn: `ಇಮೇಲ್ ವಿಳಾಸ`,
  },
  msg_details: {
    en: 'Message / Inquiry Details',
    kn: `ಸಂದೇಶ / ವಿಚಾರಣೆ ವಿವರಗಳು`,
  },
  msg_placeholder: {
    en: 'Describe your inquiry (e.g. interest rates details, gold loan valuation)...',
    kn: `ನಿಮ್ಮ ವಿಚಾರಣೆಯನ್ನು ವಿವರಿಸಿ...`,
  },
  transmit_msg: {
    en: 'Transmit Inquiry Message',
    kn: `ಸಂದೇಶ ಕಳುಹಿಸಿ`,
  },
  inquiry_dispatched: {
    en: 'Inquiry Dispatched!',
    kn: `ವಿಚಾರಣೆ ರವಾನಿಸಲಾಗಿದೆ!`,
  },
  inquiry_success_desc: {
    en: 'Thank you for contacting Odiyooru Souharda Cooperative Society Ltd. A relationship executive will contact you on your registered mobile number shortly.',
    kn: `ಒಡಿಯೂರು ಸೌಹಾರ್ದ ಸಹಕಾರಿ ಸಂಘವನ್ನು ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.`,
  },
  submit_another: {
    en: 'Submit another message',
    kn: `ಮತ್ತೊಂದು ಸಂದೇಶ ಕಳುಹಿಸಿ`,
  },

  // --- BranchLocator ---
  branches_title: {
    en: 'Branches',
    kn: `ಶಾಖೆಗಳು`,
  },
  locator_subtitle: {
    en: 'Cooperative Network Branch Locator',
    kn: `ಸಹಕಾರಿ ನೆಟ್‌ವರ್ಕ್ ಶಾಖಾ ಶೋಧಕ`,
  },
  locator_desc: {
    en: 'Find the nearest society office or deposit collection hub in your city.',
    kn: `ನಿಮ್ಮ ಹತ್ತಿರದ ಶಾಖೆಯನ್ನು ಹುಡುಕಿ.`,
  },
  search_placeholder: {
    en: 'Search branch name, address, pin code...',
    kn: `ಶಾಖೆಯ ಹೆಸರು, ವಿಳಾಸ, ಪಿನ್ ಕೋಡ್ ಹುಡುಕಿ...`,
  },
  all_states: {
    en: 'All States',
    kn: `ಎಲ್ಲಾ ರಾಜ್ಯಗಳು`,
  },
  no_branches: {
    en: 'No cooperative branches found matching your filters.',
    kn: `ಯಾವುದೇ ಶಾಖೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.`,
  },
  central_hq_badge: {
    en: 'Central HQ',
    kn: `ಕೇಂದ್ರ ಕಚೇರಿ`,
  },

  // --- Calculators ---
  financial_tools: {
    en: 'Financial Tools',
    kn: `ಹಣಕಾಸು ಪರಿಕರಗಳು`,
  },
  interactive_calcs: {
    en: 'Interactive Financial Calculators',
    kn: `ಹಣಕಾಸು ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು`,
  },
  calcs_desc: {
    en: 'Map out your financial goals and estimate loan EMIs or investment maturity payouts with clear interest formulas.',
    kn: `ನಿಮ್ಮ ಹಣಕಾಸಿನ ಗುರಿಗಳನ್ನು ರೂಪಿಸಿ ಮತ್ತು ಸಾಲದ ಇಎಂಐ ಅಂದಾಜು ಮಾಡಿ.`,
  },
  loan_emi_tab: {
    en: 'Loan EMI',
    kn: `ಸಾಲದ ಇಎಂಐ`,
  },
  fd_tab: {
    en: 'Fixed Deposit (FD)',
    kn: `ನಿಶ್ಚಿತ ಠೇವಣಿ (FD)`,
  },
  rd_tab: {
    en: 'Recurring Deposit (RD)',
    kn: `ಆವರ್ತಕ ಠೇವಣಿ (RD)`,
  },
  elig_tab: {
    en: 'Loan Eligibility',
    kn: `ಸಾಲದ ಅರ್ಹತೆ`,
  },
  loan_principal: {
    en: 'Loan Principal',
    kn: `ಸಾಲದ ಮೊತ್ತ`,
  },
  interest_rate: {
    en: 'Interest Rate (% p.a.)',
    kn: `ಬಡ್ಡಿ ದರ (% ವಾರ್ಷಿಕ)`,
  },
  tenure_months: {
    en: 'Tenure (Months)',
    kn: `ಅವಧಿ (ತಿಂಗಳುಗಳು)`,
  },
  deposit_amt: {
    en: 'Deposit Amount',
    kn: `ಠೇವಣಿ ಮೊತ್ತ`,
  },
  tenure_years: {
    en: 'Tenure (Years)',
    kn: `ಅವಧಿ (ವರ್ಷಗಳು)`,
  },
  monthly_contrib: {
    en: 'Monthly Contribution',
    kn: `ಮಾಸಿಕ ಕೊಡುಗೆ`,
  },
  duration_years: {
    en: 'Duration (Years)',
    kn: `ಅವಧಿ (ವರ್ಷಗಳು)`,
  },
  net_salary: {
    en: 'Net Monthly Salary',
    kn: `ನಿವ್ವಳ ಮಾಸಿಕ ವೇತನ`,
  },
  existing_emi: {
    en: 'Existing Monthly EMI Outlays',
    kn: `ಪ್ರಸ್ತುತ ಮಾಸಿಕ ಇಎಂಐ`,
  },
  desired_tenure: {
    en: 'Loan Tenure Desired (Months)',
    kn: `ಅಪೇಕ್ಷಿತ ಸಾಲದ ಅವಧಿ (ತಿಂಗಳುಗಳು)`,
  },
  est_monthly_emi: {
    en: 'Estimated Monthly EMI',
    kn: `ಅಂದಾಜು ಮಾಸಿಕ ಇಎಂಐ`,
  },
  principal_amt: {
    en: 'Principal Amount:',
    kn: `ಅಸಲು ಮೊತ್ತ:`,
  },
  total_interest: {
    en: 'Total Interest Payable:',
    kn: `ಪಾವತಿಸಬೇಕಾದ ಒಟ್ಟು ಬಡ್ಡಿ:`,
  },
  total_payable: {
    en: 'Total Amount Payable:',
    kn: `ಪಾವತಿಸಬೇಕಾದ ಒಟ್ಟು ಮೊತ್ತ:`,
  },
  emi_pie_info: {
    en: 'Interest constitutes a portion of the total loan repayment amount.',
    kn: `ಬಡ್ಡಿಯು ಒಟ್ಟು ಸಾಲ ಮರುಪಾವತಿಯ ಭಾಗವಾಗಿದೆ.`,
  },
  maturity_wealth: {
    en: 'Maturity Wealth Value',
    kn: `ಮೆಚ್ಯೂರಿಟಿ ಮೌಲ್ಯ`,
  },
  invested_capital: {
    en: 'Invested Capital:',
    kn: `ಹೂಡಿಕೆ ಮಾಡಿದ ಬಂಡವಾಳ:`,
  },
  compound_acquired: {
    en: 'Compound Interest Acquired:',
    kn: `ಗಳಿಸಿದ ಚಕ್ರಬಡ್ಡಿ:`,
  },
  total_wealth: {
    en: 'Total Wealth Accumulation:',
    kn: `ಒಟ್ಟು ಸಂಪತ್ತು:`,
  },
  fd_rate_info: {
    en: 'Calculated with quarterly compounding, delivering better returns than simple monthly interest schemes.',
    kn: `ತ್ರೈಮಾಸಿಕ ಚಕ್ರಬಡ್ಡಿಯೊಂದಿಗೆ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.`,
  },
  est_wealth_maturity: {
    en: 'Estimated Wealth Maturity',
    kn: `ಅಂದಾಜು ಮೆಚ್ಯೂರಿಟಿ`,
  },
  total_outlay: {
    en: 'Total Outlay Deposited:',
    kn: `ಒಟ್ಟು ಠೇವಣಿ ಮೊತ್ತ:`,
  },
  interest_earned: {
    en: 'Interest Returns Earned:',
    kn: `ಗಳಿಸಿದ ಬಡ್ಡಿ ಆದಾಯ:`,
  },
  maturity_value: {
    en: 'Maturity Collection Value:',
    kn: `ಮೆಚ್ಯೂರಿಟಿ ಮೌಲ್ಯ:`,
  },
  rd_auto_info: {
    en: 'Auto-deduct instructions can be simulated inside your dashboard profile.',
    kn: `ಸ್ವಯಂ-ಕಡಿತ ಸೂಚನೆಗಳನ್ನು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಹೊಂದಿಸಬಹುದು.`,
  },
  est_eligible_loan: {
    en: 'Estimated Eligible Loan Sum',
    kn: `ಅಂದಾಜು ಅರ್ಹ ಸಾಲದ ಮೊತ್ತ`,
  },
  max_allowed_emi: {
    en: 'Maximum Allowed EMI cap:',
    kn: `ಗರಿಷ್ಠ ಅನುಮತಿಸಲಾದ ಇಎಂಐ:`,
  },
  debt_to_income: {
    en: 'Debt-to-Income Ratio:',
    kn: `ಸಾಲ ಮತ್ತು ಆದಾಯದ ಅನುಪಾತ:`,
  },
  loan_status: {
    en: 'Status:',
    kn: `ಸ್ಥಿತಿ:`,
  },
  loan_eligible: {
    en: 'Eligible to Apply',
    kn: `ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಅರ್ಹರು`,
  },
  loan_leveraged: {
    en: 'Leveraged Debt Cap Reached',
    kn: `ಸಾಲದ ಮಿತಿ ತಲುಪಿದೆ`,
  },
  loan_verify_info: {
    en: 'Subject to documentation audits, property appraisals, or gold assay valuations at branch counters.',
    kn: `ಶಾಖೆಯಲ್ಲಿ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.`,
  },

  // --- AIChatAssistant ---
  welcome_msg: {
    en: 'Namaste! Welcome to Odiyooru Souharda Cooperative Society Ltd Helpdesk. How may I assist you today with deposits, gold loans, or membership shares?',
    kn: `ನಮಸ್ಕಾರ! ಒಡಿಯೂರು ಸೌಹಾರ್ದ ಸಹಕಾರಿ ಸಂಘಕ್ಕೆ ಸ್ವಾಗತ. ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`,
  },
  chat_placeholder: {
    en: 'Ask anything about cooperative services...',
    kn: `ಸಹಕಾರಿ ಸೇವೆಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...`,
  },
  chat_suggest_fd: {
    en: 'FD Interest Rates',
    kn: `FD ಬಡ್ಡಿ ದರಗಳು`,
  },
  chat_suggest_gold: {
    en: 'Gold Loan Details',
    kn: `ಚಿನ್ನದ ಸಾಲದ ವಿವರಗಳು`,
  },
  chat_suggest_member: {
    en: 'Become a Member',
    kn: `ಸದಸ್ಯರಾಗಿ`,
  },
  chat_suggest_hours: {
    en: 'Branch Hours',
    kn: `ಶಾಖೆಯ ಸಮಯ`,
  },
  chat_title: {
    en: 'ICCS Digital Assistant',
    kn: `ICCS ಡಿಜಿಟಲ್ ಸಹಾಯಕ`,
  },
  chat_status: {
    en: 'Online Helpdesk • Simulated',
    kn: `ಆನ್‌ಲೈನ್ ಸಹಾಯವಾಣಿ`,
  },
  chat_resp_default: {
    en: "I apologize, but I didn't quite catch that. You can ask me about 'Fixed Deposit rates', 'how to apply for Gold Loans', 'society working hours', or 'membership dividend shares'.",
    kn: `ಕ್ಷಮಿಸಿ, ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ.`,
  },
  chat_resp_fd: {
    en: 'We offer a peak Fixed Deposit (FD) interest rate of 8.50% p.a. for general members, and an additional +0.50% premium (total 9.00% p.a.) for Senior Citizens and co-ownership shareholders. Interest is compounded quarterly.',
    kn: `ನಾವು FD ಮೇಲೆ 8.50% ವಾರ್ಷಿಕ ಬಡ್ಡಿ ನೀಡುತ್ತೇವೆ.`,
  },
  chat_resp_gold: {
    en: 'Our Gold Loans are sanctioned within 30 minutes at low cooperative rates starting from 8.50% p.a. Please carry your gold ornaments and KYC documents (Aadhaar & PAN) to the nearest branch for safe asset appraisals.',
    kn: `ಚಿನ್ನದ ಸಾಲಗಳನ್ನು ಕೇವಲ 30 ನಿಮಿಷಗಳಲ್ಲಿ ಮಂಜೂರು ಮಾಡಲಾಗುತ್ತದೆ.`,
  },
  chat_resp_member: {
    en: 'You can become an ICCS shareholder member by investing a minimum of ₹10,000 in society share capital. Benefits include democratic voting rights, up to 12% annual dividends, and subsidized loan rates!',
    kn: `ಕನಿಷ್ಠ ₹10,000 ಹೂಡಿಕೆ ಮಾಡುವ ಮೂಲಕ ನೀವು ಸದಸ್ಯರಾಗಬಹುದು.`,
  },
  chat_resp_hours: {
    en: 'Our branches operate from Monday to Saturday, 09:30 AM to 04:30 PM. Please note that we are closed on Sundays, national holidays, and the 2nd & 4th Saturdays of every month.',
    kn: `ನಮ್ಮ ಶಾಖೆಗಳು ಸೋಮವಾರದಿಂದ ಶನಿವಾರದವರೆಗೆ ತೆರೆದಿರುತ್ತವೆ.`,
  },
  chat_resp_kyc: {
    en: "You can complete your e-KYC document uploads directly from the 'e-KYC Services' section in the Member Dashboard by submitting digital copies of your Aadhaar Card and PAN Card.",
    kn: `ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ e-KYC ಪೂರ್ಣಗೊಳಿಸಬಹುದು.`,
  },
  chat_resp_hello: {
    en: 'Hello! How can I help you today? Ask me about FD interest rates, gold loans, or membership profiles.',
    kn: `ಹಲೋ! ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`,
  },

  // --- Login Page ---
  secure_banking: {
    en: 'Secure Cooperative Banking',
    kn: `ಸುರಕ್ಷಿತ ಬ್ಯಾಂಕಿಂಗ್`,
  },
  secure_banking_desc: {
    en: 'Log in to subscribe to high interest fixed deposits, disburse gold loans directly to your savings, or complete Aadhaar e-KYC validation.',
    kn: `ಸುರಕ್ಷಿತ ಠೇವಣಿಗಳು ಮತ್ತು ಸಾಲಗಳಿಗಾಗಿ ಲಾಗಿನ್ ಮಾಡಿ.`,
  },
  iso_cert: {
    en: 'Certified ISO-27001 secure credentials database.',
    kn: `ISO-27001 ಪ್ರಮಾಣೀಕೃತ ಡೇಟಾಬೇಸ್.`,
  },
  govt_regd_no: {
    en: 'Govt Regd No: MSCS/CR/312/2012',
    kn: `ಸರ್ಕಾರಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ: MSCS/CR/312/2012`,
  },
  welcome_back: {
    en: 'Welcome Back',
    kn: `ಮತ್ತೆ ಸ್ವಾಗತ`,
  },
  access_portal: {
    en: 'Access Member Portal',
    kn: `ಸದಸ್ಯ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ`,
  },
  password_login: {
    en: 'Password Login',
    kn: `ಪಾಸ್‌ವರ್ಡ್ ಲಾಗಿನ್`,
  },
  mobile_otp: {
    en: 'Mobile OTP',
    kn: `ಮೊಬೈಲ್ OTP`,
  },
  member_id_label: {
    en: 'Member ID or Email',
    kn: `ಸದಸ್ಯರ ID ಅಥವಾ ಇಮೇಲ್`,
  },
  password_label: {
    en: 'Secure Password',
    kn: `ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್`,
  },
  forgot_password: {
    en: 'Forgot Password?',
    kn: `ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?`,
  },
  remember_me: {
    en: 'Remember Me on this device',
    kn: `ಈ ಸಾಧನದಲ್ಲಿ ನೆನಪಿಡಿ`,
  },
  sign_in_btn: {
    en: 'Sign In To Account',
    kn: `ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ`,
  },
  authenticating: {
    en: 'Authenticating...',
    kn: `ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...`,
  },
  registered_mobile: {
    en: 'Registered Mobile Number',
    kn: `ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ`,
  },
  send_otp_btn: {
    en: 'Send Verification OTP',
    kn: `OTP ಕಳುಹಿಸಿ`,
  },
  sending_otp: {
    en: 'Sending OTP...',
    kn: `OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...`,
  },
  otp_code_label: {
    en: '6-Digit Verification Code',
    kn: `6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಕೋಡ್`,
  },
  verify_otp_btn: {
    en: 'Verify OTP & Log In',
    kn: `OTP ಪರಿಶೀಲಿಸಿ ಲಾಗಿನ್ ಮಾಡಿ`,
  },
  verifying_otp: {
    en: 'Verifying OTP...',
    kn: `OTP ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...`,
  },
  or_continue_with: {
    en: 'Or Continue With',
    kn: `ಅಥವಾ ಇದರೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ`,
  },
  google_login_btn: {
    en: 'Simulated Google Login',
    kn: `ಗೂಗಲ್ ಲಾಗಿನ್`,
  },
  google_fail: {
    en: 'Google simulation failure.',
    kn: `ಗೂಗಲ್ ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ.`,
  },
  invalid_credentials: {
    en: 'Invalid Credentials. Please use email: member@iccs.in and password: password or click OTP/Google demo shortcuts.',
    kn: `ಅಮಾನ್ಯ ಲಾಗಿನ್ ವಿವರಗಳು.`,
  },
  invalid_mobile: {
    en: 'Please enter a valid 10-digit mobile number.',
    kn: `ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.`,
  },
  otp_dispatch_error: {
    en: 'Could not dispatch OTP verification.',
    kn: `OTP ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.`,
  },
  invalid_otp_len: {
    en: 'Please enter a valid 6-digit code.',
    kn: `ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 6-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ.`,
  },
  invalid_otp_val: {
    en: 'Invalid OTP Verification code. Please enter 123456 or 111111 for simulated access.',
    kn: `ಅಮಾನ್ಯ OTP ಕೋಡ್.`,
  },
  otp_verify_error: {
    en: 'Could not verify OTP token.',
    kn: `OTP ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.`,
  },
  new_to_society: {
    en: 'New to the Credit Society? Please contact your nearest cooperative branch to open an account.',
    kn: `ಸಂಘಕ್ಕೆ ಹೊಸಬರೇ? ಖಾತೆ ತೆರೆಯಲು ಹತ್ತಿರದ ಶಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.`,
  },

  // --- Inline App sections ---
  about_title: {
    en: 'About Our Cooperative',
    kn: `ನಮ್ಮ ಸಹಕಾರ ಸಂಘದ ಬಗ್ಗೆ`,
  },
  about_subtitle: {
    en: 'Our Heritage & Trust',
    kn: `ನಮ್ಮ ಪರಂಪರೆ ಮತ್ತು ವಿಶ್ವಾಸ`,
  },
  about_desc: {
    en: 'Established under Multi-State Cooperative Societies statutes, the Odiyooru Souharda Cooperative Society Ltd is a premier financial institution. We empower over 50,000+ members through high dividend-yielding deposits and subsidized micro-credit channels.',
    kn: `50,000 ಕ್ಕೂ ಹೆಚ್ಚು ಸದಸ್ಯರಿಗೆ ಸೇವೆ ಸಲ್ಲಿಸುತ್ತಿರುವ ಪ್ರಮುಖ ಆರ್ಥಿಕ ಸಂಸ್ಥೆ.`,
  },
  board_governance: {
    en: 'Board of Governance',
    kn: `ಆಡಳಿತ ಮಂಡಳಿ`,
  },
  board_c_name: {
    en: 'Shri Rajesh Kumar Sharma',
    kn: `ಶ್ರೀ ರಾಜೇಶ್ ಕುಮಾರ್ ಶರ್ಮಾ`,
  },
  board_c_role: {
    en: 'Chairman',
    kn: `ಅಧ್ಯಕ್ಷರು`,
  },
  board_c_bio: {
    en: 'Over 25 years of cooperative credit experience. Leading strategic expansion on PAN India scale.',
    kn: `25 ವರ್ಷಗಳ ಅನುಭವ.`,
  },
  board_vc_name: {
    en: 'Dr. Sunita Devi Yadav',
    kn: `ಡಾ. ಸುನಿತಾ ದೇವಿ ಯಾದವ್`,
  },
  board_vc_role: {
    en: 'Vice Chairperson',
    kn: `ಉಪಾಧ್ಯಕ್ಷರು`,
  },
  board_vc_bio: {
    en: 'Academician and micro-finance expert. Overseeing rural literacy and development programs.',
    kn: `ಮೈಕ್ರೋ ಫೈನಾನ್ಸ್ ತಜ್ಞರು.`,
  },
  board_md_name: {
    en: 'Shri Anirudh R. Deshmukh',
    kn: `ಶ್ರೀ ಅನಿರುದ್ಧ್ ಆರ್. ದೇಶಮುಖ್`,
  },
  board_md_role: {
    en: 'Managing Director',
    kn: `ವ್ಯವಸ್ಥಾಪಕ ನಿರ್ದೇಶಕರು`,
  },
  board_md_bio: {
    en: 'Fintech pioneer and risk manager. Directing the bank digital transition and ledger compliance.',
    kn: `ಫಿನ್ಟೆಕ್ ಮತ್ತು ರಿಸ್ಕ್ ಮ್ಯಾನೇಜರ್.`,
  },
  democratic_governance: {
    en: 'Democratic Governance',
    kn: `ಪ್ರಜಾಸತ್ತಾತ್ಮಕ ಆಡಳಿತ`,
  },
  democratic_desc: {
    en: 'Member-controlled board with pro-rata voting rights and transparent financial disclosure sheets.',
    kn: `ಸದಸ್ಯ-ನಿಯಂತ್ರಿತ ಮಂಡಳಿ.`,
  },
  asset_security: {
    en: 'Asset Security',
    kn: `ಆಸ್ತಿ ಭದ್ರತೆ`,
  },
  asset_desc: {
    en: 'Rigorous audits, capital reserves protection, and safe vaults keeping systems.',
    kn: `ಕಟ್ಟುನಿಟ್ಟಾದ ಆಡಿಟ್‌ಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ವ್ಯವಸ್ಥೆಗಳು.`,
  },
  community_growth: {
    en: 'Community Growth',
    kn: `ಸಮುದಾಯದ ಬೆಳವಣಿಗೆ`,
  },
  community_desc: {
    en: 'Reinvesting interest profits to finance gold loans and local micro-entrepreneurs.',
    kn: `ಸ್ಥಳೀಯ ಸಣ್ಣ ಉದ್ಯಮಿಗಳಿಗೆ ಬೆಂಬಲ.`,
  },

  // --- Dynamic Dashboard & Others ---
  virtual_fd_title: {
    en: 'Simulated Online FD Portal',
    kn: `ಆನ್‌ಲೈನ್ FD ಪೋರ್ಟಲ್`,
  },
  account_overview: {
    en: 'Account Overview',
    kn: `ಖಾತೆ ಅವಲೋಕನ`,
  },
  savings_balance: {
    en: 'Savings Balance',
    kn: `ಉಳಿತಾಯ ಬ್ಯಾಲೆನ್ಸ್`,
  },
  active_deposits: {
    en: 'Active Deposits',
    kn: `ಸಕ್ರಿಯ ಠೇವಣಿಗಳು`,
  },
  loan_outstandings: {
    en: 'Loan Outstandings',
    kn: `ಬಾಕಿ ಇರುವ ಸಾಲಗಳು`,
  },
  member_profile: {
    en: 'Member Profile',
    kn: `ಸದಸ್ಯರ ಪ್ರೊಫೈಲ್`,
  },
  ekyc_status: {
    en: 'e-KYC Status',
    kn: `e-KYC ಸ್ಥಿತಿ`,
  },
  kyc_verified: {
    en: 'Verified',
    kn: `ಪರಿಶೀಲಿಸಲಾಗಿದೆ`,
  },
  kyc_pending: {
    en: 'Pending',
    kn: `ಬಾಕಿ ಇದೆ`,
  },
  kyc_unsubmitted: {
    en: 'Unsubmitted',
    kn: `ಸಲ್ಲಿಸಿಲ್ಲ`,
  },
  upload_docs_btn: {
    en: 'Upload Documents',
    kn: `ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ`,
  },
  open_fd_btn: {
    en: 'Open Fixed Deposit',
    kn: `ನಿಶ್ಚಿತ ಠೇವಣಿ ತೆರೆಯಿರಿ`,
  },
  apply_loan_btn: {
    en: 'Apply For Loan',
    kn: `ಸಾಲಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ`,
  },
  deposit_list_hdr: {
    en: 'Your Asset Portfolio Deposits',
    kn: `ನಿಮ್ಮ ಠೇವಣಿ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ`,
  },
  loan_list_hdr: {
    en: 'Active Loan Accounts',
    kn: `ಸಕ್ರಿಯ ಸಾಲ ಖಾತೆಗಳು`,
  },
  transaction_history_hdr: {
    en: 'Recent Simulated Ledger Transactions',
    kn: `ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು`,
  },
  amount_in_inr: {
    en: 'Amount (INR)',
    kn: `ಮೊತ್ತ (INR)`,
  },
  maturity_term: {
    en: 'Maturity Term',
    kn: `ಮೆಚ್ಯೂರಿಟಿ ಅವಧಿ`,
  },
  status_hdr: {
    en: 'Status',
    kn: `ಸ್ಥಿತಿ`,
  },
  accrued_int_label: {
    en: 'Accrued Interest',
    kn: `ಕೂಡಿದ ಬಡ್ಡಿ`,
  },
  pay_emi_btn: {
    en: 'Pay Monthly EMI',
    kn: `ಮಾಸಿಕ ಇಎಂಐ ಪಾವತಿಸಿ`,
  },
  emi_paid_status: {
    en: 'Paid EMI: {count} Months',
    kn: `ಪಾವತಿಸಿದ ಇಎಂಐ: {count} ತಿಂಗಳುಗಳು`,
  },
  welcome_user: {
    en: 'Namaste, {name}',
    kn: `ನಮಸ್ಕಾರ, {name}`,
  },
  member_id_value: {
    en: 'Member ID: {id}',
    kn: `ಸದಸ್ಯ ID: {id}`,
  },

  // --- Dynamic Product Catalog ---
  daily_deposit_name: {
    en: 'Daily Deposit',
    kn: `ದೈನಂದಿನ ಠೇವಣಿ`,
  },
  daily_deposit_desc: {
    en: 'Ideal scheme for micro-merchants and small businesses. Daily collections collected directly from your storefront.',
    kn: `ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳಿಗೆ ದೈನಂದಿನ ಠೇವಣಿ.`,
  },
  mis_name: {
    en: 'Monthly Income Scheme',
    kn: `ಮಾಸಿಕ ಆದಾಯ ಯೋಜನೆ`,
  },
  mis_desc: {
    en: 'Deposit a lump sum and receive fixed monthly interest payouts straight to your savings account.',
    kn: `ನಿಮ್ಮ ಉಳಿತಾಯ ಖಾತೆಗೆ ನೇರವಾಗಿ ಮಾಸಿಕ ಬಡ್ಡಿ.`,
  },
  share_capital_name: {
    en: 'Share Capital',
    kn: `ಷೇರು ಬಂಡವಾಳ`,
  },
  share_capital_desc: {
    en: 'Invest in the capital shares of our society, earn annual dividends, and gain legal voting rights.',
    kn: `ಸಂಘದ ಷೇರುಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿ ವಾರ್ಷಿಕ ಲಾಭಾಂಶ ಪಡೆಯಿರಿ.`,
  },
  vehicle_name: {
    en: 'Vehicle Loan',
    kn: `ವಾಹನ ಸಾಲ`,
  },
  vehicle_desc: {
    en: 'Drive your dream car or two-wheeler home with cheap monthly EMIs and flexible payoff schedules.',
    kn: `ಕಡಿಮೆ ಇಎಂಐ ಮೂಲಕ ವಾಹನ ಸಾಲ.`,
  },
  personal_name: {
    en: 'Personal Loan',
    kn: `ವೈಯಕ್ತಿಕ ಸಾಲ`,
  },
  personal_desc: {
    en: 'Simulate personal financial security for weddings, travel, medical needs, or retail consolidation.',
    kn: `ವೈಯಕ್ತಿಕ ಅಗತ್ಯಗಳಿಗಾಗಿ ಸಾಲ.`,
  },
  education_name: {
    en: 'Education Loan',
    kn: `ಶಿಕ್ಷಣ ಸಾಲ`,
  },
  education_desc: {
    en: 'Empower your child higher educational goals in top Indian and international universities with low interest rates.',
    kn: `ಕಡಿಮೆ ಬಡ್ಡಿ ದರದಲ್ಲಿ ಶಿಕ್ಷಣ ಸಾಲ.`,
  },
  housing_name: {
    en: 'Housing Loan',
    kn: `ಗೃಹ ಸಾಲ`,
  },
  housing_desc: {
    en: 'Build or purchase your dream house with affordable cooperative society home loan schemes.',
    kn: `ಕೈಗೆಟುಕುವ ಗೃಹ ಸಾಲ ಯೋಜನೆಗಳು.`,
  },


  // --- Footer Section ---
  footer_bio: {
    en: 'We have various strategic partnerships and alliances with eminent Indian and global companies which cater to various aspects of our daily operations on PAN India scale. Not only do these partnerships widen our business platform but they also lay a foundation for a sustainable future.',
    kn: `ನಾವು ಪ್ರಮುಖ ಭಾರತೀಯ ಮತ್ತು ಜಾಗತಿಕ ಕಂಪನಿಗಳೊಂದಿಗೆ ಕಾರ್ಯತಂತ್ರದ ಪಾಲುದಾರಿಕೆಯನ್ನು ಹೊಂದಿದ್ದೇವೆ.`,
  },
  quick_links: {
    en: 'Quick Links',
    kn: `ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು`,
  },
  footer_prod_title: {
    en: 'Products',
    kn: `ಉತ್ಪನ್ನಗಳು`,
  },
  copyright: {
    en: 'Copyright © 2026 Odiyooru Souharda Cooperative Society Ltd. All rights reserved.',
    kn: `ಕೃತಿಸ್ವಾಮ್ಯ © 2026 ಒಡಿಯೂರು ಸೌಹಾರ್ದ ಸಹಕಾರಿ ಸಂಘ ನಿಯಮಿತ.`,
  },
  'Secure Login': {
    en: 'Secure Login',
    kn: 'ಸುರಕ್ಷಿತ ಲಾಗಿನ್'
  },
  'Member Registration': {
    en: 'Member Registration',
    kn: 'ಸದಸ್ಯ ನೋಂದಣಿ'
  },
  'Password Recovery': {
    en: 'Password Recovery',
    kn: 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಪಡೆಯುವಿಕೆ'
  },
  'Set New Password': {
    en: 'Set New Password',
    kn: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ'
  },
  'Full Name': {
    en: 'Full Name',
    kn: 'ಪೂರ್ಣ ಹೆಸರು'
  },
  'Mobile Number': {
    en: 'Mobile Number',
    kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'
  },
  'Email Address': {
    en: 'Email Address',
    kn: 'ಇಮೇಲ್ ವಿಳಾಸ'
  },
  'Password': {
    en: 'Password',
    kn: 'ಪಾಸ್‌ವರ್ಡ್'
  },
  'New Password': {
    en: 'New Password',
    kn: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್'
  },
  'Confirm Password': {
    en: 'Confirm Password',
    kn: 'ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ'
  },
  'Remember me': {
    en: 'Remember me',
    kn: 'ನನ್ನನ್ನು ನೆನಪಿಡಿ'
  },
  'Forgot Password?': {
    en: 'Forgot Password?',
    kn: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?'
  },
  'Log in Securely': {
    en: 'Log in Securely',
    kn: 'ಸುರಕ್ಷಿತವಾಗಿ ಲಾಗಿನ್ ಮಾಡಿ'
  },
  'Register Account': {
    en: 'Register Account',
    kn: 'ಖಾತೆ ನೋಂದಾಯಿಸಿ'
  },
  'Send Reset Link': {
    en: 'Send Reset Link',
    kn: 'ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ'
  },
  'Update Password': {
    en: 'Update Password',
    kn: 'ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ'
  },
  "Don't have an account?": {
    en: "Don't have an account?",
    kn: 'ಖಾತೆ ಇಲ್ಲವೇ?'
  },
  'Already have an account?': {
    en: 'Already have an account?',
    kn: 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?'
  },
  'Sign up': {
    en: 'Sign up',
    kn: 'ಸೈನ್ ಅಪ್'
  },
  'Log in': {
    en: 'Log in',
    kn: 'ಲಾಗಿನ್'
  },
  'Back to Log in': {
    en: 'Back to Log in',
    kn: 'ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ'
  },
  'Continue with Google': {
    en: 'Continue with Google',
    kn: 'ಗೂಗಲ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'
  },
  'Active Customer Portal': {
    en: 'Active Customer Portal',
    kn: 'ಸಕ್ರಿಯ ಗ್ರಾಹಕ ಪೋರ್ಟಲ್'
  },
  'Customer ID:': {
    en: 'Customer ID:',
    kn: 'ಗ್ರಾಹಕ ಐಡಿ:'
  },
  'Customer ID': {
    en: 'Customer ID',
    kn: 'ಗ್ರಾಹಕ ಐಡಿ'
  },
  'Return to Website': {
    en: 'Return to Website',
    kn: 'ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ'
  },
  'View Products': {
    en: 'View Products',
    kn: 'ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
  },
  'Digital Membership Card': {
    en: 'Digital Membership Card',
    kn: 'ಡಿಜಿಟಲ್ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್'
  },
  'Official society shareholder ID. Keep this secure.': {
    en: 'Official society shareholder ID. Keep this secure.',
    kn: 'ಅಧಿಕೃತ ಸಂಘದ ಷೇರುದಾರರ ಐಡಿ. ಇದನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.'
  },
  'Account Details': {
    en: 'Account Details',
    kn: 'ಖಾತೆ ವಿವರಗಳು'
  },
  'Registered Branch': {
    en: 'Registered Branch',
    kn: 'ನೋಂದಾಯಿತ ಶಾಖೆ'
  },
  'Odiyooru Main Branch': {
    en: 'Odiyooru Main Branch',
    kn: 'ಒಡಿಯೂರು ಮುಖ್ಯ ಶಾಖೆ'
  },
  'Need Assistance?': {
    en: 'Need Assistance?',
    kn: 'ಸಹಾಯ ಬೇಕೇ?'
  },
  'Our support team is available 24/7 to help you with your account inquiries, branch details, and general services.': {
    en: 'Our support team is available 24/7 to help you with your account inquiries, branch details, and general services.',
    kn: 'ನಿಮ್ಮ ಖಾತೆ ವಿಚಾರಣೆಗಳು, ಶಾಖೆಯ ವಿವರಗಳು ಮತ್ತು ಸಾಮಾನ್ಯ ಸೇವೆಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಮ್ಮ ಬೆಂಬಲ ತಂಡ 24/7 ಲಭ್ಯವಿದೆ.'
  },
  'Contact Support': {
    en: 'Contact Support',
    kn: 'ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ'
  },
  'Please enter a valid phone number starting with 6-9': {
    en: 'Please enter a valid phone number starting with 6-9',
    kn: 'ದಯವಿಟ್ಟು 6-9 ರಿಂದ ಪ್ರಾರಂಭವಾಗುವ ಮಾನ್ಯವಾದ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
  },
  'Phone number must be exactly 10 digits': {
    en: 'Phone number must be exactly 10 digits',
    kn: 'ಫೋನ್ ಸಂಖ್ಯೆ ನಿಖರವಾಗಿ 10 ಅಂಕೆಗಳನ್ನು ಹೊಂದಿರಬೇಕು'
  },
  'Secure Deposits': {
    en: 'Secure Deposits',
    kn: 'ಸುರಕ್ಷಿತ ಠೇವಣಿಗಳು'
  },
  'High Returns': {
    en: 'High Returns',
    kn: 'ಹೆಚ್ಚಿನ ಆದಾಯ'
  },
  'Years of': {
    en: 'Years of',
    kn: 'ವರ್ಷಗಳ'
  },
  'Excellence': {
    en: 'Excellence',
    kn: 'ಶ್ರೇಷ್ಠತೆ'
  },
  'Active': {
    en: 'Active',
    kn: 'ಸಕ್ರಿಯ'
  },
  'Members': {
    en: 'Members',
    kn: 'ಸದಸ್ಯರು'
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


