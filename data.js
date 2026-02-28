/* ============================================================
   data.js — Static Data & Constants
   InsureAI Fraud Detection System
   ============================================================ */

const INCIDENT_TYPE_NAMES = {
  "Single Vehicle Collision" : "Single Collision",
  "Multi-vehicle Collision"  : "Multi-Vehicle",
  "Vehicle Theft"            : "Theft",
  "Parked Car"               : "Parked Car",
};

const SEVERITY_NAMES = {
  "Trivial Damage" : "Trivial",
  "Minor Damage"   : "Minor",
  "Major Damage"   : "Major",
  "Total Loss"     : "Total Loss",
};

/* ── Fraud signal reference weights ── */
const FRAUD_SIGNALS = [
  { label: "Injury + Trivial Damage",       weight: "HIGH", tier: "high" },
  { label: "New Policy < 3 Months",         weight: "HIGH", tier: "high" },
  { label: "Multi-Vehicle, No Witnesses",   weight: "HIGH", tier: "high" },
  { label: "High Claim Amount",             weight: "HIGH", tier: "high" },
  { label: "Late Night Incident + No Report", weight: "MED", tier: "med" },
  { label: "Repeat Claimant (3+)",          weight: "MED",  tier: "med"  },
  { label: "No Police Report",              weight: "MED",  tier: "med"  },
  { label: "Vehicle Theft",                 weight: "LOW",  tier: "low"  },
];
