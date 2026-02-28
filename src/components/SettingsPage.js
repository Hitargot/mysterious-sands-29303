import React, { useState, useEffect } from 'react';
import {
  FaSun, FaMoon, FaBell, FaLock, FaUser, FaShieldAlt,
  FaMobileAlt, FaEnvelope, FaChevronRight, FaSave, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import Alert from './Alert';

// ─── design tokens ────────────────────────────────────────────────────────────
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)',
  navy: '#0A0F1E', navy2: '#0F172A', navy3: '#111827', navy4: '#1E293B',
  slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', greenFaint: 'rgba(52,211,153,0.10)',
  red: '#F87171', redFaint: 'rgba(248,113,113,0.10)',
};

const LIGHT = {
  page: '#F1F5F9', card: '#FFFFFF', border: 'rgba(0,0,0,0.08)',
  text: '#0F172A', sub: '#64748B', input: '#F8FAFC', inputBorder: 'rgba(0,0,0,0.12)',
};

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange, color = G.gold }) => (
  <button
    onClick={() => onChange(!on)}
    style={{
      position: 'relative', width: 44, height: 24, borderRadius: 12,
      background: on ? color : 'rgba(255,255,255,0.1)',
      border: `1px solid ${on ? color : 'rgba(255,255,255,0.12)'}`,
      cursor: 'pointer', transition: 'background 200ms, border-color 200ms',
      padding: 0, flexShrink: 0,
    }}
    aria-checked={on}
    role="switch"
  >
    <span style={{
      position: 'absolute', top: 2,
      left: on ? 22 : 2,
      width: 18, height: 18, borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      transition: 'left 200ms',
    }} />
  </button>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ icon, title, children, isDark }) => {
  const bg     = isDark ? G.navy2 : LIGHT.card;
  const border = isDark ? G.goldBorder : LIGHT.border;
  const text   = isDark ? G.white    : LIGHT.text;

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <span style={{ color: G.gold, fontSize: 15 }}>{icon}</span>
        <span style={{ color: text, fontWeight: 700, fontSize: '0.9rem' }}>{title}</span>
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  );
};

// ─── Setting row ──────────────────────────────────────────────────────────────
const Row = ({ label, sub, right, isDark, danger = false }) => {
  const text = isDark ? G.white    : LIGHT.text;
  const subC = isDark ? G.slateD   : LIGHT.sub;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 20px', gap: 12,
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: danger ? G.red : text, fontSize: '0.875rem', fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ color: subC, fontSize: '0.76rem', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const PREFS_KEY  = 'exdo_settings';
const loadPrefs  = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; } };
const savePrefs  = (p) => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {} };

const SettingsPage = () => {
  const { setTheme, isDark } = useTheme();

  const [prefs, setPrefs] = useState(() => ({
    notifPush:      true,
    notifEmail:     true,
    notifSms:       false,
    notifTrade:     true,
    notifWithdraw:  true,
    notifMarketing: false,
    twoFactor:      false,
    loginAlerts:    true,
    sessionTimeout: '30',
    ...loadPrefs(),
  }));

  const [pinState, setPinState] = useState({ current: '', newPin: '', confirm: '', show: false });
  const [alert, setAlert]       = useState(null);

  useEffect(() => { savePrefs(prefs); }, [prefs]);

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const showAlert = (message, type = 'success') => setAlert({ message, type });

  const handleSavePin = () => {
    if (!pinState.current) return showAlert('Enter your current PIN', 'error');
    if (pinState.newPin.length !== 4) return showAlert('New PIN must be 4 digits', 'error');
    if (pinState.newPin !== pinState.confirm) return showAlert('PINs do not match', 'error');
    // POST to backend would go here
    showAlert('PIN updated successfully!');
    setPinState({ current: '', newPin: '', confirm: '', show: false });
  };

  // ── colours that depend on theme ─────────────────────────────────────────
  const pageBg    = isDark ? 'transparent' : LIGHT.page;
  const headText  = isDark ? G.white       : LIGHT.text;
  const subText   = isDark ? G.slateD      : LIGHT.sub;
  const inputBg   = isDark ? 'rgba(255,255,255,0.04)' : LIGHT.input;
  const inputBdr  = isDark ? 'rgba(255,255,255,0.08)' : LIGHT.inputBorder;

  const inputStyle = (focused) => ({
    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
    background: inputBg,
    border: `1px solid ${focused ? 'rgba(245,166,35,0.5)' : inputBdr}`,
    borderRadius: 9, color: isDark ? G.white : LIGHT.text,
    fontSize: '0.88rem', outline: 'none',
    transition: 'border-color 180ms',
  });

  const [focusedInput, setFocusedInput] = useState('');

  return (
    <div style={{ padding: '0 4px', background: pageBg, minHeight: '100%' }}>
      {alert && (
        <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}

      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', color: headText, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
          Settings
        </h1>
        <p style={{ margin: 0, color: subText, fontSize: '0.85rem' }}>
          Manage your account preferences and security.
        </p>
      </div>

      {/* ── 1. APPEARANCE ───────────────────────────────────────────────── */}
      <Section icon={<FaSun />} title="Appearance" isDark={isDark}>
        <Row isDark={isDark}
          label="Theme"
          sub={isDark ? 'Currently using Dark mode' : 'Currently using Light mode'}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FaMoon style={{ color: isDark ? G.goldLight : G.slateD, fontSize: 14 }} />
              <Toggle on={isDark} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
              <FaSun  style={{ color: !isDark ? G.goldLight : G.slateD, fontSize: 14 }} />
            </div>
          }
        />
        <Row isDark={isDark}
          label="Compact Sidebar"
          sub="Collapse sidebar labels on desktop"
          right={<Toggle on={prefs.compactSidebar || false} onChange={v => set('compactSidebar', v)} />}
        />
        <Row isDark={isDark} label="Language" sub="Interface language"
          right={
            <select
              value={prefs.language || 'en'}
              onChange={e => set('language', e.target.value)}
              style={{ ...inputStyle(false), width: 'auto', padding: '6px 10px' }}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="yo">Yoruba</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
            </select>
          }
        />
        <Row isDark={isDark} label="Currency Display" sub="Default currency shown in wallet"
          right={
            <select
              value={prefs.displayCurrency || 'NGN'}
              onChange={e => set('displayCurrency', e.target.value)}
              style={{ ...inputStyle(false), width: 'auto', padding: '6px 10px' }}
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          }
        />
      </Section>

      {/* ── 2. NOTIFICATIONS ─────────────────────────────────────────────── */}
      <Section icon={<FaBell />} title="Notifications" isDark={isDark}>
        <Row isDark={isDark} label="Push Notifications" sub="In-app alerts for activity"
          right={<Toggle on={prefs.notifPush} onChange={v => set('notifPush', v)} />}
        />
        <Row isDark={isDark} label="Email Notifications" sub="Receive updates by email"
          right={<Toggle on={prefs.notifEmail} onChange={v => set('notifEmail', v)} />}
        />
        <Row isDark={isDark} label="SMS Alerts" sub="Text messages for critical events"
          right={<Toggle on={prefs.notifSms} onChange={v => set('notifSms', v)} />}
        />
        <Row isDark={isDark} label="Trade Updates" sub="Alerts when a trade changes status"
          right={<Toggle on={prefs.notifTrade} onChange={v => set('notifTrade', v)} />}
        />
        <Row isDark={isDark} label="Withdrawal Alerts" sub="Notify when withdrawal is processed"
          right={<Toggle on={prefs.notifWithdraw} onChange={v => set('notifWithdraw', v)} />}
        />
        <Row isDark={isDark} label="Marketing & Promotions" sub="Offers and platform news"
          right={<Toggle on={prefs.notifMarketing} onChange={v => set('notifMarketing', v)} color={G.slateD} />}
        />
      </Section>

      {/* ── 3. SECURITY ──────────────────────────────────────────────────── */}
      <Section icon={<FaShieldAlt />} title="Security" isDark={isDark}>
        <Row isDark={isDark} label="Two-Factor Authentication" sub="Secure your account with 2FA (OTP via email)"
          right={<Toggle on={prefs.twoFactor} onChange={v => set('twoFactor', v)} color={G.green} />}
        />
        <Row isDark={isDark} label="Login Alerts" sub="Get notified of new logins"
          right={<Toggle on={prefs.loginAlerts} onChange={v => set('loginAlerts', v)} />}
        />
        <Row isDark={isDark} label="Session Timeout" sub="Auto logout after inactivity"
          right={
            <select
              value={prefs.sessionTimeout}
              onChange={e => set('sessionTimeout', e.target.value)}
              style={{ ...inputStyle(false), width: 'auto', padding: '6px 10px' }}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          }
        />

        {/* Change PIN subsection */}
        <div style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pinState.show ? 16 : 0 }}>
            <div>
              <div style={{ color: isDark ? G.white : LIGHT.text, fontSize: '0.875rem', fontWeight: 600 }}>
                Change Withdrawal PIN
              </div>
              <div style={{ color: subText, fontSize: '0.76rem', marginTop: 2 }}>Update your 4-digit withdrawal PIN</div>
            </div>
            <button
              onClick={() => setPinState(s => ({ ...s, show: !s.show }))}
              style={{
                background: G.goldFaint, color: G.goldLight,
                border: `1px solid ${G.goldBorder}`, borderRadius: 8,
                padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {pinState.show ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
              {pinState.show ? 'Cancel' : 'Change PIN'}
            </button>
          </div>

          {pinState.show && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'current', label: 'Current PIN' },
                { key: 'newPin',  label: 'New PIN' },
                { key: 'confirm', label: 'Confirm New PIN' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', color: subText, fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    {label}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="••••"
                    value={pinState[key]}
                    onChange={e => setPinState(s => ({ ...s, [key]: e.target.value.replace(/\D/g, '') }))}
                    onFocus={() => setFocusedInput(key)}
                    onBlur={() => setFocusedInput('')}
                    style={{ ...inputStyle(focusedInput === key), letterSpacing: '0.3em' }}
                  />
                </div>
              ))}
              <button
                onClick={handleSavePin}
                style={{
                  marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  background: G.gold, color: '#000',
                  border: 'none', borderRadius: 100, padding: '10px 24px',
                  fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                <FaSave size={13} /> Save PIN
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* ── 4. ACCOUNT ───────────────────────────────────────────────────── */}
      <Section icon={<FaUser />} title="Account" isDark={isDark}>
        <Row isDark={isDark} label="Email Verified" sub="Your email address is verified"
          right={
            <span style={{ background: G.greenFaint, color: G.green, border: `1px solid ${G.green}33`, borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
              Verified
            </span>
          }
        />
        <Row isDark={isDark} label="KYC Status" sub="Identity verification for higher limits"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: G.slateD, fontSize: '0.82rem', fontWeight: 600 }}>
              View <FaChevronRight size={10} />
            </div>
          }
        />
        <Row isDark={isDark} label="Linked Devices" sub="Manage where you're signed in"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: G.slateD, fontSize: '0.82rem', fontWeight: 600 }}>
              <FaMobileAlt size={13} /> 1 device
            </div>
          }
        />
        <Row isDark={isDark} label="Connected Email" sub="Email used for account alerts"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: G.slateD, fontSize: '0.82rem' }}>
              <FaEnvelope size={12} /> On file
            </div>
          }
        />
        <Row isDark={isDark} label="Data & Privacy" sub="Download or delete your account data"
          right={<FaChevronRight size={12} style={{ color: G.slateD }} />}
        />
        <Row isDark={isDark} label="Delete Account" sub="Permanently remove your account"
          danger
          right={
            <button
              onClick={() => showAlert('Contact support to delete your account.', 'warning')}
              style={{
                background: G.redFaint, color: G.red,
                border: `1px solid rgba(248,113,113,0.25)`, borderRadius: 8,
                padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Delete
            </button>
          }
        />
      </Section>

      {/* ── 5. TRADING PREFERENCES ───────────────────────────────────────── */}
      <Section icon={<FaLock />} title="Trading Preferences" isDark={isDark}>
        <Row isDark={isDark} label="Confirm Before Trade" sub="Show a confirmation step before submitting trades"
          right={<Toggle on={prefs.confirmTrade !== false} onChange={v => set('confirmTrade', v)} />}
        />
        <Row isDark={isDark} label="Auto-fill Bank Details" sub="Pre-fill your last-used bank details"
          right={<Toggle on={prefs.autofillBank || false} onChange={v => set('autofillBank', v)} />}
        />
        <Row isDark={isDark} label="Show Trade Estimates" sub="Display estimated NGN value before confirming"
          right={<Toggle on={prefs.showEstimates !== false} onChange={v => set('showEstimates', v)} />}
        />
      </Section>

      <div style={{ height: 24 }} />
    </div>
  );
};

export default SettingsPage;
