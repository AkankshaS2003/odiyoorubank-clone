/**
 * Centralized banking calculation service.
 * Implements the exact same formulas used by the UI and controllers.
 */

/**
 * Calculates Loan EMI, total interest, and total repayment
 * @param {number} principal 
 * @param {number} annualRate 
 * @param {number} tenureMonths 
 * @returns {object} { emi, totalInterest, totalRepayment }
 */
const calculateLoanEMI = (principal, annualRate, tenureMonths) => {
  const P = Number(principal);
  const rate = Number(annualRate);
  const n = Number(tenureMonths);

  if (isNaN(P) || isNaN(rate) || isNaN(n) || P <= 0 || n <= 0) {
    return { emi: 0, totalInterest: 0, totalRepayment: 0 };
  }

  if (rate <= 0) {
    const emi = Math.round(P / n);
    return {
      emi,
      totalInterest: 0,
      totalRepayment: P
    };
  }

  const r = rate / 12 / 100;
  const emi = Math.round(
    (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  );
  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  return {
    emi,
    totalInterest,
    totalRepayment
  };
};

/**
 * Calculates Fixed Deposit (FD) interest and maturity value (Quarterly Compounding)
 * @param {number} principal 
 * @param {number} annualRate 
 * @param {number} tenureMonths 
 * @returns {object} { interestEarned, maturityAmount }
 */
const calculateFD = (principal, annualRate, tenureMonths) => {
  const P = Number(principal);
  const rate = Number(annualRate);
  const months = Number(tenureMonths);

  if (isNaN(P) || isNaN(rate) || isNaN(months) || P <= 0 || months <= 0) {
    return { interestEarned: 0, maturityAmount: 0 };
  }

  const r = rate / 100;
  const t = months / 12;
  const n = 4; // Quarterly compounding

  const maturityAmount = Math.round(P * Math.pow(1 + r / n, n * t));
  const interestEarned = Math.max(0, maturityAmount - P);

  return {
    interestEarned,
    maturityAmount
  };
};

/**
 * Calculates Recurring Deposit (RD) total deposited, interest and maturity value
 * @param {number} monthlyAmount 
 * @param {number} annualRate 
 * @param {number} tenureMonths 
 * @returns {object} { totalDeposited, interestEarned, maturityAmount }
 */
const calculateRD = (monthlyAmount, annualRate, tenureMonths) => {
  const P = Number(monthlyAmount);
  const rate = Number(annualRate);
  const months = Number(tenureMonths);

  if (isNaN(P) || isNaN(rate) || isNaN(months) || P <= 0 || months <= 0) {
    return { totalDeposited: 0, interestEarned: 0, maturityAmount: 0 };
  }

  const r = rate / 100;
  const totalDeposited = P * months;
  let maturityAmount = 0;

  for (let i = 1; i <= months; i++) {
    const tRemainder = (months - i + 1) / 12;
    // Indian standard for RD compounding is quarterly
    maturityAmount += P * Math.pow(1 + r / 4, 4 * tRemainder);
  }

  maturityAmount = Math.round(maturityAmount);
  const interestEarned = Math.max(0, maturityAmount - totalDeposited);

  return {
    totalDeposited,
    interestEarned,
    maturityAmount
  };
};

module.exports = {
  calculateLoanEMI,
  calculateFD,
  calculateRD
};
