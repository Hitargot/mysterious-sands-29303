import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Alert from "../components/Alert";
import ResponsiveLogo from './ResponsiveLogo';
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Import styles

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referral = params.get("referralCode");

    if (referral) {
      setFormData((prev) => ({
        ...prev,
        referralCode: referral,
      }));
    }
  }, [location.search]);

  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("signupForm");
    const saved = savedFormData ? JSON.parse(savedFormData) : {};
    return {
      firstName: saved.firstName || "",
      lastName: saved.lastName || "",
      username: saved.username || "",
      email: saved.email || "",
      phone: saved.phone || "",
      password: "",           // never restored from localStorage
      confirmPassword: "",    // never restored from localStorage
      referralCode: saved.referralCode || "",
    };
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState("ng"); // Default to Nigeria
  const [termsAccepted, setTermsAccepted] = useState(
    localStorage.getItem("termsAccepted") === "true"
  );
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsLoading, setTermsLoading] = useState(false);

  // Responsive helper to adjust spacing on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Never persist passwords to localStorage
    const { password, confirmPassword, ...safeForm } = formData;
    localStorage.setItem("signupForm", JSON.stringify(safeForm));
  }, [formData]);

  useEffect(() => {
    const accepted = localStorage.getItem("termsAccepted") === "true";
    setTermsAccepted(accepted);
  }, []);

  useEffect(() => {
    // Try to detect user's country
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setUserCountry(data.country_code.toLowerCase()))
      .catch(() => setUserCountry("ng")); // Fallback to Nigeria if detection fails
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Ensure +234 is always the prefix
      if (!value.startsWith("+234")) {
        setFormData({ ...formData, phone: "+234" });
      } else {
        // Allow only numbers after +234
        const phoneNumber = value.replace(/\D/g, ""); // Remove non-numeric characters
        if (phoneNumber.startsWith("234")) {
          setFormData({ ...formData, phone: "+" + phoneNumber });
        }
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };



  const handleCheckboxChange = () => {
    setTermsAccepted((prev) => {
      const newValue = !prev;
      localStorage.setItem("termsAccepted", newValue);
      return newValue;
    });
  };

  const openTermsModal = async () => {
    setShowTermsModal(true);
    document.body.style.overflow = 'hidden';
    if (!termsContent) {
      setTermsLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/terms`);
        // Extract just the <main>...</main> block from the full HTML response
        const match = res.data.match(/<main[\s\S]*?<\/main>/i);
        setTermsContent(match ? match[0] : res.data);
      } catch {
        setTermsContent('<main><p>Could not load Terms. Please try again later.</p></main>');
      }
      setTermsLoading(false);
    }
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
    document.body.style.overflow = '';
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(""), alertDuration);
  };

  const apiUrl = process.env.REACT_APP_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // ✅ 1. Check empty fields
    if (!formData.firstName || !formData.lastName) {
      showAlert("Please enter your first name and last name.");
      return;
    }
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      showAlert("All fields are required.");
      return;
    }

    // ✅ 2. Validate username (starts with a capital letter, at least 4 chars)
    const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{3,}$/;
    if (!usernameRegex.test(formData.username)) {
      showAlert("Username must start with a letter and be at least 4 characters long.");
      return;
    }


    // ✅ 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert("Enter a valid email address.");
      return;
    }

    // ✅ 4. Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      showAlert("Enter a valid phone number (10-15 digits).");
      return;
    }

    // ✅ 5. Strong password checks with specific messages
    const password = formData.password;
    if (password.length < 8) {
      showAlert("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Za-z]/.test(password)) {
      showAlert("Password must contain at least one letter.");
      return;
    }
    if (!/\d/.test(password)) {
      showAlert("Password must contain at least one number.");
      return;
    }
    if (!/[@$!%*?&]/.test(password)) {
      showAlert("Password must include at least one special character (@$!%*?&).");
      return;
    }

    // ✅ 6. Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    // ✅ 7. Check Terms & Conditions agreement
    if (!termsAccepted) {
      showAlert("You must accept the Terms & Conditions before signing up.");
      return;
    }

    // ✅ 8. Submit data
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/signup`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode,
        agreedToTerms: true,
      });

      if (response.status !== 201) {
        showAlert(response.data.message || "Signup failed");
        return;
      }

      showAlert("Sign up successful! Check your email or spam folder to verify your account.");

      // ✅ Reset form
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
      });

      localStorage.removeItem("signupForm");

      // ✅ Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      showAlert(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };





  // Focused field for input highlight
  const [focusedField, setFocusedField] = useState('');
  const [btnHovered, setBtnHovered] = useState(false);

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #060c1a 0%, #0a0f1e 55%, #0d1526 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    },
    glow1: {
      position: 'absolute', top: '-10%', left: '-5%',
      width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600,
      background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    glow2: {
      position: 'absolute', bottom: '-5%', right: '-5%',
      width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400,
      background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    card: {
      width: '100%',
      maxWidth: 480,
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '40px 36px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },
    logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
    logoText: {
      color: '#fff', fontWeight: 900,
      fontSize: '1.1rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    },
    navLinks: { display: 'flex', gap: 16 },
    navLink: {
      color: 'rgba(148,163,184,0.8)', textDecoration: 'none',
      fontSize: '0.82rem', fontWeight: 600,
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(245,166,35,0.10)',
      border: '1px solid rgba(245,166,35,0.3)',
      color: '#F5A623',
      fontSize: 10, fontWeight: 700, letterSpacing: '2px',
      textTransform: 'uppercase',
      padding: '4px 12px', borderRadius: 100,
      marginBottom: 12,
    },
    heading: {
      color: '#fff', fontWeight: 900,
      fontSize: '1.75rem', letterSpacing: '-0.5px',
      margin: '0 0 6px',
    },
    subtext: {
      color: '#64748B', fontSize: '0.85rem',
      margin: '0 0 24px',
    },
    row: { display: 'flex', gap: 12, marginBottom: 16 },
    formGroup: { marginBottom: 16 },
    label: {
      display: 'block',
      color: '#94A3B8', fontSize: '0.75rem',
      fontWeight: 700, letterSpacing: '0.8px',
      textTransform: 'uppercase', marginBottom: 6,
    },
    input: (focused) => ({
      width: '100%',
      padding: '11px 14px',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${focused ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 10,
      color: '#E2E8F0',
      fontSize: '0.92rem',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 180ms',
    }),
    phoneWrap: {
      display: 'flex', alignItems: 'center',
      gap: 8, position: 'relative',
    },
    tooltipIcon: {
      cursor: 'pointer', fontSize: 16,
      color: '#64748B', flexShrink: 0,
    },
    tooltip: {
      position: 'absolute', top: '115%', left: '50%',
      transform: 'translateX(-50%)',
      background: '#1E293B', color: '#E2E8F0',
      padding: '6px 12px', borderRadius: 8,
      fontSize: '0.75rem', whiteSpace: 'nowrap',
      border: '1px solid rgba(255,255,255,0.08)',
      zIndex: 1000,
    },
    checkRow: {
      display: 'flex', alignItems: 'flex-start',
      gap: 10, marginBottom: 18,
    },
    checkLabel: {
      color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.5,
    },
    termsLink: {
      color: '#F5A623',
      textDecoration: 'underline',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      display: 'inline',
    },
    btn: {
      width: '100%',
      padding: '13px',
      background: loading || !termsAccepted ? 'rgba(245,166,35,0.35)' : btnHovered ? '#FBBF24' : '#F5A623',
      color: loading || !termsAccepted ? 'rgba(0,0,0,0.5)' : '#000',
      fontWeight: 800,
      fontSize: '0.95rem',
      border: 'none',
      borderRadius: 100,
      cursor: loading || !termsAccepted ? 'not-allowed' : 'pointer',
      transition: 'background 180ms, transform 150ms',
      transform: btnHovered && !loading && termsAccepted ? 'translateY(-1px)' : 'none',
    },
    divider: {
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '20px 0',
    },
    dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' },
    dividerText: { color: '#475569', fontSize: '0.75rem', fontWeight: 600 },
    footer: {
      marginTop: 18, textAlign: 'center',
    },
    footerText: { color: '#64748B', fontSize: '0.82rem' },
    footerLink: { color: '#F5A623', textDecoration: 'none', fontWeight: 700 },
  };

  const phoneInputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focusedField === 'phone' ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    color: '#E2E8F0',
    fontSize: '0.92rem',
    height: 44,
  };

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoWrap}>
            <ResponsiveLogo alt="Exdollarium" style={{ height: 34, width: 34, filter: 'brightness(0) invert(1)' }} />
            <span style={s.logoText}>Exdollarium</span>
          </div>
          <div style={s.navLinks}>
            <Link to="/" style={s.navLink}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
            >Home</Link>
            <Link to="/login" style={s.navLink}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
            >Login</Link>
          </div>
        </div>

        {alertMessage && (
          <Alert message={alertMessage} duration={alertDuration} onClose={() => setAlertMessage('')} />
        )}

        {/* Title */}
        <div style={s.badge}>&#9889; Join for free</div>
        <h2 style={s.heading}>Create account</h2>
        <p style={s.subtext}>Start exchanging in under 2 minutes</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName}
                onChange={handleChange} required disabled={loading}
                style={s.input(focusedField === 'firstName')}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField('')}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName}
                onChange={handleChange} required disabled={loading}
                style={s.input(focusedField === 'lastName')}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Username</label>
            <input type="text" name="username" value={formData.username}
              onChange={handleChange} required disabled={loading}
              style={s.input(focusedField === 'username')}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Email</label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} required disabled={loading}
              style={s.input(focusedField === 'email')}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Phone</label>
            <div style={s.phoneWrap}>
              <PhoneInput
                country={userCountry}
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                inputStyle={phoneInputStyle}
                buttonStyle={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${focusedField === 'phone' ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('')}
                disableDropdown={false}
                enableSearch={true}
              />
              <span style={s.tooltipIcon} onClick={() => setShowTooltip(!showTooltip)}>&#8505;&#65039;</span>
              {showTooltip && (
                <div style={s.tooltip}>WhatsApp number is advisable</div>
              )}
            </div>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Referral Code <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input type="text" name="referralCode" value={formData.referralCode || ''}
              onChange={handleChange} placeholder="Enter referral code"
              disabled={loading}
              style={s.input(focusedField === 'referralCode')}
              onFocus={() => setFocusedField('referralCode')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Password</label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} required disabled={loading}
                style={s.input(focusedField === 'password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} required disabled={loading}
                style={s.input(focusedField === 'confirmPassword')}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          {/* Terms */}
          <div style={s.checkRow}>
            <input
              type="checkbox" id="terms"
              checked={termsAccepted}
              onChange={handleCheckboxChange}
              style={{ marginTop: 2, accentColor: '#F5A623', flexShrink: 0 }}
            />
            <label htmlFor="terms" style={s.checkLabel}>
              {termsAccepted ? 'I have read and agree with the ' : 'Please read and accept our '}
              <button
                type="button"
                onClick={openTermsModal}
                style={s.termsLink}
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            style={s.btn}
            disabled={!termsAccepted || loading}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>OR</span>
          <div style={s.dividerLine} />
        </div>

        <div style={s.footer}>
          <p style={s.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={s.footerLink}>Sign in here</Link>
          </p>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          onClick={closeTermsModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0F172A',
              border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 780,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(245,166,35,0.15)',
              flexShrink: 0,
            }}>
              <span style={{ color: '#F5A623', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em' }}>
                📄 Terms and Conditions
              </span>
              <button
                onClick={closeTermsModal}
                style={{
                  background: 'none', border: 'none',
                  color: '#94A3B8', fontSize: '1.4rem',
                  cursor: 'pointer', lineHeight: 1, padding: 0,
                }}
                aria-label="Close"
              >✕</button>
            </div>

            {/* Scrollable content */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
              padding: '0.5rem 1.5rem 1.5rem',
              color: '#CBD5E1',
              fontSize: '0.93rem',
              lineHeight: 1.8,
            }}>
              {termsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <div style={{
                    display: 'inline-block', width: 32, height: 32,
                    borderRadius: '50%',
                    border: '3px solid rgba(245,166,35,0.15)',
                    borderTop: '3px solid #F5A623',
                    animation: 'spin 0.9s linear infinite',
                    marginBottom: 12,
                  }} />
                  <p>Loading…</p>
                </div>
              ) : (
                <div
                  data-terms=""
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              )}
              <style>{`
                .terms-body h2, .terms-body main h2 { color: #F5A623 !important; font-size: 12px !important; text-transform: uppercase; letter-spacing: .06em; margin: 24px 0 8px !important; }
                .terms-body p, .terms-body li { color: #94A3B8 !important; font-size: 14px !important; }
                .terms-body ul { padding-left: 18px; }
                .terms-body a { color: #F5A623 !important; }
                [data-terms] h2 { color: #F5A623 !important; font-size: 12px !important; text-transform: uppercase; letter-spacing: .06em; margin: 24px 0 8px !important; }
                [data-terms] p, [data-terms] li { color: #94A3B8 !important; font-size: 14px !important; line-height: 1.8; }
                [data-terms] ul { padding-left: 18px; margin-bottom: 10px; }
                [data-terms] a { color: #F5A623 !important; }
                [data-terms] header { display: none !important; }
                [data-terms] footer { display: none !important; }
              `}</style>
            </div>

            {/* Accept footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(245,166,35,0.15)',
              display: 'flex', gap: 12, justifyContent: 'flex-end',
              flexShrink: 0,
            }}>
              <button
                onClick={closeTermsModal}
                style={{
                  padding: '0.5rem 1.4rem', borderRadius: 50,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#94A3B8', cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  localStorage.setItem('termsAccepted', 'true');
                  closeTermsModal();
                }}
                style={{
                  padding: '0.5rem 1.4rem', borderRadius: 50,
                  background: 'linear-gradient(135deg,#F5A623,#FBBF24)',
                  border: 'none',
                  color: '#0A0F1E', cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                ✓ I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;

