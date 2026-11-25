import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles, ShieldAlert, FileText, Image as ImageIcon, Loader2, X, Cpu } from 'lucide-react';
import { detectRoute } from '../utils/autoRouter';
import { SAMPLE_SCAM, SAMPLE_PROMPT_INJECTION, createSampleDeepfakeFile } from '../utils/demoSamples';

export default function UnifiedDropZone({
  ageMode,
  onAnalyze,
  loading,
  selectedEndpoint,
  onClearSelectedEndpoint,
}) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [overrideEndpoint, setOverrideEndpoint] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const isDark = ageMode === 'young_adult';
  const isChild = ageMode === 'child';
  const isElderly = ageMode === 'elderly';

  const activeOverride = overrideEndpoint || selectedEndpoint;
  const route = detectRoute({ text, file, overrideEndpoint: activeOverride });

  const handleFileChange = (newFile) => {
    if (!newFile) return;
    setFile(newFile);
    setText('');
    setOverrideEndpoint(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerAnalysis = () => {
    if (!route || loading) return;
    onAnalyze({ text, file, endpoint: route.endpoint });
  };

  const runDemoScam = () => {
    setFile(null);
    setOverrideEndpoint('/api/scam');
    setText(SAMPLE_SCAM);
    onAnalyze({ text: SAMPLE_SCAM, file: null, endpoint: '/api/scam' });
  };

  const runDemoInjection = () => {
    setFile(null);
    setOverrideEndpoint('/api/prompt-injection');
    setText(SAMPLE_PROMPT_INJECTION);
    onAnalyze({ text: SAMPLE_PROMPT_INJECTION, file: null, endpoint: '/api/prompt-injection' });
  };

  const runDemoDeepfake = async () => {
    const sampleFile = await createSampleDeepfakeFile();
    setText('');
    setFile(sampleFile);
    setOverrideEndpoint('/api/deepfake');
    onAnalyze({ text: '', file: sampleFile, endpoint: '/api/deepfake' });
  };

  const cardClass = isDark
    ? 'bg-[#0a1229]/95 border border-cyan-500/25 text-slate-100 shadow-[0_0_30px_rgba(14,165,233,0.08)]'
    : isChild
      ? 'bg-white border-4 border-sky-300 text-slate-800 shadow-lg'
      : 'bg-white border-4 border-slate-950 text-slate-950 shadow-md';

  const isImageFile = file && ((file.type || '').startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name));
  const isPdfFile = file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

  return (
    <section id="scanner-box" className={`rounded-2xl p-5 sm:p-6 ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className={`font-extrabold ${isElderly ? 'text-2xl' : 'text-xl'}`}>
            {isChild
              ? 'Check Any Link, Picture, or Message!'
              : isElderly
                ? 'Check Any Message, Link, Photo, or File'
                : 'Unified Smart Threat Scanner'}
          </h2>
          <p className={`mt-0.5 ${isElderly ? 'text-lg text-slate-800' : isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-600'}`}>
            Paste suspicious text, URLs, or UPI QR strings — or drop an image, audio clip, or PDF.
          </p>
        </div>

        {route && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isDark
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/35'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Engine: {route.shortLabel}
          </div>
        )}
      </div>

      {/* Drop Zone + Textarea */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-4 transition ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : isDark
              ? 'border-slate-700 bg-[#050a18]/80'
              : isChild
                ? 'border-sky-300 bg-sky-50/60'
                : 'border-slate-900 bg-slate-50'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/20">
            <div className="flex items-center gap-3 min-w-0">
              {isImageFile ? <ImageIcon className="w-6 h-6 text-cyan-400 shrink-0" /> : <FileText className="w-6 h-6 text-indigo-400 shrink-0" />}
              <div className="truncate">
                <div className={`font-semibold truncate ${isElderly ? 'text-lg' : 'text-sm'}`}>{file.name}</div>
                <div className="text-xs opacity-75">{(file.size / 1024).toFixed(1)} KB • Ready for in-browser scan</div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setOverrideEndpoint(null);
                onClearSelectedEndpoint?.();
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOverrideEndpoint(null);
            }}
            rows={isElderly ? 4 : 3}
            placeholder="Paste SMS, WhatsApp forward, URL (http://...), UPI QR string (upi://pay?...), or AI prompt text..."
            className={`w-full bg-transparent outline-none resize-none ${
              isElderly ? 'text-xl placeholder:text-slate-500' : 'text-sm sm:text-base'
            } ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        )}

        {isImageFile && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-500/20">
            <span className="text-xs font-semibold opacity-75">Image Check Mode:</span>
            {[
              { ep: '/api/deepfake', label: 'Deepfake Artifacts' },
              { ep: '/api/authenticity', label: 'EXIF Origin' },
              { ep: '/api/identity', label: 'File Integrity' },
            ].map((opt) => (
              <button
                key={opt.ep}
                onClick={() => setOverrideEndpoint(opt.ep)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  route?.endpoint === opt.ep
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {isPdfFile && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-500/20">
            <span className="text-xs font-semibold opacity-75">PDF Check Mode:</span>
            {[
              { ep: '/api/identity', label: 'PDF Integrity & Scripts' },
              { ep: '/api/prompt-injection', label: 'Scan PDF Text for Prompt Injection' },
            ].map((opt) => (
              <button
                key={opt.ep}
                onClick={() => setOverrideEndpoint(opt.ep)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  route?.endpoint === opt.ep
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-500/20">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,.pdf,.txt,.md"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center gap-2 rounded-xl font-semibold transition ${
                isElderly
                  ? 'px-5 py-3 text-lg border-2 border-slate-950 bg-amber-300 text-slate-950'
                  : 'px-3.5 py-2 text-sm'
              } ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : isChild
                    ? 'bg-amber-300 hover:bg-amber-400 text-slate-900'
                    : !isElderly && 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload Image / Audio / PDF
            </button>
          </div>

          <button
            type="button"
            disabled={!route || loading}
            onClick={triggerAnalysis}
            className={`inline-flex items-center gap-2 rounded-xl font-bold transition disabled:opacity-40 ${
              isElderly
                ? 'px-7 py-3.5 text-xl bg-slate-950 text-white hover:bg-slate-800'
                : isDark
                  ? 'px-5 py-2.5 text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                  : 'px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white shadow'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing...' : isChild ? 'Check Now!' : 'Run TrustLens Scan'}
          </button>
        </div>
      </div>

      {/* Stage Demo Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          1-Click Live Demos:
        </span>
        <button
          type="button"
          disabled={loading}
          onClick={runDemoScam}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isDark
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Try Sample Scam
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={runDemoInjection}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isDark
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Try Sample Prompt Injection
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={runDemoDeepfake}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isDark
              ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25'
              : 'bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Try Sample Deepfake
        </button>
      </div>
    </section>
  );
}
