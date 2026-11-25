import React, { useState } from 'react';
import { QrCode, MessageSquareWarning, Mic, CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'upi_qr',
    title: 'Scenario 1: OLX / Marketplace UPI QR Trap',
    icon: QrCode,
    prompt:
      'A buyer on a classifieds app says: "I am sending ₹4,500 advance! Scan this QR code and enter your UPI PIN to RECEIVE the money."',
    payload: 'upi://pay?pa=buyer-refund@okaxis&pn=Receive%20Cashback&am=4500&mode=02',
    isScam: true,
    explanation:
      'Entering a UPI PIN is ONLY for sending money, never for receiving it. Scanning this QR would debit ₹4,500 from your account.',
  },
  {
    id: 'kyc_sms',
    title: 'Scenario 2: Bank KYC Suspension SMS',
    icon: MessageSquareWarning,
    prompt:
      'SMS received from +91-98XXXXXX12: "Dear User, your SBI YONO KYC expires in 2 hours. Update immediately at http://sbi-kyc-update.xyz or account will be blocked."',
    payload: 'http://sbi-kyc-update.xyz',
    isScam: true,
    explanation:
      'Banks never send KYC links via personal mobile numbers or .xyz domains. Always use the official bank app or branch.',
  },
  {
    id: 'ai_voice',
    title: 'Scenario 3: Urgent AI Voice Clone Call',
    icon: Mic,
    prompt:
      'You receive a 12-second WhatsApp voice note sounding like your cousin: "My phone fell in water, I am at the hospital, please send ₹15,000 to this new UPI ID right now, don’t call back!"',
    payload: 'AI Voice Clone + Urgency + No-Callback Rule',
    isScam: true,
    explanation:
      'Scammers clone voices from 5-second social media clips and create panic ("don’t call back"). Always call the person’s known number directly.',
  },
];

export default function ScamImmunitySimulator({ ageMode }) {
  const [answers, setAnswers] = useState({});
  const isDark = ageMode === 'young_adult';
  const isElderly = ageMode === 'elderly';

  const answeredCount = Object.keys(answers).length;
  const correctCount = SCENARIOS.filter((s) => answers[s.id] === (s.isScam ? 'scam' : 'real')).length;

  const choose = (id, choice) => {
    setAnswers((prev) => ({ ...prev, [id]: choice }));
  };

  const reset = () => setAnswers({});

  return (
    <section className="space-y-5">
      <div
        className={`rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border-2 border-slate-900 text-slate-950 shadow'
        }`}
      >
        <div>
          <h2 className={`font-extrabold ${isElderly ? 'text-2xl' : 'text-xl'}`}>Scam Immunity Simulator</h2>
          <p className={`mt-1 ${isElderly ? 'text-lg' : 'text-sm opacity-75'}`}>
            Test your instincts against 3 real-world digital threats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold">
            <Trophy className="w-5 h-5" />
            Score: {correctCount} / {SCENARIOS.length}
          </div>
          {answeredCount > 0 && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const userChoice = answers[sc.id];
          const isCorrect = userChoice && userChoice === (sc.isScam ? 'scam' : 'real');

          return (
            <div
              key={sc.id}
              className={`rounded-2xl p-5 space-y-3 ${
                isDark ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-white border-2 border-slate-300 text-slate-950 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-6 h-6 text-blue-500 shrink-0" />
                <h3 className={`font-bold ${isElderly ? 'text-xl' : 'text-lg'}`}>{sc.title}</h3>
              </div>

              <p className={`${isElderly ? 'text-lg' : 'text-sm sm:text-base'} leading-relaxed`}>{sc.prompt}</p>

              <div
                className={`p-2.5 rounded-lg font-mono text-xs break-all ${
                  isDark ? 'bg-slate-950 text-amber-300' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {sc.payload}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => choose(sc.id, 'scam')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                    userChoice === 'scam'
                      ? 'bg-rose-600 text-white'
                      : isDark
                        ? 'bg-slate-800 hover:bg-rose-600/30 text-slate-200'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-900'
                  }`}
                >
                  It&apos;s a SCAM
                </button>
                <button
                  onClick={() => choose(sc.id, 'real')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                    userChoice === 'real'
                      ? 'bg-emerald-600 text-white'
                      : isDark
                        ? 'bg-slate-800 hover:bg-emerald-600/30 text-slate-200'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                  }`}
                >
                  Looks REAL
                </button>
              </div>

              {userChoice && (
                <div
                  className={`p-3.5 rounded-xl flex items-start gap-2.5 text-sm ${
                    isCorrect
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-bold">{isCorrect ? 'Correct! You spotted the trap.' : 'Watch out! That was a scam.'}</div>
                    <div className={`mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{sc.explanation}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
