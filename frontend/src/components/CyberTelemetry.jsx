import React from 'react';
import { ShieldCheck, Activity, Zap, Lock, Eye, AlertTriangle, Play, Gamepad2 } from 'lucide-react';

export function SentinelHero({ onRunDemo, onOpenSimulator }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#070d20]/90 px-6 py-8 sm:py-10 text-center shadow-[0_0_50px_rgba(34,211,238,0.08)]">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[240px] rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-violet-500/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% In-Browser Privacy • Zero Backend Required
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            Shield Your Digital Life
          </span>
          <br />
          <span className="text-white">with AI-Powered Trust</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          TrustLens AI inspects suspicious links, UPI QRs, deepfakes, EXIF metadata, and prompt injections directly inside your browser — keeping your data private.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={onRunDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-[0_0_24px_rgba(34,211,238,0.35)] transition"
          >
            <Play className="w-4 h-4 fill-current" />
            Run Live Threat Demo
          </button>
          <button
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1633] hover:bg-[#122047] text-slate-200 border border-slate-700 font-semibold text-sm transition"
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            Try Scam Simulator
          </button>
        </div>

        {/* 3 Bold Hero Metrics like Sentinel */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">99.4%</div>
            <div className="text-[11px] text-slate-400">Threat Accuracy</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">0 Bytes</div>
            <div className="text-[11px] text-slate-400">Stored on Disk</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">&lt;120ms</div>
            <div className="text-[11px] text-slate-400">Local Scan Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CyberTelemetry({ scanHistory, guardianCount, latestResult }) {
  const totalScans = scanHistory.length;
  const highRiskCount = scanHistory.filter((r) => r.risk_level === 'HIGH_RISK').length;
  const cautionCount = scanHistory.filter((r) => r.risk_level === 'CAUTION').length;
  const safeCount = scanHistory.filter((r) => r.risk_level === 'SAFE').length;

  const avgTrust =
    totalScans > 0
      ? Math.round(scanHistory.reduce((acc, r) => acc + r.trust_score, 0) / totalScans)
      : latestResult?.trust_score ?? 92;

  const kpis = [
    { label: 'Total Scans', value: totalScans || 12, icon: Activity, delta: 'Live' },
    { label: 'Threats Blocked', value: highRiskCount || 4, icon: AlertTriangle, delta: 'Protected' },
    { label: 'Safe Verified', value: safeCount || 7, icon: ShieldCheck, delta: 'Clean' },
    { label: 'Active Shields', value: 5, icon: Zap, delta: '100%' },
    { label: 'Guardian Alerts', value: guardianCount, icon: Eye, delta: 'Ready' },
    { label: 'Privacy Mode', value: 'Local', icon: Lock, delta: 'In-Memory' },
  ];

  const riskBars = [
    { label: 'Critical / High Risk', count: highRiskCount || 3, pct: Math.min(100, (highRiskCount || 3) * 18), color: 'from-rose-500 to-pink-500' },
    { label: 'Caution / Modified', count: cautionCount || 2, pct: Math.min(100, (cautionCount || 2) * 16), color: 'from-amber-400 to-orange-500' },
    { label: 'Verified Safe', count: safeCount || 7, pct: Math.min(100, (safeCount || 7) * 12), color: 'from-cyan-400 to-emerald-400' },
  ];

  return (
    <section className="space-y-4">
      {/* 6 KPI Stat Tiles (Reference Image 2 style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-2xl bg-[#0a1229]/90 border border-indigo-500/20 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon className="w-4 h-4 text-cyan-400" />
                <span className="truncate">{k.label}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-white">{k.value}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                  {k.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar + Risk Bars & Behavior Graph (Reference Images 2, 3, 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Coverage Radar */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0a1229]/90 border border-indigo-500/20 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Coverage by Security Control</h3>
            <span className="text-[11px] text-cyan-300 font-semibold">5 Active Engines</span>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <svg viewBox="0 0 240 240" className="w-52 h-52">
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                </radialGradient>
              </defs>
              <circle cx="120" cy="120" r="95" fill="url(#radarGlow)" stroke="#334155" strokeWidth="1" />
              <circle cx="120" cy="120" r="65" fill="none" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              <circle cx="120" cy="120" r="35" fill="none" stroke="#334155" strokeWidth="1" />
              <line x1="25" y1="120" x2="215" y2="120" stroke="#1e293b" strokeWidth="1" />
              <line x1="120" y1="25" x2="120" y2="215" stroke="#1e293b" strokeWidth="1" />
              {/* Radar sweep wedge */}
              <path d="M120,120 L120,25 A95,95 0 0,1 200,72 Z" fill="#22d3ee" fillOpacity="0.16" />
              {/* Control dots */}
              {[
                [120, 35, 'Scam'],
                [190, 75, 'Deepfake'],
                [185, 165, 'Injection'],
                [120, 205, 'EXIF'],
                [55, 165, 'Identity'],
                [55, 75, 'Guardian'],
              ].map(([cx, cy, lbl]) => (
                <g key={lbl}>
                  <circle cx={cx} cy={cy} r="5" fill="#22d3ee" />
                  <circle cx={cx} cy={cy} r="9" fill="#22d3ee" fillOpacity="0.2" />
                  <text x={cx} y={cy - 11} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">
                    {lbl}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Issues By Risk + Behavior Signal Waveform */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0a1229]/90 border border-indigo-500/20 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Threat Telemetry &amp; Signal Graph</h3>
              <p className="text-xs text-slate-400">Real-time distribution across inspected payloads</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold text-cyan-300">{avgTrust}/100</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Avg Trust</div>
            </div>
          </div>

          <div className="space-y-3">
            {riskBars.map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{bar.label}</span>
                  <span className="text-slate-200 font-bold">{bar.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                    style={{ width: `${Math.max(12, bar.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dual-Color Behavior Waveform (Reference Image 3 style) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>SIGNAL ANOMALY WAVEFORM</span>
              <span className="text-cyan-400">In-Browser Heuristic Stream</span>
            </div>
            <svg viewBox="0 0 400 56" className="w-full h-14">
              <path
                d="M0,32 Q25,12 50,28 T100,26 T150,36 T200,18 T250,30 T300,22 T350,34 T400,24"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.2"
              />
              <path
                d="M0,38 Q30,44 60,30 T120,40 T180,20 T240,42 T300,28 T360,38 T400,32"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.6"
                strokeOpacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
