// Speech Synthesis (Text-to-Speech) & Speech Recognition (Voice-to-Text)

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function speakMessage(text, lang = 'en-IN', onEnd) {
  if (!isSpeechSupported() || !text) {
    if (onEnd) onEnd();
    return { ok: false, reason: 'Speech synthesis not supported.' };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang.startsWith('ml') ? 0.90 : 0.95;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const exactVoice = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  const prefixVoice = voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (exactVoice || prefixVoice) {
    utterance.voice = exactVoice || prefixVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return { ok: true };
}

// Speech Recognition for Voice Assistant / Voice Chat
let activeRecognition = null;

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export function startListening({ lang = 'ml-IN', onResult, onError, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech recognition not supported on this browser. Try Chrome or Edge.');
    return null;
  }

  stopListening();

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) {
      const isFinal = event.results[event.results.length - 1].isFinal;
      onResult(transcript, isFinal);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    activeRecognition = null;
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    activeRecognition = recognition;
    return recognition;
  } catch (err) {
    console.error('Failed to start recognition:', err);
    if (onError) onError(err.message);
    return null;
  }
}

export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}
