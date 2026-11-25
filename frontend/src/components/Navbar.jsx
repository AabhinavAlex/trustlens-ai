import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Zap,
  HeartHandshake,
  Gamepad2,
  ScanSearch,
  ShieldAlert,
  FileCode2,
  Camera,
  FileCheck2,
  BellRing,
  User,
} from 'lucide-react';

const MODES = [
  { id: 'child', label: 'Child', icon: Sparkles, color: 'from-amber-400 to-orange-400' },
  { id: 'young_adult', label: 'Youth', icon: Zap, color: 'from-cyan-400 to-blue-500' },
  { id: 'elderly', label: 'Elderly', icon: HeartHandshake, color: 'from-emerald-500 to-teal-600' },
];

export const TOP_FEATURES = [
  { id: 'auto', label: 'Smart Scanner', icon: ScanSearch, tab: 'analyzer', endpoint: null },
  { id: 'scam', label: 'Scam & UPI Guard', icon: ShieldAlert, tab: 'analyzer', endpoint: '/api/scam' },
  { id: 'deepfake', label: 'Deepfake Check', icon: Camera, tab: 'analyzer', endpoint: '/api/deepfake' },
  { id: 'injection', label: 'Prompt Injection', icon: FileCode2, tab: 'analyzer', endpoint: '/api/prompt-injection' },
  { id: 'authenticity', label: 'EXIF Origin', icon: FileCheck2, tab: 'analyzer', endpoint: '/api/authenticity' },
  { id: 'simulator', label: 'Scam Simulator', icon: Gamepad2, tab: 'simulator', endpoint: null },
];

export default function Navbar({
  ageMode,
  setAgeMode,
  userProfile,
  onOpenProfileModal,
  activeTab,
  activeFeature,
  onSelectFeature,
  guardianCount,
  onScrollToGuardian,
}) {
  const isDark = ageMode === 'young_adult';
  const isChild = ageMode === 'child';
  const isElderly = ageMode === 'elderly';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isDark
          ? 'bg-[#060b19]/90 backdrop-blur-xl border-b border-cyan-500/20 text-white'
          : isChild
            ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-md'
            : 'bg-white/95 backdrop-blur-md border-b-2 border-slate-200 text-slate-950 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 space-y-2">
        {/* Main Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30'
                  : isChild
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-600 text-white'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-lg leading-none flex items-center gap-2">
                TrustLens AI
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isDark
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : isChild
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isChild ? 'Child Safe' : isElderly ? 'Elderly Care' : 'Youth Cyber'}
                </span>
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  isDark ? 'text-slate-400' : isChild ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                Zero-Backend In-Browser Privacy
              </div>
            </div>
          </div>

          {/* Right Controls: Profile pill + Guardian + Mode switcher */}
          <div className="flex items-center gap-2">
            {/* User Profile Pill with Age (e.g. Alex • 24y) */}
            <button
              onClick={onOpenProfileModal}
              title="Click to change your Name & Age"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : isChild
                    ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{userProfile?.name || 'User'}</span>
              {userProfile?.age && <span className="opacity-75">({userProfile.age}y)</span>}
            </button>

            {/* Guardian Button */}
            {guardianCount > 0 && !isElderly && (
              <button
                onClick={onScrollToGuardian}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition"
              >
                <BellRing className="w-3.5 h-3.5" />
                Alerts ({guardianCount})
              </button>
            )}

            {/* Age Mode Switcher: Child / Youth / Elderly */}
            <div
              className={`flex items-center p-0.5 rounded-xl transition-all ${
                isDark
                  ? 'bg-[#0a1229] border border-slate-700/80'
                  : isChild
                    ? 'bg-white/15 border border-white/20'
                    : 'bg-slate-100 border border-slate-300'
              }`}
            >
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = ageMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAgeMode(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? `bg-gradient-to-r ${m.color} text-white shadow`
                        : isDark
                          ? 'text-slate-400 hover:text-white'
                          : isChild
                            ? 'text-white/80 hover:bg-white/10'
                            : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Tools Row for Youth mode */}
        {isDark && (
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar border-t border-slate-800/80 pt-1.5">
            {TOP_FEATURES.map((feat) => {
              const Icon = feat.icon;
              const isSelected =
                (feat.tab === 'simulator' && activeTab === 'simulator') ||
                (feat.tab === 'analyzer' && activeTab === 'analyzer' && activeFeature === feat.id);

              return (
                <button
                  key={feat.id}
                  onClick={() => onSelectFeature(feat)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {feat.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
