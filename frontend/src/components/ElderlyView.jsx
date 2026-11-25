import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  speakMessage,
  stopSpeaking,
  startListening,
  stopListening,
} from '../utils/speech';
import { runScamAnalysis, runDeepfakeAnalysis } from '../utils/clientAnalyzers';

export default function ElderlyView({ onAlertGuardian }) {
  // Default language is strictly English ('en') as requested!
  const [lang, setLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  const isMl = lang === 'ml';

  // Common quick scam presets
  const PRESETS = [
    {
      label: isMl ? '🎰 ലോട്ടറി ₹50 ലക്ഷം' : '🎰 Won ₹50 Lakh Lottery',
      text: 'Congratulations! You won Rs 50,00,000 lottery. Pay processing charge Rs 2,500 immediately to account 9876543210.',
    },
    {
      label: isMl ? '⚡ വൈദ്യുതി വിച്ഛേദിക്കും' : '⚡ Electricity Bill Disconnect',
      text: 'Dear consumer, your electricity bill is unpaid. Power will be disconnected tonight. Call officer at 9876543210 immediately.',
    },
    {
      label: isMl ? '🏦 പെൻഷൻ KYC ബ്ലോക്ക്' : '🏦 Pension KYC Block Warning',
      text: 'URGENT: Your SBI Pension account KYC is expired. Click http://sbi-pension-kyc.xyz immediately or account will be frozen.',
    },
    {
      label: isMl ? '👮 ഡിജിറ്റൽ അറസ്റ്റ്' : '👮 Police / Digital Arrest Call',
      text: 'Officer calling from Customs: A parcel with drugs was seized in your name. You are under digital arrest. Pay bail money right now.',
    },
  ];

  const handleCheckText = async (textToCheck) => {
    const text = textToCheck || textInput;
    if (!text.trim()) return;

    setAnalyzing(true);
    setResult(null);
    setAlertSuccess(false);

    try {
      const res = await runScamAnalysis(text);
      setResult(res);

      const speakText = isMl
        ? res.risk_level === 'HIGH_RISK'
          ? 'ജാഗ്രത! ഇത് തട്ടിപ്പാകാൻ വലിയ സാധ്യതയുണ്ട്. ആർക്കും പണമോ ഒ.ടി.പിയോ നൽകരുത്.'
          : 'ഈ സന്ദേശം സുരക്ഷിതമായി തോന്നുന്നു.'
        : res.risk_level === 'HIGH_RISK'
          ? 'Warning! This is very likely a scam. Do not send money or share your OTP.'
          : 'This message appears safe to proceed.';

      handleSpeak(speakText);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setResult(null);
    try {
      const res = await runDeepfakeAnalysis(file);
      setResult(res);
      const speakText = isMl ? res.elderly_summary_ml : res.elderly_summary_en;
      handleSpeak(speakText);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }

    setVoiceQuery('');
    setIsListening(true);
    stopSpeaking();
    setIsSpeaking(false);

    const recLang = isMl ? 'ml-IN' : 'en-IN';
    startListening({
      lang: recLang,
      onResult: (transcript, isFinal) => {
        setVoiceQuery(transcript);
        setTextInput(transcript);
        if (isFinal) {
          setIsListening(false);
          handleCheckText(transcript);
        }
      },
      onError: (err) => {
        setIsListening(false);
        console.warn('Voice error:', err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleSpeak = (text) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const ttsLang = isMl ? 'ml-IN' : 'en-IN';
    setIsSpeaking(true);
    speakMessage(text, ttsLang, () => setIsSpeaking(false));
  };

  const handleEmergencyAlert = () => {
    if (onAlertGuardian) {
      onAlertGuardian(
        result || {
          trust_score: 10,
          risk_level: 'HIGH_RISK',
          verdict_title: isMl ? 'അടിയന്തര സഹായം ആവശ്യപ്പെട്ടു' : 'Emergency Assistance Requested',
        }
      );
    }
    setAlertSuccess(true);
    const msg = isMl
      ? 'നിങ്ങളുടെ കുടുംബാംഗത്തിന് സന്ദേശം അയച്ചിട്ടുണ്ട്. അവർ ഉടൻ നിങ്ങളെ ബന്ധപ്പെടും.'
      : 'Alert message sent to your family guardian. They will contact you shortly.';
    handleSpeak(msg);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10 animate-fade-in text-slate-900">
      {/* 1. Clean Top Bar with Language Toggle */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {isMl ? 'സുരക്ഷിതമായി തുടരാം' : 'Senior Digital Safety Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isMl ? 'സംശയമുള്ള കാര്യങ്ങൾ വോയ്സ് വഴിയോ ടൈപ്പ് ചെയ്തോ ചോദിക്കാം' : 'Speak or type any suspicious message to check'}
          </p>
        </div>

        {/* Language Selection: English (Default) vs മലയാളം */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => {
              setLang('en');
              stopSpeaking();
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition ${
              !isMl ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-black'
            }`}
          >
            English
          </button>
          <button
            onClick={() => {
              setLang('ml');
              stopSpeaking();
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition ${
              isMl ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-black'
            }`}
          >
            മലയാളം
          </button>
        </div>
      </div>

      {/* 2. Top Priority: Voice Assistant & Search / Check Box */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-400 space-y-4">
        {/* Voice Chat Pill */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`p-4 rounded-full shadow-lg transition active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-200'
              }`}
              title="Speak Now"
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <div>
              <div className="font-extrabold text-base text-slate-900">
                {isListening
                  ? isMl ? 'ശ്രദ്ധിക്കുന്നു... പറയൂ' : 'Listening... Speak now'
                  : isMl ? 'വോയ്സ് ചാറ്റ് (ശബ്ദം വഴി ചോദിക്കാം)' : 'Voice Assistant (Tap mic to speak)'}
              </div>
              <div className="text-xs text-slate-500">
                {isMl ? 'ഉദാ: "ലോട്ടറി അടിച്ചെന്ന് സന്ദേശം വന്നു, ഇത് ശരിയാണോ?"' : 'e.g. "I got a message saying I won a lottery, is it real?"'}
              </div>
            </div>
          </div>
        </div>

        {voiceQuery && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
            &ldquo;{voiceQuery}&rdquo;
          </div>
        )}

        {/* Search & Paste Box */}
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={3}
          placeholder={
            isMl
              ? 'വന്ന സന്ദേശം, ലിങ്ക് അല്ലെങ്കിൽ ഫോൺ നമ്പർ ഇവിടെ പേസ്റ്റ് ചെയ്യുക...'
              : 'Paste SMS, WhatsApp message, link, or phone number to check...'
          }
          className="w-full text-base sm:text-lg p-3.5 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-none bg-slate-50 text-slate-900"
        />

        {/* Action Buttons: Upload Photo & Check Now */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 transition">
            <Upload className="w-4 h-4 text-emerald-700" />
            {isMl ? 'ഫോട്ടോ നൽകുക' : 'Upload Screenshot / Photo'}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => handleCheckText()}
            disabled={analyzing || !textInput.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-base font-extrabold shadow transition"
          >
            {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isMl ? 'പരിശോധിക്കുക' : 'Check Now'}
          </button>
        </div>

        {/* 1-Click Common Scam Quick Pills */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {isMl ? 'പെട്ടെന്ന് പരീക്ഷിക്കാൻ (1-Click Test):' : 'Quick Samples (1-Click Test):'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTextInput(p.text);
                  handleCheckText(p.text);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Analysis Result (Displays right here when checked) */}
      {result && (
        <div
          className={`rounded-2xl p-5 border-2 shadow-lg space-y-3 animate-fade-in ${
            result.risk_level === 'HIGH_RISK'
              ? 'bg-rose-50 border-rose-500 text-rose-950'
              : 'bg-emerald-50 border-emerald-500 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {result.risk_level === 'HIGH_RISK' ? (
                <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border">
                  {result.risk_level === 'HIGH_RISK'
                    ? isMl ? '⚠️ തട്ടിപ്പാണ്! (DANGER)' : '⚠️ HIGH RISK SCAM'
                    : isMl ? '✅ സുരക്ഷിതമാണ് (SAFE)' : '✅ LOOKS SAFE'}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold mt-0.5">{result.verdict_title}</h3>
              </div>
            </div>

            <button
              onClick={() =>
                handleSpeak(
                  isMl
                    ? result.elderly_summary_ml || result.summary
                    : result.elderly_summary_en || result.summary
                )
              }
              className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-300 hover:bg-slate-100 text-slate-800"
              title="Read Aloud"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
            </button>
          </div>

          <p className="text-base sm:text-lg font-bold leading-relaxed">
            {isMl ? result.elderly_summary_ml : result.elderly_summary_en}
          </p>

          <div className="bg-white/90 rounded-xl p-3 border border-slate-200 text-sm font-semibold text-slate-800">
            {result.risk_level === 'HIGH_RISK' ? (
              <span className="text-rose-700 font-bold">
                {isMl ? '🚫 ആർക്കും പണമോ ബാങ്ക് OTPയോ നൽകരുത്. ലിങ്കിൽ ക്ലിക്ക് ചെയ്യരുത്.' : '🚫 Do NOT click any links, send money, or share bank OTP.'}
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">
                {isMl ? 'തട്ടിപ്പ് ലക്ഷണങ്ങൾ കണ്ടെത്തിയില്ല.' : 'No obvious threat patterns detected.'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Family Guardian Call Button */}
      <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold text-rose-600 uppercase">
            {isMl ? 'കുടുംബ സഹായം' : 'Family Emergency Shield'}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            {isMl ? 'കുടുംബാംഗത്തെ അറിയിക്കുക' : 'Alert Family Guardian'}
          </h3>
          <p className="text-xs text-slate-600">
            {isMl ? 'സംശയകരമായ സാഹചര്യമുണ്ടായാൽ കുടുംബാംഗത്തെ വിവരമറിയിക്കാം' : 'One tap to alert your trusted contact if in doubt'}
          </p>
        </div>

        <button
          onClick={handleEmergencyAlert}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-base font-extrabold shadow transition active:scale-95"
        >
          <PhoneCall className="w-5 h-5" />
          {isMl ? 'കുടുംബാംഗത്തെ അറിയിക്കുക' : 'Alert Guardian'}
        </button>

        {alertSuccess && (
          <div className="w-full p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {isMl
              ? 'കുടുംബാംഗത്തിന് സന്ദേശം അയച്ചിട്ടുണ്ട്.'
              : 'Alert message sent to your family guardian.'}
          </div>
        )}
      </div>
    </div>
  );
}
