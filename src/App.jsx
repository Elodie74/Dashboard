import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────────────────────────
   0.  CONSTANTS & THEME
   ───────────────────────────────────────────── */
const T = {
  bg: "#07090F",
  card: "#0D1120",
  cardHover: "#131831",
  accent: "#C8F464",
  accentDim: "rgba(200,244,100,.15)",
  text: "#E8EAF0",
  muted: "#6B7394",
  red: "#FF6B6B",
  border: "rgba(200,244,100,.08)",
  glow: "0 0 20px rgba(200,244,100,.12)",
};

const TABS = [
  { id: "ventes", icon: "💰", label: "Ventes" },
  { id: "pub", icon: "📣", label: "Pub" },
  { id: "reseaux", icon: "📱", label: "Réseaux" },
  { id: "emails", icon: "📧", label: "Emails" },
  { id: "lancements", icon: "🚀", label: "Lancements" },
  { id: "ia", icon: "🤖", label: "IA" },
];

/* ─────────────────────────────────────────────
   1.  DEMO DATA GENERATOR
   ───────────────────────────────────────────── */
const weekLabels = ["S-5", "S-4", "S-3", "S-2", "S-1", "S0"];
const monthLabels = ["M-5", "M-4", "M-3", "M-2", "M-1", "M0"];

const rand = (min, max) => Math.round(min + Math.random() * (max - min));
const trend = (arr) => {
  if (arr.length < 2) return 0;
  const last = arr[arr.length - 1];
  const prev = arr[arr.length - 2];
  return prev === 0 ? 0 : Math.round(((last - prev) / prev) * 100);
};

const buildSeries = (n, min, max) => {
  const arr = [];
  let v = rand(min, max);
  for (let i = 0; i < n; i++) {
    v = Math.max(min, Math.min(max, v + rand(-Math.round(max * 0.12), Math.round(max * 0.15))));
    arr.push(v);
  }
  return arr;
};

const kpiDefs = {
  ventes: [
    { key: "ca", label: "Chiffre d'affaires", icon: "💶", unit: "€", min: 1200, max: 8500 },
    { key: "commandes", label: "Commandes", icon: "📦", unit: "", min: 15, max: 120 },
    { key: "panier", label: "Panier moyen", icon: "🛒", unit: "€", min: 35, max: 95 },
    { key: "conv", label: "Taux conversion", icon: "🎯", unit: "%", min: 1, max: 6 },
    { key: "recurrents", label: "Clients récurrents", icon: "🔁", unit: "%", min: 10, max: 45 },
    { key: "refund", label: "Remboursements", icon: "↩️", unit: "", min: 0, max: 8 },
  ],
  pub: [
    { key: "spend", label: "Budget dépensé", icon: "💸", unit: "€", min: 200, max: 2500 },
    { key: "roas", label: "ROAS", icon: "📈", unit: "x", min: 1, max: 6 },
    { key: "cpc", label: "CPC", icon: "👆", unit: "€", min: 0, max: 3 },
    { key: "cpm", label: "CPM", icon: "👁️", unit: "€", min: 2, max: 15 },
    { key: "ctr", label: "CTR", icon: "🔗", unit: "%", min: 1, max: 7 },
    { key: "leads", label: "Leads générés", icon: "🧲", unit: "", min: 10, max: 200 },
  ],
  reseaux: [
    { key: "followers", label: "Nouveaux abonnés", icon: "👥", unit: "", min: 20, max: 500 },
    { key: "engagement", label: "Taux engagement", icon: "❤️", unit: "%", min: 1, max: 12 },
    { key: "reach", label: "Portée", icon: "📡", unit: "", min: 500, max: 15000 },
    { key: "impressions", label: "Impressions", icon: "👀", unit: "", min: 1000, max: 50000 },
    { key: "posts", label: "Publications", icon: "📝", unit: "", min: 2, max: 20 },
    { key: "shares", label: "Partages", icon: "🔄", unit: "", min: 5, max: 150 },
  ],
  emails: [
    { key: "sent", label: "Emails envoyés", icon: "✉️", unit: "", min: 200, max: 5000 },
    { key: "openRate", label: "Taux ouverture", icon: "📬", unit: "%", min: 15, max: 55 },
    { key: "clickRate", label: "Taux de clic", icon: "🖱️", unit: "%", min: 1, max: 12 },
    { key: "unsub", label: "Désabonnements", icon: "🚪", unit: "", min: 0, max: 15 },
    { key: "revenue", label: "CA emails", icon: "💰", unit: "€", min: 100, max: 3000 },
    { key: "list", label: "Taille liste", icon: "📋", unit: "", min: 800, max: 8000 },
  ],
  lancements: [
    { key: "inscrits", label: "Inscrits", icon: "📝", unit: "", min: 20, max: 500 },
    { key: "caLanc", label: "CA lancement", icon: "💶", unit: "€", min: 0, max: 15000 },
    { key: "txConv", label: "Taux conversion", icon: "🎯", unit: "%", min: 1, max: 15 },
    { key: "webinar", label: "Participants live", icon: "🎥", unit: "", min: 10, max: 300 },
    { key: "replay", label: "Vues replay", icon: "▶️", unit: "", min: 5, max: 600 },
    { key: "nps", label: "Score NPS", icon: "⭐", unit: "", min: 20, max: 95 },
  ],
};

function generateDemoData() {
  const data = {};
  for (const [tab, defs] of Object.entries(kpiDefs)) {
    data[tab] = { week: {}, month: {} };
    for (const d of defs) {
      data[tab].week[d.key] = buildSeries(6, d.min, d.max);
      data[tab].month[d.key] = buildSeries(6, d.min * 3, d.max * 4);
    }
  }
  return data;
}

/* ─────────────────────────────────────────────
   2.  CSV PARSER
   ───────────────────────────────────────────── */
function parseCSV(text) {
  const lines = text.trim().split("\n").map((l) => l.split(",").map((c) => c.trim()));
  if (lines.length < 2) return null;
  const headers = lines[0];
  const rows = lines.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i] || ""));
    return obj;
  });
  return rows;
}

function csvToKpiData(rows) {
  if (!rows || rows.length === 0) return null;
  try {
    const data = {};
    for (const [tab, defs] of Object.entries(kpiDefs)) {
      data[tab] = { week: {}, month: {} };
      for (const d of defs) {
        data[tab].week[d.key] = buildSeries(6, d.min, d.max);
        data[tab].month[d.key] = buildSeries(6, d.min * 3, d.max * 4);
      }
    }
    for (const row of rows) {
      const tabKey = (row.tab || "").toLowerCase();
      const period = (row.period || "").toLowerCase();
      const kpiKey = row.kpi || "";
      if (!data[tabKey] || !data[tabKey][period] || !kpiDefs[tabKey]) continue;
      const def = kpiDefs[tabKey].find((d) => d.key === kpiKey);
      if (!def) continue;
      const values = [];
      for (let i = 1; i <= 6; i++) {
        const col = `v${i}`;
        const val = parseFloat(row[col]);
        values.push(isNaN(val) ? 0 : val);
      }
      if (values.length === 6) data[tabKey][period][kpiKey] = values;
    }
    return data;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   3.  HEALTH SCORE
   ───────────────────────────────────────────── */
function computeHealth(data, period) {
  let total = 0, count = 0;
  for (const tab of Object.keys(kpiDefs)) {
    for (const def of kpiDefs[tab]) {
      const arr = data?.[tab]?.[period]?.[def.key];
      if (!arr || arr.length < 2) continue;
      const t = trend(arr);
      total += Math.min(100, Math.max(0, 50 + t * 2));
      count++;
    }
  }
  return count === 0 ? 50 : Math.round(total / count);
}

/* ─────────────────────────────────────────────
   4.  STYLES
   ───────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${T.bg};
    --card: ${T.card};
    --accent: ${T.accent};
    --text: ${T.text};
    --muted: ${T.muted};
    --border: ${T.border};
  }

  html, body, #root {
    width: 100%;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  .fb-shell {
    width: 100%;
    min-height: 100vh;
    position: relative;
    background: var(--bg);
    padding-bottom: 72px;
  }

  /* ── HEADER ── */
  .fb-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(180deg, var(--bg) 60%, transparent);
    padding: 16px 24px 8px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .fb-header-inner {
    max-width: 1200px;
    margin: 0 auto;
  }
  .fb-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .fb-brand {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--accent);
    opacity: .85;
  }
  .fb-client {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: .5px;
  }

  /* health ring */
  .fb-health {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .fb-health-ring {
    width: 44px;
    height: 44px;
    position: relative;
  }
  .fb-health-ring svg { transform: rotate(-90deg); }
  .fb-health-val {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
  }
  .fb-health-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* period nav */
  .fb-period-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .fb-period-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    padding: 5px 14px;
    border-radius: 20px;
    cursor: pointer;
    transition: all .2s;
  }
  .fb-period-btn.active {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
    font-weight: 700;
  }
  .fb-arrow-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: all .2s;
    flex-shrink: 0;
  }
  .fb-arrow-btn:hover { border-color: var(--accent); color: var(--accent); }
  .fb-arrow-btn:disabled { opacity: .25; cursor: default; }
  .fb-period-label {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: var(--text);
    min-width: 60px;
    text-align: center;
  }

  /* ── TABS (bottom nav) ── */
  .fb-tabs {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    gap: 0;
    padding: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background: linear-gradient(180deg, transparent 0%, var(--bg) 20%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
  }
  .fb-tabs::-webkit-scrollbar { display: none; }
  .fb-tab {
    flex: 1 1 0;
    background: none;
    border: none;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    padding: 10px 4px 14px;
    border-radius: 0;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    max-width: 80px;
    position: relative;
  }
  .fb-tab::before {
    content: '';
    position: absolute;
    top: 0;
    left: 25%;
    right: 25%;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background: var(--accent);
    opacity: 0;
    transition: opacity .2s;
  }
  .fb-tab.active::before { opacity: 1; }
  .fb-tab.active {
    color: var(--accent);
    font-weight: 700;
    background: none;
  }
  .fb-tab-icon { font-size: 18px; }

  /* ── KPI CARDS ── */
  .fb-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 24px 16px;
    max-width: 1248px;
    margin: 0 auto;
  }
  @media (min-width: 600px) {
    .fb-cards { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 900px) {
    .fb-cards { grid-template-columns: repeat(6, 1fr); }
  }
  .fb-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    transition: all .25s;
    position: relative;
    overflow: hidden;
  }
  .fb-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity .3s;
  }
  .fb-card:hover { border-color: rgba(200,244,100,.2); }
  .fb-card:hover::before { opacity: 1; }
  .fb-card-icon { font-size: 18px; margin-bottom: 6px; display: block; }
  .fb-card-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .6px;
    margin-bottom: 6px;
    line-height: 1.3;
  }
  .fb-card-value {
    font-family: 'Space Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }
  .fb-card-trend {
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 8px;
  }
  .fb-card-trend.up {
    color: var(--accent);
    background: ${T.accentDim};
  }
  .fb-card-trend.down {
    color: ${T.red};
    background: rgba(255,107,107,.12);
  }

  /* ── CHART ── */
  .fb-chart-wrap {
    padding: 0 24px 24px;
    max-width: 1248px;
    margin: 0 auto;
  }
  .fb-chart-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px 8px 8px 0;
  }
  .fb-chart-title {
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-left: 16px;
    margin-bottom: 10px;
  }

  /* ── AI TAB ── */
  .fb-ai-section {
    padding: 0 24px 30px;
    max-width: 1248px;
    margin: 0 auto;
  }
  .fb-ai-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
  }
  .fb-ai-title {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    color: var(--accent);
    margin-bottom: 6px;
  }
  .fb-ai-desc {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .fb-ai-btn {
    width: 100%;
    max-width: 360px;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: var(--accent);
    color: var(--bg);
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 1px;
    transition: all .2s;
    position: relative;
    overflow: hidden;
  }
  .fb-ai-btn:hover { box-shadow: ${T.glow}; transform: translateY(-1px); }
  .fb-ai-btn:disabled { opacity: .5; cursor: wait; }
  .fb-ai-result {
    margin-top: 16px;
    padding: 16px;
    background: rgba(200,244,100,.05);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text);
    white-space: pre-wrap;
    max-height: 500px;
    overflow-y: auto;
  }
  .fb-ai-result::-webkit-scrollbar { width: 4px; }
  .fb-ai-result::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }
  .fb-ai-error {
    margin-top: 12px;
    padding: 12px;
    background: rgba(255,107,107,.08);
    border: 1px solid rgba(255,107,107,.2);
    border-radius: 10px;
    font-size: 12px;
    color: ${T.red};
    line-height: 1.5;
  }

  /* ── LOADER ── */
  .fb-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 40px;
  }
  .fb-loader-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: fbPulse .8s ease-in-out infinite alternate;
  }
  .fb-loader-dot:nth-child(2) { animation-delay: .15s; }
  .fb-loader-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes fbPulse { 0% { opacity: .2; transform: scale(.8); } 100% { opacity: 1; transform: scale(1.2); } }

  /* ── DATA SOURCE TAG ── */
  .fb-source-tag {
    text-align: center;
    padding: 4px 0 10px;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: .5px;
  }
  .fb-source-tag span {
    color: var(--accent);
    font-weight: 700;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fb-anim { animation: fadeUp .35s ease-out both; }
`;

/* ─────────────────────────────────────────────
   5.  COMPONENTS
   ───────────────────────────────────────────── */

function HealthRing({ score }) {
  const r = 18, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 60 ? T.accent : score >= 35 ? "#FACC15" : T.red;
  return (
    <div className="fb-health">
      <div className="fb-health-ring">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={r} fill="none" stroke={T.border} strokeWidth="3.5" />
          <circle
            cx="22" cy="22" r={r} fill="none"
            stroke={color} strokeWidth="3.5"
            strokeDasharray={c} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .6s ease, stroke .4s" }}
          />
        </svg>
        <span className="fb-health-val" style={{ color }}>{score}</span>
      </div>
      <span className="fb-health-label">Santé</span>
    </div>
  );
}

function KpiCard({ icon, label, value, unit, trendVal, delay }) {
  const up = trendVal >= 0;
  const fmt = (v) => {
    if (v >= 10000) return (v / 1000).toFixed(1) + "k";
    if (typeof v === "number") return v.toLocaleString("fr-FR");
    return v;
  };
  return (
    <div className="fb-card fb-anim" style={{ animationDelay: `${delay}ms` }}>
      <span className="fb-card-icon">{icon}</span>
      <div className="fb-card-label">{label}</div>
      <div className="fb-card-value">
        {fmt(value)}
        {unit && <span style={{ fontSize: 12, marginLeft: 2, opacity: .6 }}>{unit}</span>}
      </div>
      <span className={`fb-card-trend ${up ? "up" : "down"}`}>
        {up ? "▲" : "▼"} {Math.abs(trendVal)}%
      </span>
    </div>
  );
}

function ChartSection({ data, labels, defs, firstKpiKey }) {
  const key = firstKpiKey;
  const def = defs.find((d) => d.key === key);
  const chartData = labels.map((l, i) => ({ name: l, [def.label]: data[key]?.[i] ?? 0 }));
  return (
    <div className="fb-chart-wrap fb-anim" style={{ animationDelay: "200ms" }}>
      <div className="fb-chart-box">
        <div className="fb-chart-title">Évolution — {def.label}</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={T.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: T.muted, fontSize: 10, fontFamily: "Space Mono" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: T.muted, fontSize: 10, fontFamily: "Space Mono" }}
              axisLine={false} tickLine={false} width={38}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1f35",
                border: "1px solid rgba(200,244,100,.15)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: T.accent, fontFamily: "Space Mono", fontSize: 11 }}
              itemStyle={{ color: T.text }}
            />
            <Area
              type="monotone"
              dataKey={def.label}
              stroke={T.accent}
              strokeWidth={2.5}
              fill="url(#accentGrad)"
              dot={{ r: 3, fill: T.accent, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: T.accent, stroke: T.bg, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   5b. AI SECTION — appel via /api/analyze
   ───────────────────────────────────────────── */
function AISection({ data, period }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const buildPrompt = useCallback(() => {
    let prompt = "Tu es un analyste business expert. Voici les KPIs d'une boutique e-commerce.\n\n";
    for (const [tab, defs] of Object.entries(kpiDefs)) {
      prompt += `## ${tab.toUpperCase()}\n`;
      for (const d of defs) {
        const arr = data?.[tab]?.[period]?.[d.key];
        if (!arr) continue;
        const val = arr[arr.length - 1];
        const t = trend(arr);
        prompt += `- ${d.label}: ${val}${d.unit} (tendance: ${t >= 0 ? "+" : ""}${t}%)\n`;
      }
      prompt += "\n";
    }
    prompt +=
      "Donne une analyse concise (max 250 mots) avec:\n" +
      "1. Les 3 points forts\n" +
      "2. Les 3 alertes\n" +
      "3. Les 3 actions prioritaires à mener cette semaine\n" +
      "Utilise des emojis pour structurer. Sois direct et actionnable.";
    return prompt;
  }, [data, period]);

  const analyze = async () => {
    setLoading(true);
    setResult("");
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }
      const json = await res.json();
      setResult(json.text || "Aucune réponse.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fb-ai-section fb-anim">
      <div className="fb-ai-box">
        <div className="fb-ai-title">🤖 Analyse IA</div>
        <div className="fb-ai-desc">
          Claude analyse vos KPIs et génère des recommandations actionnables en temps réel.
        </div>
        <button className="fb-ai-btn" onClick={analyze} disabled={loading}>
          {loading ? "Analyse en cours…" : "⚡ Analyser mes KPIs"}
        </button>
        {loading && (
          <div className="fb-loader">
            <div className="fb-loader-dot" />
            <div className="fb-loader-dot" />
            <div className="fb-loader-dot" />
          </div>
        )}
        {error && (
          <div className="fb-ai-error">
            ❌ {error}
          </div>
        )}
        {result && <div className="fb-ai-result">{result}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   6.  MAIN APP
   ───────────────────────────────────────────── */
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjpUCHSQWYgJVRJlRs6QX8eLJL_fEP5bSDzr1c5GsGhf3HonQwB9bZoAX7qmTlVg/pub?output=csv";

export default function App() {
  const [kpiData, setKpiData] = useState(() => generateDemoData());
  const [dataSource, setDataSource] = useState("demo");
  const [period, setPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState("ventes");
  const [periodIndex, setPeriodIndex] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error("fetch failed");
        const text = await res.text();
        const rows = parseCSV(text);
        const parsed = csvToKpiData(rows);
        if (parsed) {
          setKpiData(parsed);
          setDataSource("sheet");
        }
      } catch {
        /* keep demo data */
      }
    })();
  }, []);

  const labels = period === "week" ? weekLabels : monthLabels;
  const health = useMemo(() => computeHealth(kpiData, period), [kpiData, period]);

  const currentDefs = kpiDefs[activeTab] || [];
  const tabData = kpiData?.[activeTab]?.[period] || {};

  const sliceData = useMemo(() => {
    const sliced = {};
    for (const d of currentDefs) {
      const arr = tabData[d.key];
      sliced[d.key] = arr ? arr.slice(0, periodIndex + 1) : [];
    }
    return sliced;
  }, [tabData, currentDefs, periodIndex]);

  const currentLabels = labels.slice(0, periodIndex + 1);

  return (
    <>
      <style>{css}</style>
      <div className="fb-shell">
        {/* ── HEADER ── */}
        <header className="fb-header">
          <div className="fb-header-inner">
          <div className="fb-header-row">
            <div>
              <div className="fb-brand">FlowBoard</div>
              <div className="fb-client">Boutique E-commerce</div>
            </div>
            <HealthRing score={health} />
          </div>

          <div className="fb-period-row">
            <button
              className="fb-arrow-btn"
              disabled={periodIndex <= 0}
              onClick={() => setPeriodIndex((i) => Math.max(0, i - 1))}
            >
              ‹
            </button>
            <button
              className={`fb-period-btn ${period === "week" ? "active" : ""}`}
              onClick={() => { setPeriod("week"); setPeriodIndex(5); }}
            >
              Semaine
            </button>
            <span className="fb-period-label">{labels[periodIndex]}</span>
            <button
              className={`fb-period-btn ${period === "month" ? "active" : ""}`}
              onClick={() => { setPeriod("month"); setPeriodIndex(5); }}
            >
              Mois
            </button>
            <button
              className="fb-arrow-btn"
              disabled={periodIndex >= 5}
              onClick={() => setPeriodIndex((i) => Math.min(5, i + 1))}
            >
              ›
            </button>
          </div>

          <div className="fb-source-tag">
            Source : <span>{dataSource === "sheet" ? "Google Sheets" : "Données de démo"}</span>
          </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        {activeTab === "ia" ? (
          <AISection data={kpiData} period={period} />
        ) : (
          <>
            <div className="fb-cards" key={activeTab + period + periodIndex}>
              {currentDefs.map((def, i) => {
                const arr = sliceData[def.key] || [];
                const val = arr.length > 0 ? arr[arr.length - 1] : 0;
                return (
                  <KpiCard
                    key={def.key}
                    icon={def.icon}
                    label={def.label}
                    value={val}
                    unit={def.unit}
                    trendVal={trend(arr)}
                    delay={i * 50}
                  />
                );
              })}
            </div>
            <ChartSection
              data={sliceData}
              labels={currentLabels}
              defs={currentDefs}
              firstKpiKey={currentDefs[0]?.key}
            />
          </>
        )}

        {/* ── BOTTOM NAV ── */}
        <nav className="fb-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`fb-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="fb-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
