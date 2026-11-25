import React from 'react';
import { BellRing, CheckCircle2, Clock } from 'lucide-react';

export default function FamilyGuardianPanel({ logs, toast, ageMode }) {
  const isDark = ageMode === 'young_adult';

  return (
    <>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-emerald-600 text-white shadow-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Family Guardian Notified!</div>
            <div className="text-xs text-emerald-50 mt-0.5">{toast}</div>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <section
          className={`rounded-2xl p-5 ${
            isDark
              ? 'bg-slate-900 border border-slate-800 text-slate-100'
              : 'bg-white border-2 border-slate-300 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <BellRing className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base">Family Guardian Alert Log</h3>
          </div>
          <div className="space-y-2">
            {logs.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 ${
                  isDark ? 'bg-slate-950 border border-slate-800' : 'bg-rose-50 border border-rose-200'
                }`}
              >
                <div>
                  <span className="font-bold text-rose-500">[{item.risk_level} • {item.trust_score}/100]</span>{' '}
                  <span className="font-medium">{item.verdict}</span> — Shared with <span className="font-semibold">{item.contact}</span>
                </div>
                <div className="flex items-center gap-1 opacity-70 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
