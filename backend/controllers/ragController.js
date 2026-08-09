const { getEmbedding } = require('../services/embeddingService');
const { retrieveDocuments } = require('../services/retrievalService');
const { understandQuery, generateResponse } = require('../services/geminiService');
const { calculateLoanEMI, calculateFD, calculateRD } = require('../services/calculatorService');

// Models
const SystemSettings = require('../models/SystemSettings');
const KnowledgeBase = require('../models/KnowledgeBase');
const SavingsAccount = require('../models/SavingsAccount');
const FixedDeposit = require('../models/FixedDeposit');
const RecurringDeposit = require('../models/RecurringDeposit');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const SavingsTransaction = require('../models/SavingsTransaction');
const Membership = require('../models/Membership');
const ChatHistory = require('../models/ChatHistory');

// @desc    Interact with the AI Banking Assistant
// @route   POST /api/chat
// @access  Public / Private (Resolved optional req.user)
const handleChat = async (req, res, next) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a valid question' });
    }

    // 1. Query Understanding & Classification (Intent Router)
    const { intent, extractedParams, rewrittenQuery } = await understandQuery(question, history);

    // Development diagnostic logs
    console.log(`[RAG Diagnostic] Query: "${question}"`);
    console.log(`[RAG Diagnostic] Rewritten Query: "${rewrittenQuery}"`);
    console.log(`[RAG Diagnostic] Intent: ${intent}`);
    console.log(`[RAG Diagnostic] Params: ${JSON.stringify(extractedParams)}`);

    // 2. Fetch SystemSettings for configured rates and web rules
    const systemSettings = await SystemSettings.findOne();

    // 3. Process according to intent
    let customerData = null;
    let calculationResult = null;
    let retrievedDocs = [];

    // CUSTOMER_SPECIFIC_QUERY Intent
    if (intent === 'CUSTOMER_SPECIFIC_QUERY' || intent === 'TRANSACTION_QUERY') {
      if (!req.user) {
        customerData = { error: "You are not logged in. Please log in to your account first to access your personalized balances, deposit accounts, loan details, or transaction history." };
      } else {
        customerData = {};
        const userId = req.user._id;

        // Fetch Savings Account
        const savingsAccount = await SavingsAccount.findOne({ userId });
        if (savingsAccount) {
          customerData.savingsAccount = {
            accountNumber: savingsAccount.accountNumber,
            balance: savingsAccount.balance,
            status: savingsAccount.status
          };
        }

        // Fetch Membership Details
        const membership = await Membership.findOne({ userId });
        if (membership) {
          customerData.membership = {
            memberNumber: membership.memberNumber,
            status: membership.status,
            shareCapital: membership.shareCapital,
            numberOfShares: membership.numberOfShares
          };
        }

        // Fetch Fixed Deposits
        const fds = await FixedDeposit.find({ userId });
        if (fds && fds.length > 0) {
          customerData.fixedDeposits = fds.map(fd => ({
            fdNumber: fd.fdNumber,
            principalAmount: fd.principalAmount,
            interestRate: fd.interestRate,
            maturityAmount: fd.maturityAmount,
            maturityDate: fd.maturityDate,
            status: fd.status
          }));
        }

        // Fetch Recurring Deposits
        const rds = await RecurringDeposit.find({ userId });
        if (rds && rds.length > 0) {
          customerData.recurringDeposits = rds.map(rd => ({
            rdNumber: rd.rdNumber,
            monthlyAmount: rd.monthlyAmount,
            interestRate: rd.interestRate,
            maturityAmount: rd.maturityAmount,
            maturityDate: rd.maturityDate,
            status: rd.status
          }));
        }

        // Fetch Loan Details
        const loans = await Loan.find({ userId });
        if (loans && loans.length > 0) {
          customerData.loans = loans.map(loan => ({
            loanNumber: loan.loanNumber,
            loanType: loan.loanType,
            sanctionedAmount: loan.sanctionedAmount,
            interestRate: loan.interestRate,
            outstandingAmount: loan.outstandingAmount,
            status: loan.status
          }));
        }

        // Fetch Transactions if requested
        if (intent === 'TRANSACTION_QUERY' || question.toLowerCase().includes('transaction') || question.toLowerCase().includes('history') || question.toLowerCase().includes('statement')) {
          const savingsTxns = await SavingsTransaction.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
          const generalTxns = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();

          // Merge and sort
          const allTxns = [
            ...savingsTxns.map(t => ({
              date: t.createdAt,
              type: t.type,
              amount: t.creditAmount > 0 ? t.creditAmount : -t.debitAmount,
              description: t.description,
              reference: t.referenceNumber,
              channel: 'Savings Account'
            })),
            ...generalTxns.map(t => ({
              date: t.createdAt,
              type: t.type,
              amount: t.amount,
              description: t.remarks || t.type,
              reference: t.referenceNumber,
              channel: t.paymentChannel
            }))
          ];

          allTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
          customerData.recentTransactions = allTxns.slice(0, 5);
        }
      }
    }

    // Calculation Intents
    if (intent === 'LOAN_CALCULATION' || intent === 'FD_CALCULATION' || intent === 'RD_CALCULATION') {
      const p = extractedParams || {};
      
      if (intent === 'LOAN_CALCULATION') {
        const loanType = p.loanType || 'Housing Loan';
        
        // Find configuration rate
        let rate = p.interestRate;
        if (!rate && systemSettings) {
          const keyMap = {
            'Housing Loan': 'housingLoanRate',
            'Gold Loan': 'goldLoanRate',
            'Vehicle Loan': 'vehicleLoanRate',
            'Personal Loan': 'personalLoanRate',
            'Educational Loan': 'educationalLoanRate',
            'Agricultural Loan': 'agriculturalLoanRate'
          };
          rate = systemSettings[keyMap[loanType]] || systemSettings.personalLoanRate || 10.5;
        }

        const amount = p.amount;
        const tenureMonths = p.tenureMonths;

        if (!amount || !tenureMonths) {
          calculationResult = {
            error: "missing_parameters",
            missing: !amount && !tenureMonths ? ["Amount", "Tenure"] : !amount ? ["Amount"] : ["Tenure"],
            loanType,
            interestRate: rate
          };
        } else {
          const res = calculateLoanEMI(amount, rate, tenureMonths);
          calculationResult = {
            loanType,
            principal: amount,
            tenureMonths,
            interestRate: rate,
            ...res
          };
        }
      } else if (intent === 'FD_CALCULATION') {
        const amount = p.amount;
        const tenureMonths = p.tenureMonths;
        const rate = p.interestRate || (systemSettings ? systemSettings.fdRate : 8.5);

        if (!amount || !tenureMonths) {
          calculationResult = {
            error: "missing_parameters",
            missing: !amount && !tenureMonths ? ["Amount", "Tenure"] : !amount ? ["Amount"] : ["Tenure"],
            interestRate: rate
          };
        } else {
          const res = calculateFD(amount, rate, tenureMonths);
          calculationResult = {
            principal: amount,
            tenureMonths,
            interestRate: rate,
            ...res
          };
        }
      } else if (intent === 'RD_CALCULATION') {
        const monthlyAmount = p.monthlyAmount || p.amount; // fallback if amount is parsed instead of monthlyAmount
        const tenureMonths = p.tenureMonths;
        const rate = p.interestRate || (systemSettings ? systemSettings.rdRate : 7.75);

        if (!monthlyAmount || !tenureMonths) {
          calculationResult = {
            error: "missing_parameters",
            missing: !monthlyAmount && !tenureMonths ? ["Monthly Installment Amount", "Tenure"] : !monthlyAmount ? ["Monthly Installment Amount"] : ["Tenure"],
            interestRate: rate
          };
        } else {
          const res = calculateRD(monthlyAmount, rate, tenureMonths);
          calculationResult = {
            monthlyAmount,
            tenureMonths,
            interestRate: rate,
            ...res
          };
        }
      }
    }

    // Always fetch RAG context documents for general knowledge
    try {
      const embedding = await getEmbedding(rewrittenQuery);
      retrievedDocs = await retrieveDocuments(embedding, 5, rewrittenQuery);

      if (retrievedDocs && retrievedDocs.length > 0) {
        retrievedDocs.sort((a, b) => (b.score || 0) - (a.score || 0));
      }
    } catch (ragError) {
      console.warn('[RAG Fallback] Failed to retrieve context documents via vector. Using keyword fallback.', ragError.message);
      try {
        const excludeWords = ['what','when','where','how','are','the','this','that','bank','banks','banking','cooperative','society','odiyooru'];
        const words = rewrittenQuery.split(' ').filter(w => w.length > 3 && !excludeWords.includes(w.toLowerCase()));
        if (words.length > 0) {
           const regexStr = words.join('|');
           const fallbackDocs = await KnowledgeBase.find({ content: { $regex: regexStr, $options: 'i' } }).limit(2);
           retrievedDocs = fallbackDocs.map(d => ({ title: d.title, source: d.source, category: d.category, content: d.content, score: 0.5 }));
        } else {
           retrievedDocs = [];
        }
      } catch(e) {
        console.error("Keyword fallback failed:", e);
        retrievedDocs = [];
      }
    }

    // Early exit for out of scope questions
    if (intent === 'UNKNOWN') {
      return res.status(200).json({
        success: true,
        data: {
          answer: "Not a valid question, ask me only bank related questions.",
          sources: [],
          meta: {
            sourceType: "Intent Router",
            intent: "UNKNOWN",
            calculationUsed: false,
            fallbackUsed: false
          }
        }
      });
    }

    // 4. Generate finalized answer using Gemini 2.5 Flash
    const answer = await generateResponse(question, retrievedDocs, {
      systemSettings,
      customerData,
      calculationResult
    });

    // 5. Build source citations array
    const sources = [];
    
    // Add RAG documents to sources
    if (retrievedDocs && retrievedDocs.length > 0) {
      retrievedDocs.forEach(doc => {
        sources.push({
          title: doc.title,
          category: doc.category,
          source: doc.source,
          score: doc.score
        });
      });
    }

    // Add website configuration or calculation engine source
    if (calculationResult && !calculationResult.error) {
      sources.push({
        title: "Cooperative Bank Calculation Engine",
        category: "Calculator",
        source: "backend_calc_service"
      });
    }
    if (systemSettings) {
      sources.push({
        title: "Bank Settings & Configured Rates",
        category: "System Settings",
        source: "system_settings_db"
      });
    }
    if (customerData && !customerData.error) {
      sources.push({
        title: "Secure Account Database Services",
        category: "Personal Data",
        source: "account_db_service"
      });
    }

    // Filter duplicate sources by title for a cleaner citation UX
    const uniqueSources = [];
    const seenTitles = new Set();
    for (const src of sources) {
      if (!seenTitles.has(src.title)) {
        seenTitles.add(src.title);
        uniqueSources.push(src);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        answer,
        sources: uniqueSources,
        meta: {
          sourceType: retrievedDocs.length > 0 && calculationResult ? "RAG + Calculation Engine" : retrievedDocs.length > 0 ? "RAG" : calculationResult ? "Calculation Engine" : "Offline Fallback",
          intent,
          calculationUsed: !!calculationResult && !calculationResult.error,
          fallbackUsed: retrievedDocs.length === 0 && !calculationResult
        }
      }
    });

  } catch (error) {
    console.error('Error in handleChat controller:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your banking query.'
    });
  }
};

// @desc    Retrieve user's conversation logs
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res, next) => {
  try {
    const history = await ChatHistory.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to past 50 exchanges to optimize performance

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error in getChatHistory controller:', error);
    next(error);
  }
};

// @desc    Debug RAG Pipeline
// @route   GET /api/chat/debug
// @access  Public / Private
const debugChat = async (req, res, next) => {
  try {
    const question = req.query.question;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Provide a question parameter.' });
    }

    // 1. Intent Extraction
    const { intent, extractedParams, rewrittenQuery } = await understandQuery(question, []);
    
    // 2. Mock system settings
    const systemSettings = await SystemSettings.findOne();

    // 3. Document Retrieval
    let retrievedDocs = [];
    try {
      const embedding = await getEmbedding(rewrittenQuery);
      retrievedDocs = await retrieveDocuments(embedding, 3, rewrittenQuery);
    } catch (err) {
      // Offline fallback
    }

    res.status(200).json({
      success: true,
      diagnostic_trace: {
        query: question,
        rewrittenQuery,
        intent,
        extractedParams,
        documents_found: retrievedDocs.length,
        documents: retrievedDocs.map(d => ({ title: d.title, score: d.score, category: d.category })),
        fallbackActive: retrievedDocs.length === 0,
        system_rates: {
          housing: systemSettings?.housingLoanRate,
          gold: systemSettings?.goldLoanRate,
          fd: systemSettings?.fdRate,
          rd: systemSettings?.rdRate
        }
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  handleChat,
  getChatHistory,
  debugChat
};
