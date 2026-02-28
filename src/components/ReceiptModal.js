import React, { useState } from 'react';
import { FaRegCopy, FaCheckCircle, FaDownload, FaTimes, FaPaperclip } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Alert from './Alert';
import ResponsiveLogo from './ResponsiveLogo';

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399',
};

const ReceiptModal = ({ receiptData, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleShareAsImage = async () => {
    const receiptElement = document.getElementById('receipt-modal-content');
    const buttonsToHide = document.querySelectorAll('.hide-on-share');
    if (!receiptElement) return;
    buttonsToHide.forEach(b => (b.style.display = 'none'));
    try {
      receiptElement.style.maxHeight = 'none';
      receiptElement.style.overflow = 'visible';
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(receiptElement, {
        scale: 2, useCORS: true, windowHeight: receiptElement.scrollHeight,
        backgroundColor: '#0F172A',
      });
      buttonsToHide.forEach(b => (b.style.display = ''));
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image; link.download = 'receipt.png';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setAlertMessage('Receipt downloaded successfully.');
      if (navigator.canShare) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], 'receipt.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Transaction Receipt' });
        setAlertMessage('Receipt shared successfully.');
      }
    } catch (err) {
      console.error(err);
      setAlertMessage('Error processing receipt.');
    }
  };

  const resolveUrl = (p) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    const base = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
    return p.startsWith('/') ? `${base}${p}` : `${base}/${p}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.78)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage('')} />}

      <div
        id="receipt-modal-content"
        style={{
          background: G.navy2,
          border: `1px solid ${G.goldBorder}`,
          borderRadius: 20,
          width: '100%', maxWidth: 460,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${G.navy4}, ${G.navy3})`,
          borderBottom: `1px solid ${G.goldBorder}`,
          padding: '22px 28px', textAlign: 'center',
          borderRadius: '20px 20px 0 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <ResponsiveLogo alt="Exdollarium" style={{ height: 38, objectFit: 'contain' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: G.white }}>Exdollarium</h2>
          <p style={{ margin: '4px 0 0', color: G.slate, fontSize: '0.8rem' }}>Official Transaction Receipt</p>
        </div>

        {/* Fields */}
        <div style={{ padding: '8px 28px 0' }}>
          {receiptData.fields.map(({ label, value, copyable }, index) => {
            const isFileField = (label || '').toString().toLowerCase().includes('file');
            const isReactNode = value !== null && typeof value === 'object' && !Array.isArray(value);

            return (
              <div key={index} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0',
                borderBottom: `1px solid rgba(245,166,35,0.07)`,
                gap: 12,
              }}>
                <span style={{ color: G.slateD, fontSize: '0.8rem', fontWeight: 500, flexShrink: 0, minWidth: 100 }}>
                  {label}
                </span>
                <span style={{ color: G.white, fontSize: '0.84rem', textAlign: 'right', maxWidth: '58%', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {isFileField && (Array.isArray(value) || typeof value === 'string') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      {Array.isArray(value) ? value.map((v, i) => (
                        <a key={i} href={resolveUrl(v)} target="_blank" rel="noopener noreferrer" download
                          style={{ color: G.gold, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FaPaperclip size={11} /> View File {i + 1}
                        </a>
                      )) : (
                        <a href={resolveUrl(value)} target="_blank" rel="noopener noreferrer" download
                          style={{ color: G.gold, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FaPaperclip size={11} /> View File
                        </a>
                      )}
                    </div>
                  ) : isReactNode ? (
                    value
                  ) : (
                    <>
                      <span style={{ wordBreak: 'break-all' }}>{value}</span>
                      {copyable && (
                        <button
                          onClick={() => handleCopyText(value, index)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.gold, padding: 0, flexShrink: 0 }}
                        >
                          {copiedIndex === index
                            ? <FaCheckCircle size={13} style={{ color: G.green }} />
                            : <FaRegCopy size={13} />}
                        </button>
                      )}
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${G.goldBorder}`,
          padding: '16px 28px 22px',
          textAlign: 'center',
          marginTop: 8,
        }}>
          <p style={{ color: G.slateD, fontSize: '0.76rem', margin: '0 0 16px' }}>
            Thank you for choosing <span style={{ color: G.gold }}>Exdollarium</span>. We appreciate your trust.
          </p>
          <div className="hide-on-share" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={handleShareAsImage}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
                color: G.navy, border: 'none', borderRadius: 10,
                padding: '10px 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <FaDownload size={13} /> Download
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: 'transparent', border: `1px solid ${G.goldBorder}`,
                color: G.slate, borderRadius: 10,
                padding: '10px 0', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <FaTimes size={13} /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
