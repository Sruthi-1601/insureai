# insureai
AI-powered real-time auto insurance fraud detection

🚗 Real-Time Auto Insurance Fraud Detection System

An AI-powered web application that detects potentially fraudulent auto insurance claims at the time of submission — before payouts occur.

Insurance companies lose billions annually due to fraudulent claims. Traditional detection methods rely on manual review and static rule-based systems, which are slow, reactive, and inefficient.

Hackathon introduces real-time, intelligent fraud detection using Machine Learning (XGBoost) to prevent losses before they happen.



🎯 Problem Statement

Auto insurance fraud results in massive financial losses each year. Existing fraud detection systems:

Rely heavily on manual reviews

Use static rule-based logic

Detect fraud only after payouts

Increase operational costs

Slow down legitimate claims

There is a critical need for a real-time intelligent system that:

Evaluates fraud risk instantly

Reduces human workload

Minimizes financial losses

Improves accuracy

Maintains smooth customer experience




💡 Proposed Solution

InsureAI is a real-time AI-powered fraud detection web application that evaluates claims at the moment they are submitted.

The system uses an XGBoost machine learning model trained on historical insurance data to generate:

🔢 Instant fraud risk score (0–100)

📊 Risk explanation via pattern detection

🧠 Automated decision recommendation

Response time: < 2 seconds

🧠 System Architecture (3-Layer Design)


🔹 Layer 1 — Risk Scoring Engine

Each claim receives an instant fraud score from 0 to 100.

Key Features Used:

Incident severity

Policy state

Claim amount

Number of vehicles involved

Injury count

Number of witnesses

Model: XGBoost Classifier


🔹 Layer 2 — Pattern Detection

The system detects suspicious behavioral patterns such as:

Policies purchased shortly before accidents

High claim amounts with low incident severity

Multiple vehicles with no witnesses

Repeated claim behavior patterns

This allows detection beyond traditional rule-based systems.


🔹 Layer 3 — Decision Engine

Based on the fraud score:

Fraud Score	Decision
0–30	✅ Auto Approve
31–70	👀 Manual Review
71–100	🚨 Flag as Fraud

This reduces manual workload while maintaining high accuracy.





🛠 Tech Stack

Python

XGBoost

Scikit-learn

Pandas / NumPy

Flask / FastAPI 

HTML / CSS / JavaScript



⚡ Key Advantages

Real-time fraud scoring

Machine learning-driven decisions

Reduced financial loss

Reduced manual review time

Scalable and production-ready architecture



📦 Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/hackathon-fraud-detection.git
cd hackathon-fraud-detection

Install dependencies:

pip install -r requirements.txt

Run the application:

python app.py




📊 Future Improvements

SHAP explainability integration

Model retraining pipeline

Cloud deployment (AWS / Azure)

Dashboard for fraud analytics

Continuous learning system




📜 License

MIT License
