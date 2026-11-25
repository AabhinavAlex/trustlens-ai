import React, { useState } from 'react';
import UnifiedDropZone from './UnifiedDropZone';
import AnalysisResult from './AnalysisResult';
import ScamImmunitySimulator from './ScamImmunitySimulator';
import CyberTelemetry from './CyberTelemetry';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export default function CyberProView({
  activeTab,
  activeFeature,
  selectedEndpoint,
  onClearSelectedEndpoint,
  loading,
  latestResult,
  scanHistory,
  guardianCount,
  onAnalyze,
  onAlertGuardian,
}) {
  const [showTelemetry, setShowTelemetry] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* 1. TOP PRIORITY: Search & Scan Bar right at the top */}
      {activeTab === 'analyzer' ? (
        <div className="space-y-6">
          <UnifiedDropZone
            ageMode="young_adult"
            onAnalyze={onAnalyze}
            loading={loading}
            selectedEndpoint={selectedEndpoint}
            onClearSelectedEndpoint={onClearSelectedEndpoint}
          />

          {/* Analysis Result (Appears immediately below scan bar) */}
          <AnalysisResult
            result={latestResult}
            ageMode="young_adult"
            onAlertGuardian={onAlertGuardian}
          />
        </div>
      ) : (
        <ScamImmunitySimulator ageMode="young_adult" />
      )}

      {/* 2. BOTTOM SECTION: Extra Telemetry & Forensics neatly placed at the bottom */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setShowTelemetry((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0a1229]/80 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-white transition"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Cyber Threat Telemetry, Radar &amp; Signal Waveform</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold">
              Live SOC
            </span>
          </div>
          {showTelemetry ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTelemetry && (
          <div className="mt-4 animate-fade-in">
            <CyberTelemetry
              scanHistory={scanHistory}
              guardianCount={guardianCount}
              latestResult={latestResult}
            />
          </div>
        )}
      </div>
    </div>
  );
}
