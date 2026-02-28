# InsureAI — Insurance Fraud Detection System

Real-time auto insurance fraud detection using a Gradient Boosting classifier
trained on the provided `insurance_fraud_claims.csv` dataset.

---

## Project Structure

```
insureai/
├── app.py                        ← Flask backend (main entry point)
├── train_model.py                ← Model training script
├── requirements.txt              ← Python dependencies
├── insurance_fraud_claims.csv    ← Dataset (place here)
├── model/
│   └── insureai_model.pkl        ← Trained model (auto-generated)
├── templates/
│   └── index.html                ← Main HTML page (Jinja2)
├── static/
│   ├── css/
│   │   ├── base.css              ← CSS variables & resets
│   │   ├── header.css            ← Header & progress bar
│   │   ├── hero.css              ← Hero section
│   │   ├── metrics.css           ← Dashboard metric cards
│   │   ├── form.css              ← Claim form layout
│   │   ├── sidebar.css           ← Score ring & risk factors
│   │   ├── history.css           ← Analysis history table
│   │   ├── guide.css             ← Step-by-step guide
│   │   └── loading.css           ← Loading overlay
│   └── js/
│       ├── data.js               ← Static data constants
│       ├── ui.js                 ← UI update functions
│       ├── guide.js              ← Guide panel content
│       └── main.js               ← Entry point & API calls
└── .vscode/
    ├── launch.json               ← Run/debug config
    └── settings.json             ← Editor settings
```

---

## Quick Start in VS Code

### 1. Place the CSV
Copy `insurance_fraud_claims.csv` into the project root folder.

### 2. Create a virtual environment
```bash
# In VS Code Terminal (Ctrl + `)
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the app

**Option A — VS Code Run button (F5):**
- Open the Run & Debug panel (`Ctrl+Shift+D`)
- Select **"Run InsureAI (Flask)"**
- Press **F5**

**Option B — Terminal:**
```bash
python app.py
```

### 5. Open in browser
```
http://127.0.0.1:5000
```

> On first launch, the model trains automatically (~30 seconds).
> Subsequent launches load the cached model instantly from `model/insureai_model.pkl`.

---

## Retrain the Model

If you want to retrain from scratch (e.g. after updating the CSV):

```bash
# Delete the cached model
del model\insureai_model.pkl    # Windows
rm model/insureai_model.pkl     # Mac/Linux

# Retrain
python train_model.py
```

Or use the VS Code **"Train Model Only"** debug config.

---

## Model Details

| Property       | Value                        |
|----------------|------------------------------|
| Algorithm      | Gradient Boosting Classifier |
| Estimators     | 300 trees                    |
| Max Depth      | 6                            |
| Learning Rate  | 0.05                         |
| Features       | 29                           |
| Training Data  | 1,000 real insurance claims  |
| Fraud Rate     | 24.7%                        |
| Accuracy       | ~80.5%                       |
| ROC-AUC        | ~0.82                        |

---

## API Endpoints

| Endpoint        | Method | Description                        |
|-----------------|--------|------------------------------------|
| `/`             | GET    | Serve the frontend                 |
| `/api/predict`  | POST   | Score a claim (JSON body)          |
| `/api/stats`    | GET    | Session statistics                 |
| `/api/metadata` | GET    | Model info + dropdown option lists |
