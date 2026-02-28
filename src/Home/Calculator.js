import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calculator = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [ngnEquivalent, setNGNEquivalent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${apiUrl}/api/services`)
      .then(r => setServices(r.data))
      .catch(() => {});
  }, [apiUrl]);

  const currentService = services.find(s => s.name === selectedService);
  const isWebsite = selectedService === 'Website Recharge';

  const reset = () => { setNGNEquivalent(null); setError(''); };

  const handleCalculate = () => {
    setError('');
    if (!selectedService) return setError('Please select a service.');
    if (!selectedAmount || isNaN(selectedAmount)) return setError('Please enter a valid amount.');
    if (!currentService) return setError('Service not found.');
    if (isWebsite && selectedAmount < 5) return setError('Minimum for Website Recharge is $5.');

    const rate = currentService.exchangeRates?.[selectedCurrency];
    if (!rate) return setError('Exchange rate not available for this currency.');

    let result;
    if (isWebsite) {
      const m = { 5: 1, 10: 2, 20: 3, 30: 4, 50: 5 };
      result = rate * (m[Number(selectedAmount)] || 1);
    } else {
      result = Number(selectedAmount) * rate;
    }

    if (!isNaN(result)) setNGNEquivalent(parseFloat(result.toFixed(2)));
    else setError('Invalid calculation.');
  };

  return (
    <section id="calculator" style={s.section}>
      <div style={s.inner}>
        <div style={s.header}>
          <span style={s.tag}>Rate Calculator</span>
          <h2 style={s.heading}>See your Naira equivalent<br />before you trade</h2>
          <p style={s.lead}>Select a service, enter your amount, and get an instant NGN estimate.</p>
        </div>

        <div style={s.card}>
          {error && <div style={s.errorBox}>{error}</div>}

          {/* Service */}
          <div style={s.field}>
            <label style={s.label}>Service</label>
            <select value={selectedService} onChange={e => { setSelectedService(e.target.value); reset(); }} style={s.select}>
              <option value="">Select a service…</option>
              {services.map(sv => <option key={sv._id} value={sv.name}>{sv.name}</option>)}
            </select>
          </div>

          {/* Live rates preview */}
          {currentService && (
            <div style={s.ratesRow}>
              {['usd','eur','gbp'].map(c => (
                <div key={c} style={s.rateChip}>
                  <span style={s.rateLabel}>{c.toUpperCase()}</span>
                  <span style={s.rateVal}>₦{(currentService.exchangeRates?.[c] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Currency */}
          {selectedService && (
            <div style={s.field}>
              <label style={s.label}>Currency</label>
              <div style={s.currencyGroup}>
                {['usd','eur','gbp'].map(c => (
                  <button key={c} style={{ ...s.currBtn, ...(selectedCurrency === c ? s.currActive : {}) }}
                    onClick={() => { setSelectedCurrency(c); reset(); }}>
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          {selectedService && (
            <div style={s.field}>
              <label style={s.label}>Amount</label>
              {isWebsite
                ? <select value={selectedAmount} onChange={e => { setSelectedAmount(e.target.value); reset(); }} style={s.select}>
                    <option value="">Select amount…</option>
                    {[5,10,20,30,50].map(v => <option key={v} value={v}>${v} USD</option>)}
                  </select>
                : <div style={s.amountWrap}>
                    <span style={s.currSymbol}>{selectedCurrency === 'eur' ? '€' : selectedCurrency === 'gbp' ? '£' : '$'}</span>
                    <input type="number" value={selectedAmount} onChange={e => { setSelectedAmount(e.target.value); reset(); }}
                      placeholder="0.00" style={s.input} min="0" />
                  </div>
              }
            </div>
          )}

          <button style={s.btn} onClick={handleCalculate}
            onMouseEnter={e => e.target.style.background = 'var(--gold-light)'}
            onMouseLeave={e => e.target.style.background = 'var(--gold)'}
          >
            Calculate →
          </button>

          {ngnEquivalent !== null && (
            <div style={s.result}>
              <span style={s.resultLabel}>You get approximately</span>
              <span style={s.resultVal}>₦{ngnEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span style={s.resultNote}>Final rate confirmed at time of transaction</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const s = {
  section: { padding: '88px 5%', background: 'var(--navy)' },
  inner:  { maxWidth: 700, margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: 36 },
  tag: {
    display: 'inline-block',
    background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
    color: 'var(--gold)', fontSize: 11, fontWeight: 700, letterSpacing: '2px',
    textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 16,
  },
  heading: {
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: -0.8,
    lineHeight: 1.15, color: '#fff', marginBottom: 10,
  },
  lead: { fontSize: '1rem', color: '#94A3B8', lineHeight: 1.7 },
  card: {
    background: 'var(--navy-card)', border: '1px solid var(--navy-border)',
    borderRadius: 20, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 22,
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#FCA5A5', borderRadius: 10, padding: '12px 16px', fontSize: '0.875rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-light)', letterSpacing: '0.5px', textTransform: 'uppercase' },
  select: {
    background: 'var(--navy-2)', border: '1px solid var(--navy-border)', borderRadius: 10,
    color: 'var(--text)', padding: '12px 14px', fontSize: '0.95rem', width: '100%', outline: 'none',
  },
  ratesRow: { display: 'flex', gap: 10 },
  rateChip: {
    flex: 1, background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)',
    borderRadius: 10, padding: '10px 12px', textAlign: 'center',
  },
  rateLabel: { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '1px' },
  rateVal:   { display: 'block', fontSize: '0.95rem', fontWeight: 800, color: 'var(--gold)', marginTop: 2 },
  currencyGroup: { display: 'flex', gap: 10 },
  currBtn: {
    flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--navy-border)',
    background: 'var(--navy-2)', color: 'var(--muted-light)', fontWeight: 700, fontSize: '0.875rem',
    cursor: 'pointer', transition: 'all 180ms',
  },
  currActive: { background: 'rgba(245,166,35,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)' },
  amountWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  currSymbol: { position: 'absolute', left: 14, color: 'var(--muted)', fontWeight: 700 },
  input: {
    width: '100%', background: 'var(--navy-2)', border: '1px solid var(--navy-border)',
    borderRadius: 10, color: 'var(--text)', padding: '12px 14px 12px 32px',
    fontSize: '0.95rem', outline: 'none',
  },
  btn: {
    width: '100%', background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: '1rem',
    padding: '14px', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'background 180ms',
  },
  result: {
    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 14, padding: '20px 18px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4,
  },
  resultLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#4ADE80', letterSpacing: '1px', textTransform: 'uppercase' },
  resultVal:   { fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: -1 },
  resultNote:  { fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 },
};

export default Calculator;
