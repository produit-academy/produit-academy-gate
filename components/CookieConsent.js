import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('produit_gate_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleConsent = (choice) => {
    try {
      localStorage.setItem('produit_gate_cookie_consent', choice);
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      role="region"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '540px',
        margin: '0 auto',
        zIndex: 9999,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderRadius: '12px',
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        fontFamily: 'inherit',
      }}
    >
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
          Cookie & Assessment Privacy
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
          We use essential cookies to maintain exam session timers and track test results. Read our{' '}
          <Link href="/privacy-policy" style={{ color: '#0070f3', textDecoration: 'underline', fontWeight: 500 }}>
            GATE Privacy Policy
          </Link>.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleConsent('essential')}
          style={{
            padding: '7px 14px',
            fontSize: '0.82rem',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => handleConsent('all')}
          style={{
            padding: '7px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#0070f3',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Accept All
        </button>
      </div>
    </aside>
  );
}
