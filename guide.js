/* ============================================================
   guide.js — Step-by-Step Guide Panels
   InsureAI Fraud Detection System
   ============================================================ */

const PANEL_CONTENT = {
  1: {
    topStyle: "",
    title: "Welcome to InsureAI",
    subtitle: "InsureAI is a real-time AI fraud detection system powered by Gradient Boosting (XGBoost-equivalent), trained on a real insurance fraud dataset.",
    body: `
      <h3>What this system does</h3>
      <p>Every claim is analysed across 29 features to produce a fraud risk score from 0 to 100. Based on this score, it recommends: Auto Approve, Manual Review, or Flag as Fraud.</p>
      <div class="info-row"><div class="info-icon">⚡</div><div class="info-text"><strong>Speed:</strong> Every claim is processed in under 2 seconds — real-time decisions at point of submission.</div></div>
      <div class="info-row"><div class="info-icon">📊</div><div class="info-text"><strong>Real Dataset:</strong> Trained on 1,000 real insurance fraud claims with a 24.7% fraud rate.</div></div>
      <div class="info-row"><div class="info-icon">🤖</div><div class="info-text"><strong>Technology:</strong> Gradient Boosting Classifier with 300 estimators trained on 29 features.</div></div>
      <div class="info-row"><div class="info-icon">🎯</div><div class="info-text"><strong>Accuracy:</strong> See the header bar for live model accuracy and AUC score from your trained model.</div></div>`,
    prev: null, next: 2, nextLabel: "Policy Details",
  },
  2: {
    topStyle: "background:linear-gradient(135deg,#0e7c52 0%,#0a5c3c 100%)",
    title: "Policy Information Fields",
    subtitle: "The first section captures who the claimant is and their policy relationship.",
    body: `
      <div class="info-row"><div class="info-icon">📅</div><div class="info-text"><strong>Months as Customer:</strong> Policies under 3 months are a major fraud signal — claimants who open a policy just to file.</div></div>
      <div class="info-row"><div class="info-icon">🔄</div><div class="info-text"><strong>Prior Claims:</strong> 3+ previous claims significantly raises the fraud score (serial fraud pattern).</div></div>
      <div class="info-row"><div class="info-icon">💰</div><div class="info-text"><strong>Deductible & Premium:</strong> Policy financial parameters that contextualise the claim amount size.</div></div>
      <div class="info-row"><div class="info-icon">👤</div><div class="info-text"><strong>Demographics:</strong> Age, gender, education, occupation, and relationship are all model features extracted from the real dataset.</div></div>`,
    prev: 1, next: 3, nextLabel: "Incident Details",
  },
  3: {
    topStyle: "background:linear-gradient(135deg,#b45309 0%,#92400e 100%)",
    title: "Incident Details Fields",
    subtitle: "The second section captures what happened — type, severity, people involved, and official response.",
    body: `
      <div class="info-row"><div class="info-icon">🚗</div><div class="info-text"><strong>Incident Type:</strong> Single collision, multi-vehicle, theft, or parked car. Theft and multi-vehicle carry higher base risk.</div></div>
      <div class="info-row"><div class="info-icon">⚠️</div><div class="info-text"><strong>Severity:</strong> Trivial damage combined with bodily injuries is the strongest single fraud signal in the dataset.</div></div>
      <div class="info-row"><div class="info-icon">🚙</div><div class="info-text"><strong>Vehicles + Witnesses:</strong> Multiple vehicles with zero witnesses — classic staged accident pattern.</div></div>
      <div class="info-row"><div class="info-icon">📋</div><div class="info-text"><strong>Police Report:</strong> Absence of a police report for a significant claim is a strong fraud indicator.</div></div>
      <div class="info-row"><div class="info-icon">🕐</div><div class="info-text"><strong>Hour of Incident:</strong> Late night incidents (10 PM–6 AM) carry additional risk weight.</div></div>`,
    prev: 2, next: 4, nextLabel: "3-Layer AI",
  },
  4: {
    topStyle: "",
    title: "The 3-Layer AI System",
    subtitle: "InsureAI processes every claim through three distinct layers.",
    body: `
      <h3>Layer 1 — Feature Extraction</h3>
      <p>29 input fields are read from the form. Categorical fields (incident type, city, make, etc.) are label-encoded to match the training data encoders saved in the model pickle file.</p>
      <h3>Layer 2 — Model Inference</h3>
      <p>The Gradient Boosting classifier (300 trees, max depth 6) outputs a fraud probability from 0.0 to 1.0, scaled to a 0–100 score.</p>
      <div class="info-row"><div class="info-icon">📊</div><div class="info-text">Top features: claim amount, policy age, prior claims, witnesses, police report, severity vs. injuries, vehicle age, hour of incident.</div></div>
      <h3>Layer 3 — Decision Engine</h3>
      <div class="info-row"><div class="info-icon">⚖️</div><div class="info-text">Score 0–30 → Auto Approve. Score 31–70 → Manual Review. Score 71–100 → Flag as Fraud and hold payout.</div></div>`,
    prev: 3, next: 5, nextLabel: "Fraud Signals",
  },
  5: {
    topStyle: "background:linear-gradient(135deg,#b91c1c 0%,#991b1b 100%)",
    title: "Fraud Signals & Feature Weights",
    subtitle: "These patterns were learned directly from the real fraud dataset by the Gradient Boosting model.",
    body: `
      <div class="signal-grid">
        <div class="signal-card high"><div class="signal-weight">HIGH</div><div class="signal-name">Injury + Trivial Damage</div><div class="signal-desc">Strongest single fraud indicator in the real dataset</div></div>
        <div class="signal-card high"><div class="signal-weight">HIGH</div><div class="signal-name">New Policy (&lt; 3 months)</div><div class="signal-desc">Opening a policy specifically to file a claim</div></div>
        <div class="signal-card high"><div class="signal-weight">HIGH</div><div class="signal-name">Multi-Vehicle, No Witnesses</div><div class="signal-desc">Classic staged collision — hard to disprove</div></div>
        <div class="signal-card high"><div class="signal-weight">HIGH</div><div class="signal-name">High Claim Amount</div><div class="signal-desc">Disproportionate claim relative to incident severity</div></div>
        <div class="signal-card med"><div class="signal-weight">MED</div><div class="signal-name">No Police Report</div><div class="signal-desc">Avoiding official documentation of the incident</div></div>
        <div class="signal-card med"><div class="signal-weight">MED</div><div class="signal-name">Repeat Claimant (3+)</div><div class="signal-desc">Serial fraud — unusually high claim frequency</div></div>
        <div class="signal-card med"><div class="signal-weight">MED</div><div class="signal-name">Late Night Incident</div><div class="signal-desc">Harder to verify, fewer witnesses likely present</div></div>
        <div class="signal-card low"><div class="signal-weight">LOW</div><div class="signal-name">Vehicle Theft</div><div class="signal-desc">Higher base fraud rate for all theft-type claims</div></div>
      </div>`,
    prev: 4, next: 6, nextLabel: "Decision Tiers",
  },
  6: {
    topStyle: "",
    title: "Decision Tiers Explained",
    subtitle: "The fraud probability score maps to one of three business decision tiers.",
    body: `
      <div class="decision-row">
        <div class="dc approve"><div class="dc-icon">✅</div><div class="dc-range">0 – 30</div><div class="dc-label">Auto Approve</div><div class="dc-desc">Low fraud risk. No red flags detected. Claim queued for automatic payout processing.</div></div>
        <div class="dc review"> <div class="dc-icon">👀</div><div class="dc-range">31 – 70</div><div class="dc-label">Manual Review</div><div class="dc-desc">Moderate risk signals detected. Assign to a human adjuster to verify documents before approving.</div></div>
        <div class="dc fraud">  <div class="dc-icon">🚨</div><div class="dc-range">71 – 100</div><div class="dc-label">Fraud Flagged</div><div class="dc-desc">High fraud probability. Claim automatically held. Investigation team notified. Payout blocked.</div></div>
      </div>
      <h3>Why these thresholds?</h3>
      <p>The 30/70 cutoffs balance two goals: keeping false positive reviews manageable while catching the maximum amount of actual fraud. These were tuned to maximise F1 score on the held-out test set.</p>`,
    prev: 5, next: 7, nextLabel: "Reading Results",
  },
  7: {
    topStyle: "background:linear-gradient(135deg,#1a1915 0%,#3d3a33 100%)",
    title: "Reading Your Results",
    subtitle: "After clicking Analyse, three sidebar panels update with the result.",
    body: `
      <h3>1. The Fraud Risk Score Ring</h3>
      <p>The animated ring fills proportionally to the score. Color switches automatically: green for low risk (0–30), amber for medium (31–70), red for high (71–100).</p>
      <h3>2. The Verdict Badge</h3>
      <div class="info-row"><div class="info-icon">✅</div><div class="info-text"><strong>Auto Approve:</strong> Claim is clean. System recommends immediate processing and payout.</div></div>
      <div class="info-row"><div class="info-icon">👀</div><div class="info-text"><strong>Manual Review:</strong> Moderate signals. Assign to an adjuster for document verification before approval.</div></div>
      <div class="info-row"><div class="info-icon">🚨</div><div class="info-text"><strong>Fraud Flagged:</strong> High probability. Hold the claim, notify the investigation team, block payout until cleared.</div></div>
      <h3>3. Try a Test Scenario</h3>
      <div class="info-row"><div class="info-icon">🧪</div><div class="info-text"><strong>High-fraud test:</strong> 2 months as customer · $45,000 claim · Trivial Damage · 2 bodily injuries · 2 vehicles · 0 witnesses · No police report → Should score 70+ and trigger Fraud Flagged.</div></div>`,
    prev: 6, next: null, nextLabel: null,
  },
};

/* ── Render one panel's HTML ── */
function renderPanel(n) {
  const p = PANEL_CONTENT[n];

  const prevBtn = p.prev
    ? `<button class="nav-btn" onclick="showPanel(${p.prev})">← Previous</button>`
    : `<button class="nav-btn" disabled>← Previous</button>`;

  const nextBtn = p.next
    ? `<button class="nav-btn primary" onclick="showPanel(${p.next})">Next: ${p.nextLabel} →</button>`
    : `<button class="nav-btn primary" onclick="document.querySelector('.hero').scrollIntoView({behavior:'smooth'})">↑ Back to Top</button>`;

  return `
    <div class="guide-panel-card">
      <div class="panel-top"${p.topStyle ? ` style="${p.topStyle}"` : ""}>
        <div class="panel-step-label">Step ${n} of 7</div>
        <h2>${p.title}</h2>
        <p>${p.subtitle}</p>
      </div>
      <div class="panel-body">${p.body}</div>
      <div class="panel-nav-btns">${prevBtn}${nextBtn}</div>
    </div>`;
}

/* ── Show a panel and update the nav ── */
function showPanel(n) {
  const panelsEl = document.getElementById("guidePanels");
  const navItems = document.querySelectorAll(".guide-nav-item");

  panelsEl.innerHTML = `<div class="guide-panel active">${renderPanel(n)}</div>`;

  navItems.forEach((item, idx) => {
    const num = idx + 1;
    item.classList.remove("active", "done");
    if (num === n) item.classList.add("active");
    if (num < n)  item.classList.add("done");
    const numEl = document.getElementById("nn" + num);
    numEl.textContent = num < n ? "✓" : num;
  });

  panelsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ── Init: attach nav click handlers and show panel 1 ── */
function initGuide() {
  document.querySelectorAll(".guide-nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      showPanel(parseInt(item.dataset.panel));
    });
  });
  showPanel(1);
}
