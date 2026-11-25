import React, { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import CyberProView from './components/CyberProView';
import ElderlyView from './components/ElderlyView';
import ChildView from './components/ChildView';
import PauseAndVerifyModal from './components/PauseAndVerifyModal';
import FamilyGuardianPanel from './components/FamilyGuardianPanel';
import AgeProfileModal from './components/AgeProfileModal';

import {
  runScamAnalysis,
  runPromptInjectionAnalysis,
  runDeepfakeAnalysis,
  runAuthenticityAnalysis,
  runIdentityAnalysis,
} from './utils/clientAnalyzers';
import { SAMPLE_SCAM } from './utils/demoSamples';

const ANALYZER_MAP = {
  '/api/scam': (payload) => runScamAnalysis(payload.text),
  '/api/prompt-injection': (payload) => runPromptInjectionAnalysis(payload),
  '/api/deepfake': (payload) => runDeepfakeAnalysis(payload.file),
  '/api/authenticity': (payload) => runAuthenticityAnalysis(payload.file),
  '/api/identity': (payload) => runIdentityAnalysis(payload.file),
};

export default function App() {
  // User profile state
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('trustlens_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: 'User', age: 24, mode: 'young_adult' };
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Age mode: 'child' (<15), 'young_adult' (15-45, Youth), 'elderly' (>45)
  const [ageMode, setAgeMode] = useState(() => userProfile.mode || 'young_adult');

  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'simulator'
  const [activeFeature, setActiveFeature] = useState('auto');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  const [guardianLogs, setGuardianLogs] = useState([]);
  const [guardianToast, setGuardianToast] = useState(null);

  const guardianRef = useRef(null);

  // Handle saving new profile from onboarding / modal
  const handleSaveProfile = ({ name, age, mode }) => {
    const updated = { name, age, mode };
    setUserProfile(updated);
    setAgeMode(mode);
    setShowProfileModal(false);
    try {
      localStorage.setItem('trustlens_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Feature nav handler (Youth mode)
  const handleSelectFeature = useCallback((feat) => {
    setActiveTab(feat.tab);
    setActiveFeature(feat.id);
    if (feat.endpoint) {
      setSelectedEndpoint(feat.endpoint);
    } else {
      setSelectedEndpoint(null);
    }
  }, []);

  // Analysis handler
  const handleAnalyze = useCallback(async ({ text, file, endpoint }) => {
    const analyzerFn = ANALYZER_MAP[endpoint];
    if (!analyzerFn) return;

    setLoading(true);
    try {
      const result = await analyzerFn({ text, file });
      setScanHistory((prev) => [result, ...prev]);

      if (result.trust_score < 40) {
        setPendingResult(result);
        setShowPauseModal(true);
      } else {
        setLatestResult(result);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardian handler
  const handleAlertGuardian = useCallback((result) => {
    const entry = {
      id: Date.now(),
      trust_score: result.trust_score || 15,
      risk_level: result.risk_level || 'HIGH_RISK',
      verdict: result.verdict_title || 'Emergency Threat Shared',
      contact: 'Mom / Guardian (+91 98765 43210)',
      time: new Date().toLocaleTimeString(),
    };
    setGuardianLogs((prev) => [entry, ...prev]);
    setGuardianToast(`Emergency report shared with ${entry.contact}. Confirmation received.`);
    setTimeout(() => setGuardianToast(null), 5000);
  }, []);

  // Run live demo (from Youth hero or sample pills)
  const runLiveDemo = useCallback(() => {
    setActiveTab('analyzer');
    setActiveFeature('scam');
    setSelectedEndpoint('/api/scam');
    handleAnalyze({ text: SAMPLE_SCAM, file: null, endpoint: '/api/scam' });
  }, [handleAnalyze]);

  const openSimulator = useCallback(() => {
    setActiveTab('simulator');
    setActiveFeature('simulator');
    setSelectedEndpoint(null);
  }, []);

  // Background style per age mode
  const bgClass =
    ageMode === 'child'
      ? 'bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100'
      : ageMode === 'elderly'
        ? 'bg-[#f8f9fa]'
        : 'bg-[#040a1a]';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      {/* Universal Navbar */}
      <Navbar
        ageMode={ageMode}
        setAgeMode={setAgeMode}
        userProfile={userProfile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        activeTab={activeTab}
        activeFeature={activeFeature}
        onSelectFeature={handleSelectFeature}
        guardianCount={guardianLogs.length}
        onScrollToGuardian={() => guardianRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-5">
        {ageMode === 'elderly' && (
          <ElderlyView onAlertGuardian={handleAlertGuardian} />
        )}

        {ageMode === 'child' && (
          <ChildView />
        )}

        {ageMode === 'young_adult' && (
          <CyberProView
            activeTab={activeTab}
            activeFeature={activeFeature}
            selectedEndpoint={selectedEndpoint}
            onClearSelectedEndpoint={() => setSelectedEndpoint(null)}
            loading={loading}
            latestResult={latestResult}
            scanHistory={scanHistory}
            guardianCount={guardianLogs.length}
            onAnalyze={handleAnalyze}
            onAlertGuardian={handleAlertGuardian}
            onRunDemo={runLiveDemo}
            onOpenSimulator={openSimulator}
          />
        )}

        {/* Guardian Activity Log (Visible across modes if alerts triggered) */}
        <div ref={guardianRef} className="mt-8 max-w-4xl mx-auto">
          <FamilyGuardianPanel
            logs={guardianLogs}
            toast={guardianToast}
            ageMode={ageMode}
          />
        </div>
      </main>

      {/* Age & Name Auto-Profiler Modal */}
      {showProfileModal && (
        <AgeProfileModal
          initialProfile={userProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Pause & Verify Modal */}
      {showPauseModal && pendingResult && (
        <PauseAndVerifyModal
          result={pendingResult}
          onDismiss={() => {
            setShowPauseModal(false);
            setLatestResult(pendingResult);
            setPendingResult(null);
          }}
          onAlertGuardian={handleAlertGuardian}
        />
      )}
    </div>
  );
}
