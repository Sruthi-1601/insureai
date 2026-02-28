"""
train_model.py — InsureAI Model Training
==========================================
Trains a Gradient Boosting classifier on insurance_fraud_claims.csv.

Standalone usage (run once before app.py):
    python train_model.py

Or called automatically by app.py on first launch.
"""

import os, pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.ensemble import GradientBoostingClassifier


def train_model(csv_path: str, model_path: str = "model/insureai_model.pkl") -> dict:
    """
    Load CSV, engineer features, train model, save artifacts.
    Returns the artifacts dict (same structure that app.py expects).
    """

    # ── 1. Load Data ──────────────────────────────────────────
    print("📂  Loading dataset:", csv_path)
    df = pd.read_csv(csv_path)
    print(f"    Rows: {len(df)}  |  Fraud rate: {(df['fraud_reported']=='Y').mean()*100:.1f}%")

    # ── 2. Target ─────────────────────────────────────────────
    df["fraud"] = (df["fraud_reported"] == "Y").astype(int)

    # ── 3. Feature Engineering ────────────────────────────────
    df["policy_age_months"] = df["months_as_customer"].fillna(0).astype(int)

    # Vehicle age = dataset vintage (2016) − manufacture year
    df["vehicle_age"] = (2016 - df["auto_year"].fillna(2005)).clip(0, 30).astype(int)

    # Binary columns (YES/NO/? → 1/0)
    df["police_report_bin"]   = (df["police_report_available"].fillna("NO") == "YES").astype(int)
    df["property_damage_bin"] = (df["property_damage"].fillna("NO") == "YES").astype(int)

    # ── 4. Encode Categoricals ────────────────────────────────
    CAT_COLS = [
        "incident_type", "incident_severity", "collision_type",
        "insured_sex", "insured_education_level", "insured_occupation",
        "insured_hobbies", "insured_relationship",
        "incident_state", "incident_city", "auto_make"
    ]
    encoders = {}
    for col in CAT_COLS:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].fillna("Unknown").astype(str))
        encoders[col] = le

    # ── 5. Feature Matrix ─────────────────────────────────────
    FEATURES = [
        "policy_age_months",
        "age",
        "policy_deductable",
        "policy_annual_premium",
        "umbrella_limit",
        "capital-gains",
        "capital-loss",
        "incident_hour_of_the_day",
        "number_of_vehicles_involved",
        "bodily_injuries",
        "witnesses",
        "police_report_bin",
        "property_damage_bin",
        "total_claim_amount",
        "injury_claim",
        "property_claim",
        "vehicle_claim",
        "vehicle_age",
        "incident_type_enc",
        "incident_severity_enc",
        "collision_type_enc",
        "insured_sex_enc",
        "insured_education_level_enc",
        "insured_occupation_enc",
        "insured_hobbies_enc",
        "insured_relationship_enc",
        "incident_state_enc",
        "incident_city_enc",
        "auto_make_enc",
    ]

    X = df[FEATURES].fillna(0)
    y = df["fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── 6. Train ──────────────────────────────────────────────
    print("🧠  Training Gradient Boosting Classifier …")
    model = GradientBoostingClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # ── 7. Evaluate ───────────────────────────────────────────
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    auc      = roc_auc_score(y_test, y_prob)
    accuracy = (y_pred == y_test).mean()

    print("\n📊  Model Performance:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Fraud"]))
    print(f"    ROC-AUC : {auc:.4f}")
    print(f"    Accuracy: {accuracy*100:.1f}%\n")

    # ── 8. Save Artifacts ─────────────────────────────────────
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    artifacts = {
        "model":    model,
        "encoders": encoders,
        "features": FEATURES,
        "accuracy": round(accuracy * 100, 1),
        "auc":      round(auc, 4),
        # Dropdown option lists (populated from real data)
        "incident_types":  sorted(df["incident_type"].dropna().unique().tolist()),
        "severities":      sorted(df["incident_severity"].dropna().unique().tolist()),
        "collision_types": sorted(df["collision_type"].dropna().unique().tolist()),
        "states":          sorted(df["incident_state"].dropna().unique().tolist()),
        "cities":          sorted(df["incident_city"].dropna().unique().tolist()),
        "makes":           sorted(df["auto_make"].dropna().unique().tolist()),
        "occupations":     sorted(df["insured_occupation"].dropna().unique().tolist()),
        "hobbies":         sorted(df["insured_hobbies"].dropna().unique().tolist()),
        "relationships":   sorted(df["insured_relationship"].dropna().unique().tolist()),
    }

    with open(model_path, "wb") as f:
        pickle.dump(artifacts, f)

    print(f"✅  Model saved → {model_path}")
    print("🚀  Now run: python app.py\n")
    return artifacts


# ── Run standalone ────────────────────────────────────────────
if __name__ == "__main__":
    train_model("insurance_fraud_claims.csv", "model/insureai_model.pkl")
