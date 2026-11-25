async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function downloadTrustPassport(result) {
  const passportBody = {
    issuer: 'TrustLens AI Verification Engine',
    schema_version: '1.0',
    trust_score: result.trust_score,
    risk_level: result.risk_level,
    verdict: result.verdict_title,
    summary: result.summary,
    endpoint_used: result.endpoint_used,
    input_type: result.input_type,
    payload_sha256: result.sha256_hash,
    confidence: result.confidence,
    forensic_details: result.forensic_details,
    analyzed_at: result.analyzed_at,
  };

  const passportSha256 = await sha256Hex(JSON.stringify(passportBody));
  const signedPassport = {
    ...passportBody,
    passport_sha256: passportSha256,
  };

  const blob = new Blob([JSON.stringify(signedPassport, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trustlens-passport-${result.sha256_hash.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return passportSha256;
}

export function printTrustPassport(result) {
  const win = window.open('', '_blank', 'width=760,height=840');
  if (!win) return;

  const rows = (result.forensic_details || [])
    .map(
      (d) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">${d.label}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${d.value}</td></tr>`
    )
    .join('');

  win.document.write(`
    <!doctype html>
    <html>
      <head><title>TrustLens AI — Trust Passport</title></head>
      <body style="font-family:system-ui,sans-serif;padding:32px;color:#0f172a;max-width:700px;margin:auto">
        <h1 style="margin:0 0 4px">TrustLens AI — Digital Trust Passport</h1>
        <p style="color:#475569;margin:0 0 24px">In-memory cryptographic verification summary</p>
        <div style="padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #cbd5e1;margin-bottom:20px">
          <div><strong>Verdict:</strong> ${result.verdict_title}</div>
          <div><strong>Trust Score:</strong> ${result.trust_score} / 100 (${result.risk_level})</div>
          <div><strong>Endpoint:</strong> ${result.endpoint_used}</div>
          <div><strong>Payload SHA-256:</strong> <code style="word-break:break-all">${result.sha256_hash}</code></div>
          <div><strong>Timestamp:</strong> ${result.analyzed_at}</div>
        </div>
        <p>${result.summary}</p>
        <h3>Forensic Breakdown</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  win.document.close();
}
