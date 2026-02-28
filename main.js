/* ============================================================
   main.js — App Entry Point & Event Wiring
   InsureAI Fraud Detection System
   ============================================================ */

/* ── Read all form values ── */
function readFormData() {
  return {
    policy_age_months:         parseInt(document.getElementById("fMonths").value)   || 0,
    age:                       parseInt(document.getElementById("fAge").value)       || 35,
    policy_deductable:         parseFloat(document.getElementById("fDeduct").value) || 500,
    policy_annual_premium:     parseFloat(document.getElementById("fPremium").value)|| 1200,
    umbrella_limit:            parseFloat(document.getElementById("fUmbrella").value)|| 0,
    capital_gains:             parseFloat(document.getElementById("fCapGains").value)|| 0,
    capital_loss:              parseFloat(document.getElementById("fCapLoss").value) || 0,
    insured_sex:               document.getElementById("fSex").value,
    insured_education_level:   document.getElementById("fEdu").value,
    insured_relationship:      document.getElementById("fRelation").value,
    incident_type:             document.getElementById("fType").value,
    incident_severity:         document.getElementById("fSeverity").value,
    collision_type:            document.getElementById("fCollision").value,
    incident_state:            document.getElementById("fState").value,
    incident_city:             document.getElementById("fCity").value,
    incident_hour:             parseInt(document.getElementById("fHour").value)      || 12,
    number_of_vehicles_involved: parseInt(document.getElementById("fVehicles").value)|| 1,
    bodily_injuries:           parseInt(document.getElementById("fInjuries").value)  || 0,
    witnesses:                 parseInt(document.getElementById("fWitness").value)   || 0,
    police_report:             document.getElementById("fPolice").value,
    property_damage:           document.getElementById("fPropDmg").value,
    total_claim_amount:        parseFloat(document.getElementById("fAmount").value)  || 0,
    injury_claim:              parseFloat(document.getElementById("fInjuryClaim").value) || 0,
    property_claim:            parseFloat(document.getElementById("fPropClaim").value)   || 0,
    vehicle_claim:             parseFloat(document.getElementById("fVehClaim").value)    || 0,
    auto_make:                 document.getElementById("fMake").value,
    vehicle_age:               2016 - (parseInt(document.getElementById("fVehYear").value) || 2008),
    insured_occupation:        document.getElementById("fOccup").value,
    insured_hobbies:           document.getElementById("fHobbies") ? document.getElementById("fHobbies").value : "reading",
    prior_claims:              parseInt(document.getElementById("fPrior").value) || 0,
  };
}

/* ── Main Analysis Flow ── */
async function runAnalysis() {
  const d = readFormData();

  if (!d.total_claim_amount) {
    alert("Please enter a total claim amount to proceed.");
    return;
  }

  await showLoading();

  try {
    const resp = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });

    const result = await resp.json();

    if (result.error) {
      alert("Server error: " + result.error);
      return;
    }

    claimCounter++;
    const score   = result.fraud_score;
    const verdict = score <= 30 ? "approve" : score <= 70 ? "review" : "fraud";
    const color   = getScoreColor(score);

    // Update all UI panels
    animateScoreRing(score, color);
    setVerdict(verdict);
    setConfidenceBars(score);
    setRiskFactors(result.risk_factors || []);

    // Log entry
    const msg =
      verdict === "approve"
        ? `Claim <b>${result.claim_id}</b> — <span class="ok">Auto Approved</span>. Score: <b>${score}</b>`
        : verdict === "review"
        ? `Claim <b>${result.claim_id}</b> — <span class="warn">Manual Review</span>. Score: <b>${score}</b>`
        : `⚠️ Claim <b>${result.claim_id}</b> — <span class="bad">FRAUD FLAGGED</span>. Score: <b>${score}</b>`;
    addLog(msg);

    // History row
    addHistoryRow(score, {
      claim_id: result.claim_id,
      city:     result.city,
      type:     d.incident_type,
      amount:   d.total_claim_amount,
      vehicles: d.number_of_vehicles_involved,
      witnesses:d.witnesses,
    }, verdict);

    updateMetrics(verdict, d.total_claim_amount);

  } catch (err) {
    alert("Request failed: " + err.message);
  }
}
/* ── Dark / Light Mode Toggle ── */
(function () {
  const btn   = document.getElementById("themeToggle");
  const knob  = document.getElementById("themeKnob");
  const label = document.getElementById("themeLabel");

  // Restore saved preference on page load
  const saved = localStorage.getItem("insureai-theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    knob.textContent  = "🌙";
    label.textContent = "🌙";
  }

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    knob.textContent  = isDark ? "🌙" : "☀️";
    label.textContent = isDark ? "🌙" : "☀️";
    localStorage.setItem("insureai-theme", isDark ? "dark" : "light");
  });
})();

/* ── Wire up button ── */
document.getElementById("analyseBtn").addEventListener("click", runAnalysis);

/* ── Load metadata from Flask on page load ── */
window.addEventListener("load", () => {
  fetch("/api/metadata")
    .then((r) => r.json())
    .then((meta) => {
      // Update header accuracy
      document.getElementById("hAccuracy").textContent = meta.accuracy + "%";
      document.getElementById("footerStats").textContent =
        `Accuracy: ${meta.accuracy}%  ·  AUC: ${meta.auc}  ·  Trained on real fraud dataset`;

      // Populate dropdowns from real data
      populateSelect("fCity",  meta.cities);
      populateSelect("fState", meta.states);
      populateSelect("fMake",  meta.makes);

      addLog(`Model loaded · Accuracy: <b>${meta.accuracy}%</b> · AUC: <b>${meta.auc}</b>`);
    })
    .catch(() => {});

  // Init guide
  initGuide();
});

/* ── Helper: rebuild a <select> from an array ── */
function populateSelect(id, values) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = "";
  values.forEach((v) => {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
  // Restore previous selection if still valid
  if (values.includes(current)) sel.value = current;
}
