export const ENDPOINT_META = {
  '/api/scam': {
    label: 'Scam & UPI Phishing Guard',
    shortLabel: 'Scam / Phishing',
    description: 'ML classifier + UPI QR & URL phishing heuristics',
  },
  '/api/prompt-injection': {
    label: 'Prompt Injection Scanner',
    shortLabel: 'Prompt Injection',
    description: 'Adversarial instruction & hidden Unicode detector',
  },
  '/api/deepfake': {
    label: 'Deepfake Media Analyzer',
    shortLabel: 'Deepfake Check',
    description: 'OpenCV Laplacian & sensor noise artifact analysis',
  },
  '/api/authenticity': {
    label: 'EXIF & Origin Authenticity',
    shortLabel: 'EXIF Origin',
    description: 'Camera metadata & AI/editing software signature check',
  },
  '/api/identity': {
    label: 'Document Integrity & Hash',
    shortLabel: 'Doc Integrity',
    description: 'Magic-byte, PDF script & SHA-256 verification',
  },
};

const PROMPT_INJECTION_REGEX =
  /(ignore\s+(all\s+)?(previous|prior|above)\s+instructions|system\s+prompt|developer\s+mode|jailbreak|<\s*\/?\s*system\s*>|bypass\s+safety|[\u200B-\u200D\uFEFF])/i;

export function detectRoute({ text, file, overrideEndpoint }) {
  if (overrideEndpoint && ENDPOINT_META[overrideEndpoint]) {
    return {
      endpoint: overrideEndpoint,
      inputType: file ? (file.type || file.name) : 'text',
      ...ENDPOINT_META[overrideEndpoint],
    };
  }

  if (file) {
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();

    if (type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/.test(name)) {
      return {
        endpoint: '/api/deepfake',
        inputType: 'image',
        ...ENDPOINT_META['/api/deepfake'],
      };
    }
    if (type.startsWith('audio/') || /\.(wav|mp3|ogg|m4a|webm)$/.test(name)) {
      return {
        endpoint: '/api/deepfake',
        inputType: 'audio',
        ...ENDPOINT_META['/api/deepfake'],
      };
    }
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return {
        endpoint: '/api/identity',
        inputType: 'pdf',
        ...ENDPOINT_META['/api/identity'],
      };
    }
    return {
      endpoint: '/api/prompt-injection',
      inputType: 'text_file',
      ...ENDPOINT_META['/api/prompt-injection'],
    };
  }

  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  if (PROMPT_INJECTION_REGEX.test(trimmed)) {
    return {
      endpoint: '/api/prompt-injection',
      inputType: 'text',
      ...ENDPOINT_META['/api/prompt-injection'],
    };
  }

  if (trimmed.toLowerCase().startsWith('upi://')) {
    return {
      endpoint: '/api/scam',
      inputType: 'upi_qr',
      ...ENDPOINT_META['/api/scam'],
    };
  }

  return {
    endpoint: '/api/scam',
    inputType: /https?:\/\//i.test(trimmed) ? 'url' : 'text',
    ...ENDPOINT_META['/api/scam'],
  };
}
