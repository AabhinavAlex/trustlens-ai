import React from 'react';
import { ShieldAlert, PhoneCall, AlertOctagon } from 'lucide-react';

export default function PauseAndVerifyModal({ result, onDismiss, onAlertGuardian }) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full rounded-2xl bg-white text-slate-950 border-4 border-rose-600 shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="p-3 rounded-2xl bg-rose-100">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider">Pause &amp; Verify</div>
            <h3 className="text-2xl font-extrabold">High-Risk Threat Detected</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
          <div className="font-bold text-rose-900">
            Trust Score: {result.trust_score} / 100 — {result.verdict_title}
          </div>
          <p className="text-sm text-rose-800">{result.summary}</p>
        </div>

        <p className="text-sm text-slate-600">
          Take a 5-second pause before clicking any link, approving a UPI payment, or trusting this file.
        </p>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              onAlertGuardian(result);
              onDismiss();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm"
          >
            <PhoneCall className="w-4 h-4" />
            Alert Family Guardian
          </button>
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            I Understand — View Report
          </button>
        </div>
      </div>
    </div>
  );
}
