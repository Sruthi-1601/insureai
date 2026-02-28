/* ============================================================
   ui.js — UI Update Functions
   InsureAI Fraud Detection System
   ============================================================ */

let claimCounter = 1000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function getNow() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

/* ── Progress Bar ── */
function setProgress(step) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById("ps" + i);
    if (!el) continue;
    el.classList.remove("active", "done");
    if (i < step)       el.classList.add("done");
    else if (i === step) el.classList.add("active");
  }
}

/* ── Loading Overlay ── */
async function showLoading() {
  const overlay = document.getElementById("overlay");
  overlay.classList.add("show");
  setProgress(2);

  const steps = ["s1", "s2", "s3", "s4"];
  for (let i = 0; i < steps.length; i++) {
    await wait(420);
    if (i > 0) document.getElementById(steps[i - 1]).classList.add("done");
    document.getElementById(steps[i]).classList.add("active");
    setProgress(i + 2);
  }
  await wait(360);
  steps.forEach((s) => document.getElementById(s).classList.remove("active", "done"));
  overlay.classList.remove("show");
  setProgress(5);
}

/* ── Score Ring ── */
function animateScoreRing(score, color) {
  const fill = document.getElementById("scoreFill");
  const num  = document.getElementById("scoreNum");
  const circ = 440;

  fill.style.strokeDashoffset = circ - (score / 100) * circ;
  fill.style.stroke = color;

  let c = 0;
  const timer = setInterval(() => {
    c = Math.min(c + 2, score);
    num.textContent = c;
    num.style.color = color;
    if (c >= score) clearInterval(timer);
  }, 18);
}

/* ── Verdict Badge ── */
function setVerdict(verdict) {
  const badge = document.getElementById("verdictBadge");
  const icon  = document.getElementById("vIcon");
  const text  = document.getElementById("vText");
  const desc  = document.getElementById("vDesc");
  const lb    = document.getElementById("layerBadge");

  badge.className = "verdict " + verdict;

  const cfg = {
    approve: {
      icon: "✅", text: "AUTO APPROVE",
      desc: "Low fraud risk. This claim can be automatically approved and processed for payout.",
      layer: "Layer 3 → Approve",
    },
    review: {
      icon: "👀", text: "MANUAL REVIEW",
      desc: "Moderate risk detected. Assign to a human adjuster for verification before payout.",
      layer: "Layer 3 → Review",
    },
    fraud: {
      icon: "🚨", text: "FRAUD FLAGGED",
      desc: "High fraud probability. Multiple risk patterns detected. Claim held — investigation required.",
      layer: "Layer 3 → Fraud",
    },
  };

  icon.textContent = cfg[verdict].icon;
  text.textContent = cfg[verdict].text;
  desc.textContent = cfg[verdict].desc;
  lb.textContent   = cfg[verdict].layer;
}

/* ── Confidence Bars ── */
function setConfidenceBars(score) {
  const cLow  = Math.max(0, Math.round(100 - score * 1.15));
  const cHigh = Math.round(Math.min(88, score * 0.85));
  const cMed  = Math.max(0, 100 - cLow - cHigh);

  document.getElementById("cLow").textContent  = cLow  + "%";
  document.getElementById("cMed").textContent  = cMed  + "%";
  document.getElementById("cHigh").textContent = cHigh + "%";

  ["fLow", "fMed", "fHigh"].forEach((id) => {
    document.getElementById(id).style.width = "0";
  });
  setTimeout(() => {
    document.getElementById("fLow").style.width  = cLow  + "%";
    document.getElementById("fMed").style.width  = cMed  + "%";
    document.getElementById("fHigh").style.width = cHigh + "%";
  }, 80);
}

/* ── Risk Factors ── */
function setRiskFactors(factors) {
  document.getElementById("factorBadge").textContent = factors.length + " Detected";

  const colorMap = { HIGH: "var(--red)", MEDIUM: "var(--amber)", LOW: "var(--green)" };
  const barWidth = { HIGH: 85, MEDIUM: 60, LOW: 35 };

  if (factors.length === 0) {
    document.getElementById("factorsWrap").innerHTML =
      '<div class="factors-placeholder">No anomalies detected ✓</div>';
    return;
  }

  document.getElementById("factorsWrap").innerHTML = factors
    .map((f, i) => `
      <div class="factor-item" style="animation-delay:${i * 0.07}s">
        <div class="factor-label">
          ${f.label}
          <br><span style="font-size:10px;color:var(--muted)">${f.desc}</span>
        </div>
        <div class="factor-right">
          <div class="factor-bar">
            <div class="factor-fill"
              style="width:0%;background:${colorMap[f.weight] || "var(--amber)"}"
              data-target="${barWidth[f.weight] || 60}">
            </div>
          </div>
          <div class="factor-pct">${f.weight}</div>
        </div>
      </div>`)
    .join("");

  setTimeout(() => {
    document.querySelectorAll(".factor-fill[data-target]").forEach((el) => {
      el.style.width = el.dataset.target + "%";
    });
  }, 100);
}

/* ── Activity Log ── */
function addLog(html) {
  const log = document.getElementById("logWrap");
  const row = document.createElement("div");
  row.className = "log-row";
  row.innerHTML = `<div class="log-time">${getNow()}</div><div class="log-msg">${html}</div>`;
  log.insertBefore(row, log.firstChild);
}

/* ── History Table ── */
function addHistoryRow(score, d, verdict) {
  const tbody = document.getElementById("historyBody");
  const ph = tbody.querySelector(".history-empty");
  if (ph) ph.parentElement.remove();

  const scoreColor = score <= 30 ? "var(--green)" : score <= 70 ? "var(--amber)" : "var(--red)";
  const labelMap   = { approve: "APPROVE", review: "REVIEW", fraud: "FRAUD" };

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td style="color:var(--muted);font-weight:500">#${d.claim_id}</td>
    <td style="font-weight:500">${d.city || "—"}</td>
    <td style="color:var(--muted2)">${INCIDENT_TYPE_NAMES[d.type] || d.type}</td>
    <td>$${d.amount.toLocaleString()}</td>
    <td style="text-align:center">${d.vehicles}</td>
    <td style="text-align:center">${d.witnesses}</td>
    <td style="color:${scoreColor};font-weight:700">${score}</td>
    <td><span class="pill ${verdict}">${labelMap[verdict]}</span></td>
    <td style="color:var(--muted2)">${getNow()}</td>`;

  tbody.insertBefore(tr, tbody.firstChild);
}

/* ── Dashboard Metric Counters ── */
function updateMetrics(verdict, amount) {
  const map = { approve: "mApprove", review: "mReview", fraud: "mFraud" };
  if (map[verdict]) {
    const el = document.getElementById(map[verdict]);
    el.textContent = parseInt(el.textContent.replace(/,/g, "")) + 1;
  }
  const tot = document.getElementById("mTotal");
  tot.textContent = parseInt(tot.textContent.replace(/,/g, "")) + 1;
  document.getElementById("hClaims").textContent = tot.textContent;

  if (verdict === "fraud") {
    const prev  = parseInt(sessionStorage.getItem("saved") || "0");
    const saved = prev + amount;
    sessionStorage.setItem("saved", saved);
    document.getElementById("mSavedSub").textContent  = "$" + saved.toLocaleString() + " saved";
    document.getElementById("hSaved").textContent     = "$" + saved.toLocaleString();
  }
}

/* ── Score → color ── */
function getScoreColor(score) {
  if (score <= 30) return "var(--green)";
  if (score <= 70) return "var(--amber)";
  return "var(--red)";
}
