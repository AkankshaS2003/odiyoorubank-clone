from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Smart Loan Eligibility API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanRequest(BaseModel):
    income: float
    existing_emi: float
    expenses: float
    age: int
    occupation: str
    loanType: str
    savings: float = 0.0

class LoanResponse(BaseModel):
    eligibilityScore: int
    maxLoanAmount: float
    recommendedLoans: List[str]
    riskLevel: str
    monthlyEMI: float
    approvalProbability: str

@app.post("/api/loan-eligibility", response_model=LoanResponse)
async def calculate_eligibility(req: LoanRequest):
    # Validation
    if req.income <= 0:
        raise HTTPException(status_code=400, detail="Income must be greater than 0")

    # Core Variables
    disposable_income = req.income - req.existing_emi - req.expenses
    
    # Debt To Income Ratio (DTI)
    dti = (req.existing_emi / req.income) * 100

    # Initialize Score
    score = 0

    # Rule: DTI
    if dti < 30:
        score += 40
    elif 30 <= dti <= 50:
        score += 25
    else:
        score += 10

    # Rule: Income
    if req.income > 50000:
        score += 30
    elif 25000 <= req.income <= 50000:
        score += 20
    else:
        score += 10

    # Rule: Age
    if 21 <= req.age <= 55:
        score += 20

    # Rule: Savings
    if req.savings > 100000:
        score += 10

    # Cap score at 100
    score = min(score, 100)

    # Derived Metrics
    risk_level = "Low Risk" if score >= 80 else ("Medium Risk" if score >= 50 else "High Risk")
    approval_probability = f"{score}%"
    
    # Financial capacity heuristics
    if disposable_income > 0:
        max_loan_amount = disposable_income * 60  # Approx 5 years of capacity
        suggested_emi = disposable_income * 0.5   # 50% of disposable
    else:
        max_loan_amount = 0
        suggested_emi = 0

    # Recommendations Logic
    recommended = [req.loanType]
    
    if req.occupation == "Farmer" and "Agricultural Loan" not in recommended:
        recommended.append("Agricultural Loan")
    
    if score > 75 and req.income > 40000 and "Home Loan" not in recommended:
        recommended.append("Home Loan")
        
    if req.occupation in ["Business Owner", "Self Employed"] and "Business Loan" not in recommended:
        recommended.append("Business Loan")

    # Default fallback
    if len(recommended) < 2 and "Personal Loan" not in recommended:
        recommended.append("Personal Loan")

    return LoanResponse(
        eligibilityScore=score,
        maxLoanAmount=max_loan_amount,
        recommendedLoans=recommended,
        riskLevel=risk_level,
        monthlyEMI=suggested_emi,
        approvalProbability=approval_probability
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
