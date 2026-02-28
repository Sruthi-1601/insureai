"""
app.py — InsureAI Flask Backend
================================
Main entry point. Run this file to start the server:
    python app.py
Then open: http://127.0.0.1:5000
"""

import os, pickle, random, time
import numpy as np
from flask import Flask, request, jsonify, render_template

from train_model import train_model

app = Flask(__name__)

# ── Paths ─────────────────────────────────────────────────────
CSV_PATH   = "insurance_fraud_claims.csv"
MODEL_PATH = "model/insureai_model.pkl"

# ── Load or train model ───────────────────────────────────────
def load_or_train():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            art = pickle.load(f)
        print(f"✅  Model loaded  (Accuracy={art['accuracy']}%  AUC={art['auc']})")
        return art
    if os.path.exists(CSV_PATH):
        return train_model(CSV_PATH, MODEL_PATH)
    raise FileNotFoundError(
        f"Place '{CSV_PATH}' in the project root and re-run."
    )

artifacts = load_or_train()

# ── In-memory session stats ───────────────────────────────────
stats = {
    "total_claims": 0, "fraudulent": 0, "approved": 0,
    "manual_review": 0, "total_amount_saved": 0, "recent_claims": []
}


# ── Helper ────────────────────────────────────────────────────
def safe_encode(le, val, default=0):
    try:
        return int(le.transform([str(val)])[0])
    except Exception:
        return default


# ─────────────────────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json or {}
    t0   = time.time()

    try:
        enc   = artifacts["encoders"]
        model = artifacts["model"]

        import pandas as pd

        row = {
            "policy_age_months":           int(data.get("policy_age_months", 24)),
            "age":                         int(data.get("age", 35)),
            "policy_deductable":           float(data.get("policy_deductable", 500)),
            "policy_annual_premium":       float(data.get("policy_annual_premium", 1200)),
            "umbrella_limit":              float(data.get("umbrella_limit", 0)),
            "capital-gains":               float(data.get("capital_gains", 0)),
            "capital-loss":                float(data.get("capital_loss", 0)),
            "incident_hour_of_the_day":    int(data.get("incident_hour", 12)),
            "number_of_vehicles_involved": int(data.get("number_of_vehicles_involved", 1)),
            "bodily_injuries":             int(data.get("bodily_injuries", 0)),
            "witnesses":                   int(data.get("witnesses", 1)),
            "police_report_bin":           1 if data.get("police_report", "YES") == "YES" else 0,
            "property_damage_bin":         1 if data.get("property_damage", "NO") == "YES" else 0,
            "total_claim_amount":          float(data.get("total_claim_amount", 10000)),
            "injury_claim":                float(data.get("injury_claim", 0)),
            "property_claim":              float(data.get("property_claim", 0)),
            "vehicle_claim":               float(data.get("vehicle_claim", 0)),
            "vehicle_age":                 int(data.get("vehicle_age", 5)),
            "incident_type_enc":           safe_encode(enc["incident_type"],           data.get("incident_type",           "Single Vehicle Collision")),
            "incident_severity_enc":       safe_encode(enc["incident_severity"],       data.get("incident_severity",       "Minor Damage")),
            "collision_type_enc":          safe_encode(enc["collision_type"],          data.get("collision_type",          "Front Collision")),
            "insured_sex_enc":             safe_encode(enc["insured_sex"],             data.get("insured_sex",             "MALE")),
            "insured_education_level_enc": safe_encode(enc["insured_education_level"], data.get("insured_education_level", "College")),
            "insured_occupation_enc":      safe_encode(enc["insured_occupation"],      data.get("insured_occupation",      "tech-support")),
            "insured_hobbies_enc":         safe_encode(enc["insured_hobbies"],         data.get("insured_hobbies",         "reading")),
            "insured_relationship_enc":    safe_encode(enc["insured_relationship"],    data.get("insured_relationship",    "husband")),
            "incident_state_enc":          safe_encode(enc["incident_state"],          data.get("incident_state",          "OH")),
            "incident_city_enc":           safe_encode(enc["incident_city"],           data.get("incident_city",           "Columbus")),
            "auto_make_enc":               safe_encode(enc["auto_make"],               data.get("auto_make",               "Toyota")),
        }
        features = pd.DataFrame([row])[artifacts["features"]]

        prob  = float(model.predict_proba(features)[0][1])
        score = int(round(prob * 100))

        # Decision tiers
        if score <= 30:
            decision, label, color, risk = "APPROVED", "Auto Approved",    "green",  "LOW"
        elif score <= 70:
            decision, label, color, risk = "REVIEW",   "Manual Review",    "yellow", "MEDIUM"
        else:
            decision, label, color, risk = "FLAGGED",  "Flagged as Fraud", "red",    "HIGH"

        # Rule-based risk factor explanations
        risk_factors = []
        months   = int(data.get("policy_age_months", 24))
        amount   = float(data.get("total_claim_amount", 10000))
        prior    = int(data.get("prior_claims", 0))
        wits     = int(data.get("witnesses", 1))
        vehicles = int(data.get("number_of_vehicles_involved", 1))
        severity = data.get("incident_severity", "Minor Damage")
        police   = data.get("police_report", "YES")
        itype    = data.get("incident_type", "")
        injuries = int(data.get("bodily_injuries", 0))
        hour     = int(data.get("incident_hour", 12))

        if months < 3:
            risk_factors.append({"label": "Very New Policy",         "desc": f"Policy only {months} months old",         "weight": "HIGH"})
        elif months < 6:
            risk_factors.append({"label": "New Policy (< 6 months)", "desc": "Policy under 6 months old",                "weight": "HIGH"})
        if severity == "Trivial Damage" and injuries > 0:
            risk_factors.append({"label": "Injury–Damage Mismatch",  "desc": "Injuries reported for trivial damage",     "weight": "HIGH"})
        if vehicles >= 2 and wits == 0:
            risk_factors.append({"label": "No Witnesses",            "desc": f"{vehicles} vehicles, zero witnesses",     "weight": "HIGH"})
        if amount > 50000:
            risk_factors.append({"label": "High Claim Amount",       "desc": f"Claim of ${amount:,.0f}",                 "weight": "HIGH" if amount > 150000 else "MEDIUM"})
        if prior >= 3:
            risk_factors.append({"label": "Repeat Claimant",         "desc": f"{prior} prior claims on record",          "weight": "HIGH"})
        if police != "YES":
            risk_factors.append({"label": "No Police Report",        "desc": "Incident not reported to police",          "weight": "MEDIUM"})
        if itype == "Vehicle Theft" and wits == 0:
            risk_factors.append({"label": "Unwitnessed Theft",       "desc": "No witnesses to reported theft",           "weight": "MEDIUM"})
        if hour >= 22 or hour < 6:
            risk_factors.append({"label": "Late Night Incident",     "desc": f"Reported at {hour:02d}:00 hrs",           "weight": "MEDIUM"})

        elapsed = round((time.time() - t0) * 1000, 1)

        # Update session stats
        stats["total_claims"] += 1
        claim_id = f"INS-{random.randint(10000, 99999)}"
        city = data.get("incident_city", "Unknown")

        if decision == "APPROVED":   stats["approved"]      += 1
        elif decision == "REVIEW":   stats["manual_review"] += 1
        else:
            stats["fraudulent"]         += 1
            stats["total_amount_saved"] += int(amount)

        stats["recent_claims"].insert(0, {
            "id": claim_id, "city": city, "amount": int(amount),
            "decision": decision, "score": score,
        })
        stats["recent_claims"] = stats["recent_claims"][:20]

        return jsonify({
            "claim_id":       claim_id,
            "fraud_score":    score,
            "probability":    round(prob, 4),
            "decision":       decision,
            "decision_label": label,
            "decision_color": color,
            "risk_level":     risk,
            "risk_factors":   risk_factors,
            "response_ms":    elapsed,
            "city":           city,
        })

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/stats", methods=["GET"])
def get_stats():
    total = stats["total_claims"] or 1
    return jsonify({
        "total_claims":  stats["total_claims"],
        "fraudulent":    stats["fraudulent"],
        "approved":      stats["approved"],
        "manual_review": stats["manual_review"],
        "fraud_rate":    round(stats["fraudulent"] / total * 100, 1),
        "amount_saved":  stats["total_amount_saved"],
        "recent_claims": stats["recent_claims"],
    })


@app.route("/api/metadata", methods=["GET"])
def get_metadata():
    return jsonify({
        "incident_types":  artifacts["incident_types"],
        "severities":      artifacts["severities"],
        "collision_types": artifacts["collision_types"],
        "states":          artifacts["states"],
        "cities":          artifacts["cities"],
        "makes":           artifacts["makes"],
        "occupations":     artifacts["occupations"],
        "hobbies":         artifacts["hobbies"],
        "relationships":   artifacts["relationships"],
        "accuracy":        artifacts["accuracy"],
        "auc":             artifacts["auc"],
    })


# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀  InsureAI running at http://127.0.0.1:5000\n")
    app.run(debug=True, port=5000)
