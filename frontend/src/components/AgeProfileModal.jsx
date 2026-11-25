import React, { useState } from 'react';
import { User, Sparkles, Zap, HeartHandshake, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AgeProfileModal({ initialProfile, onSave, onClose }) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [age, setAge] = useState(initialProfile?.age ? String(initialProfile.age) : '');

  const numericAge = parseInt(age, 10);

  // Dynamic preview of auto-routed mode based on age
  let detectedMode = 'youth';
  let modeLabel = '⚡ Youth Mode (15 - 45 yrs)';
  let modeDesc = 'Full threat scanner, deepfake check & cybersecurity tools';
  let modeColor = 'from-cyan-500 to-blue-600';

  if (!isNaN(numericAge)) {
    if (numericAge < 15) {
      detectedMode = 'child';
      modeLabel = '👶 Child Mode (Below 15 yrs)';
      modeDesc = 'Game link traps, cyberbullying shield, stranger safety & quizzes';
      modeColor = 'from-amber-400 to-orange-500';
    } else if (numericAge > 45) {
      detectedMode = 'elderly';
      modeLabel = '👵 Elderly Mode (Above 45 yrs)';
      modeDesc = 'Voice assistant, large text, Malayalam option & 1-click guardian alert';
      modeColor = 'from-emerald-500 to-teal-600';
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAge = isNaN(numericAge) ? 25 : numericAge;
    const finalName = name.trim() || 'User';

    let finalMode = 'young_adult';
    if (finalAge < 15) finalMode = 'child';
    else if (finalAge > 45) finalMode = 'elderly';

    onSave({
      name: finalName,
      age: finalAge,
      mode: finalMode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border-2 border-slate-100 p-6 sm:p-8 space-y-5 text-slate-900">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome to TrustLens AI
          </h2>
          <p className="text-sm text-slate-500">
            Enter your name &amp; age for age-adaptive protection
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Your Name / പേര്
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex / അമ്മ / Rahul"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-base font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Your Age / പ്രായം
            </label>
            <input
              type="number"
              min="5"
              max="110"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 12, 24, or 58"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-lg font-bold text-slate-900"
            />
          </div>

          {/* Age-adaptive auto-routed preview box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Auto-Selected Interface:
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold text-white bg-gradient-to-r ${modeColor} shadow-sm`}>
                {modeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {modeDesc}
            </p>
          </div>

          {/* Age guideline legend */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-semibold pt-1">
            <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              👶 &lt; 15<br />Child
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-900">
              ⚡ 15 – 45<br />Youth
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
              👵 &gt; 45<br />Elderly
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-600 hover:bg-slate-100 transition"
              >
                Skip
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
