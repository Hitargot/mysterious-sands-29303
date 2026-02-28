import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Alert from "./Alert";
import ConfirmationForm from "./ConfirmationForm";
import { jwtDecode } from "jwt-decode";
import {
  FaInfoCircle, FaTag, FaRegCopy, FaCheckCircle,
  FaSyncAlt, FaShieldAlt, FaBolt, FaExclamationTriangle,
} from "react-icons/fa";

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.25)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
};

const TradeDetails = ({ selectedService }) => {
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const validityCheckedRef = useRef(false);
  const [generatedTag, setGeneratedTag] = useState(""); // Declare state for the generated tag
  // Add a state to track whether the tag has been generated or deleted
  const [hasGeneratedTag, setHasGeneratedTag] = useState(false); // Track if the tag has been generated
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCopied, setIsCopied] = useState(false); // Track if the tag has been copied



  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Get token from localStorage or sessionStorage
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      setUser(decodedToken);
      setToken(storedToken);
      console.log("Decoded User:", decodedToken);
    }
  }, []);



  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
  const response1 = await axios.get(`${apiUrl}/api/services/${selectedService}`);
  const data1 = response1.data;

        if (data1) {
          setServiceDetails(data1);
        } else {
          setServiceDetails(null);
          setAlertMessage("Service not found.");
          setAlertType("error");
        }
      } catch (error) {
        setAlertMessage("Failed to fetch service details.");
        setAlertType("error");
      } finally {
        setLoading(false);
      }
    };

    if (selectedService) fetchServiceDetails();
  }, [selectedService, apiUrl]);

  useEffect(() => {
    const checkExistingTag = async () => {
      if (!user || !user.id || !serviceDetails || !serviceDetails._id) {
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/check-service-tag?userId=${user.id}&serviceId=${serviceDetails._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data && data.tag) {
          setGeneratedTag(data.tag);
          setHasGeneratedTag(true);
          console.log("Loaded tag from backend:", data.tag);
        } else {
          setHasGeneratedTag(false);
          console.log("No tag found in backend, show generate button");
        }
      } catch (error) {
        console.error("Failed to fetch tag:", error);
      }
    };

    checkExistingTag();
  }, [user, token, serviceDetails, apiUrl]);

  const generateTag = async () => {
    if (!user || !user.id) {
      setAlertMessage("User is not defined. Please log in.");
      setAlertType("error");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/get-service-tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          serviceId: serviceDetails._id,
        }),
      });

      const data = await res.json();

      if (data && data.tag) {
        setGeneratedTag(data.tag);
        setHasGeneratedTag(true);
        setAlertMessage(`Tag generated: ${data.tag}`);
        setAlertType("success");

        // Update serviceDetails state with the new tag
        setServiceDetails((prev) => ({
          ...prev,
          tags: [...(prev?.tags || []), { tag: data.tag, userId: user.id }],
        }));
      } else {
        setAlertMessage("Failed to generate tag.");
        setAlertType("error");
      }
    } catch (err) {
      console.error("Tag generation failed:", err);
      setAlertMessage("Failed to generate tag.");
      setAlertType("error");
    }
  };


  const checkValidity = async () => {
    setRefreshing(true);
    try {
      const response2 = await axios.get(`${apiUrl}/api/services/${selectedService}`);
      const data2 = response2.data;
      if (data2) {
        setServiceDetails(data2);
        const valid = data2.status === "valid";
        setIsValid(valid);
        if (!valid) {
          setAlertMessage(`${data2.name} is currently not available.`);
          setAlertType("error");
        }
      } else {
        setServiceDetails(null);
        setIsValid(false);
        setAlertMessage("Service not found.");
        setAlertType("error");
      }
    } finally {
      setRefreshing(false);
      validityCheckedRef.current = true;
    }
  };

  if (!serviceDetails) return null;

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>

      {/* ── Card shell ── */}
      <div style={{
        background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(18px)',
        border: `1px solid ${G.goldBorder}`, borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(245,166,35,0.10)',
      }}>

        {/* Gold top bar */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg,${G.gold},${G.goldLight})`,
        }} />

        {/* Header */}
        <div style={{
          padding: '20px 22px 14px',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(245,166,35,0.35)', flexShrink: 0,
          }}>
            <FaInfoCircle style={{ color: G.navy, fontSize: 19 }} />
          </div>
          <div>
            <div style={{ color: G.gold, fontWeight: 700, fontSize: 17 }}>Service Details</div>
            <div style={{ color: G.slateD, fontSize: 12 }}>{serviceDetails.name}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: G.slateD }}>Loading details...</div>
        ) : (
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── Info rows ── */}
            {[
              { label: 'Description', value: serviceDetails.description },
              { label: 'Note', value: serviceDetails.note },
              { label: 'Fees', value: serviceDetails.fees },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                border: `1px solid rgba(255,255,255,0.06)`, padding: '11px 14px',
              }}>
                <div style={{ color: G.slateD, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ color: G.white, fontSize: 14, lineHeight: 1.6 }}>{value}</div>
              </div>
            ))}

            {/* ── Min / Max amount ── */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Minimum Amount', value: serviceDetails.minAmount, hint: 'Contact support to trade lower' },
                { label: 'Maximum Amount', value: serviceDetails.maxAmount, hint: 'Contact support to trade higher' },
              ].filter(r => r.value !== undefined && r.value !== null).map(({ label, value, hint }) => (
                <div key={label} style={{
                  flex: 1, background: G.goldFaint, borderRadius: 10,
                  border: `1px solid ${G.goldBorder}`, padding: '11px 14px',
                }}>
                  <div style={{ color: G.slateD, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ color: G.gold, fontWeight: 700, fontSize: 16 }}>
                    ${Number(value).toLocaleString()}
                  </div>
                  <div style={{ color: G.slateD, fontSize: 11, marginTop: 4 }}>{hint}</div>
                </div>
              ))}
            </div>

            {/* ── Tag section ── */}
            {/* Non-special service tag */}
            {serviceDetails?._id !== "678abb516cbaa411698e7fa0" && (serviceDetails?.tag || generatedTag) && (() => {
              const tagVal = generatedTag || serviceDetails.tag;
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.06)`, padding: '11px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ color: G.slateD, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>
                        Tag
                      </div>
                      <div style={{ color: G.white, fontWeight: 600, fontSize: 14 }}>
                        {isMobile && tagVal.length > 10 ? `${tagVal.slice(0, 10)}…` : tagVal}
                      </div>
                    </div>
                    <FaTag style={{ color: G.slateD, fontSize: 16 }} />
                  </div>
                  {/* Copy button */}
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tagVal);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      } catch {}
                    }}
                    style={{
                      marginTop: 10, width: '100%', padding: '9px', borderRadius: 8,
                      border: `1px solid ${G.goldBorder}`,
                      background: isCopied ? G.greenFaint : 'transparent',
                      color: isCopied ? G.green : G.gold,
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      transition: 'all 200ms ease',
                    }}
                  >
                    {isCopied ? <><FaCheckCircle /> Copied!</> : <><FaRegCopy /> Copy Tag</>}
                  </button>
                </div>
              );
            })()}

            {/* Special service: generate tag button */}
            {serviceDetails?._id === "678abb516cbaa411698e7fa0" && !hasGeneratedTag && (
              <button
                onClick={generateTag}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
                  color: G.navy, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
                }}
              >
                <FaTag /> Generate Tag
              </button>
            )}

            {/* User tag display (special service) */}
            {serviceDetails?.tags?.length > 0 && user?.id && (() => {
              const userTags = serviceDetails.tags.filter((t) => t.userId?.toString() === user.id);
              if (!userTags.length) return null;
              const tagVal = userTags[0].tag;
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.06)`, padding: '11px 14px',
                }}>
                  <div style={{ color: G.slateD, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    Your Tag
                  </div>
                  {userTags.map((t, i) => (
                    <div key={i} style={{ color: G.white, fontWeight: 600, fontSize: 14 }}>
                      {isMobile && t.tag?.length > 10 ? `${t.tag.slice(0, 10)}…` : t.tag}
                    </div>
                  ))}
                  {/* Inline copy button */}
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tagVal);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      } catch {}
                    }}
                    style={{
                      marginTop: 10, width: '100%', padding: '9px', borderRadius: 8,
                      border: `1px solid ${G.goldBorder}`,
                      background: isCopied ? G.greenFaint : 'transparent',
                      color: isCopied ? G.green : G.gold,
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      transition: 'all 200ms ease',
                    }}
                  >
                    {isCopied ? <><FaCheckCircle /> Copied!</> : <><FaRegCopy /> Copy Tag</>}
                  </button>
                </div>
              );
            })()}

            {/* ── Check Validity ── */}
            <div>
              <button
                onClick={checkValidity}
                disabled={refreshing}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: refreshing
                    ? 'rgba(255,255,255,0.06)'
                    : `linear-gradient(135deg,${G.gold},${G.goldLight})`,
                  color: refreshing ? G.slateD : G.navy,
                  fontWeight: 700, fontSize: 15, cursor: refreshing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: refreshing ? 'none' : '0 4px 16px rgba(245,166,35,0.3)',
                  transition: 'all 200ms ease',
                }}
              >
                <FaSyncAlt style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing…' : 'Check Validity'}
              </button>

              {/* Validity status */}
              {!validityCheckedRef.current ? (
                <div style={{ color: G.slateD, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                  Click "Check Validity" to confirm current status.
                </div>
              ) : isValid ? (
                <div style={{
                  marginTop: 10, padding: '10px 14px', borderRadius: 10,
                  background: G.greenFaint, border: `1px solid rgba(52,211,153,0.25)`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <FaShieldAlt style={{ color: G.green, fontSize: 15 }} />
                  <span style={{ color: G.green, fontSize: 13, fontWeight: 600 }}>Service is valid and available.</span>
                </div>
              ) : (
                <div style={{
                  marginTop: 10, padding: '10px 14px', borderRadius: 10,
                  background: G.redFaint, border: `1px solid rgba(248,113,113,0.25)`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <FaExclamationTriangle style={{ color: G.red, fontSize: 15 }} />
                  <span style={{ color: G.red, fontSize: 13, fontWeight: 600 }}>Service is currently unavailable.</span>
                </div>
              )}
            </div>

            {/* ── Alert ── */}
            {alertMessage && (
              <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage('')} />
            )}

            {/* ── Confirmation Form ── */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12,
              border: `1px solid ${G.goldBorder}`, padding: '18px 16px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.06)`,
              }}>
                <FaBolt style={{ color: G.gold, fontSize: 15 }} />
                <span style={{ color: G.gold, fontWeight: 700, fontSize: 15 }}>Submit Receipt for Confirmation</span>
              </div>
              <ConfirmationForm selectedService={selectedService} />
            </div>

          </div>
        )}
      </div>

      {/* spin keyframe injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TradeDetails;
