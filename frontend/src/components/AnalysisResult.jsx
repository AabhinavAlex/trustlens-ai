import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  VolumeX,
  Download,
  Printer,
  PhoneCall,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { speakMessage, stopSpeaking } from '../utils/speech';
import { downloadTrustPassport, printTrustPassport } from '../utils/trustPassport';

function TrustGauge({ score, risk }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const stroke = risk === 'SAFE' ? '#10b981' : risk === 'CAUTION' ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="opacity-15" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-extrabold leading-none">{score}</div>
        <div className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">Trust</div>
      </div>
    </div>
  );
}

export default function AnalysisResult({ result, ageMode, onAlertGuardian }) {
  const [speakingLang, setSpeakingLang] = useState(null);

  if (!result) return null;

  const isDark = ageMode === 'young_adult';
  const isChild = ageMode === 'child';
  const isElderly = ageMode === 'elderly';

  const riskBadge =
    result.risk_level === 'SAFE'
      ? { bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', icon: ShieldCheck, label: 'SAFE' }
      : result.risk_level === 'CAUTION'
        ? { bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: AlertTriangle, label: 'CAUTION' }
        : { bg: 'bg-rose-500/15 text-rose-600 border-rose-500/30', icon: ShieldAlert, label: 'HIGH RISK' };

  const RiskIcon = riskBadge.icon;

  const handleSpeak = (lang) => {
    if (speakingLang === lang) {
      stopSpeaking();
      setSpeakingLang(null);
      return;
    }
    const text =
      lang === 'ml-IN'
        ? result.elderly_summary_ml
        : isChild
          ? result.child_tip
          : result.elderly_summary_en;
    setSpeakingLang(lang);
    speakMessage(text, lang, () => setSpeakingLang(null));
  };

  const cardClass = isDark
    ? 'bg-slate-900 border border-slate-800 text-slate-100'
    : isChild
      ? 'bg-white border-4 border-amber-300 text-slate-900 shadow-lg'
      : 'bg-white border-4 border-slate-950 text-slate-950 shadow-md';

  return (
    <section className={`rounded-2xl p-5 sm:p-6 space-y-5 ${cardClass}`}>
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <TrustGauge score={result.trust_score} risk={result.risk_level} />
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskBadge.bg}`}>
              <RiskIcon className="w-4 h-4" />
              {riskBadge.label} • {Math.round(result.confidence * 100)}% confidence
            </div>
            <h3 className={`font-extrabold mt-2 ${isElderly ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              {result.verdict_title}
            </h3>
            <p className={`mt-1 ${isElderly ? 'text-xl font-medium leading-relaxed' : isDark ? 'text-slate-300 text-sm' : 'text-slate-700 text-base'}`}>
              {isChild ? result.child_tip : isElderly ? result.elderly_summary_en : result.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Child Mode Friendly Tip Box */}
      {isChild && (
        <div className="p-4 rounded-2xl bg-sky-100 border-2 border-sky-300 text-sky-950 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-base">Kid Safety Tip</div>
            <div className="text-base">{result.child_tip}</div>
          </div>
        </div>
      )}

      {/* Elderly Mode: Malayalam + English Voice Readout & Big Guardian Button */}
      {isElderly && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-slate-950 space-y-4">
          <div className="text-lg font-bold text-slate-950">Malayalam Summary (മലയാളം):</div>
          <p className="text-xl font-semibold text-slate-900 leading-relaxed">{result.elderly_summary_ml}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSpeak('en-IN')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-950 text-white text-lg font-bold hover:bg-slate-800"
            >
              {speakingLang === 'en-IN' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              {speakingLang === 'en-IN' ? 'Stop English Voice' : 'Read Aloud (English)'}
            </button>
            <button
              onClick={() => handleSpeak('ml-IN')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-blue-700 text-white text-lg font-bold hover:bg-blue-600"
            >
              {speakingLang === 'ml-IN' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              {speakingLang === 'ml-IN' ? 'Stop Malayalam' : 'Read Aloud (മലയാളം)'}
            </button>
            <button
              onClick={() => onAlertGuardian(result)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 text-white text-lg font-extrabold hover:bg-rose-500 shadow"
            >
              <PhoneCall className="w-5 h-5" />
              Call / Alert Family Guardian
            </button>
          </div>
        </div>
      )}

      {/* Forensic Breakdown (shown in Young Adult & compactly in others) */}
      {!isChild && (
        <div>
          <h4 className={`font-bold mb-2.5 ${isElderly ? 'text-xl' : 'text-sm uppercase tracking-wider text-slate-400'}`}>
            Forensic Signal Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.forensic_details.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-slate-50 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold ${isElderly ? 'text-base' : 'text-xs opacity-75'}`}>{item.label}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.severity === 'danger'
                        ? 'bg-rose-500'
                        : item.severity === 'warn'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className={`mt-1 font-medium break-words ${isElderly ? 'text-lg' : 'text-sm'}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar: Trust Passport, Voice Readout (non-elderly), Family Guardian */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-500/20">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadTrustPassport(result)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Download Trust Passport (SHA-256)
          </button>
          <button
            onClick={() => printTrustPassport(result)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            Printable Summary
          </button>
          {!isElderly && (
            <>
              <button
                onClick={() => handleSpeak('en-IN')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {speakingLang === 'en-IN' ? 'Stop' : 'Speak EN'}
              </button>
              <button
                onClick={() => onAlertGuardian(result)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                <PhoneCall className="w-4 h-4" />
                Alert Family Guardian
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs opacity-70">
          <Lock className="w-3.5 h-3.5" />
          <span>SHA-256: {result.sha256_hash.slice(0, 14)}...</span>
        </div>
      </div>
    </section>
  );
}
