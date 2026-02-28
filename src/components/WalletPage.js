import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { useNotification } from '../context/NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import { FaEye, FaEyeSlash, FaWallet, FaUniversity, FaMoneyBillWave, FaExchangeAlt, FaPlus, FaRedo, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import WithdrawalPinInput from './WithdrawalPinInput';
import BankManager from './BankManager';
import Spinner from './Spinner';
import Modal from './Modal';
import ErrorBoundary from './ErrorBoundary';

// ── design tokens ─────────────────────────────────────────────────────────────
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.1)',
  goldBorder: 'rgba(245,166,35,0.2)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171', redFaint: 'rgba(248,113,113,0.08)',
  amber: '#FBBF24', amberFaint: 'rgba(251,191,36,0.1)',
};

const card = {
  background: 'rgba(15,23,42,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${G.goldBorder}`,
  borderRadius: '18px',
  padding: '1.6rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(10,15,30,0.7)',
  border: `1px solid rgba(245,166,35,0.25)`,
  borderRadius: '10px', padding: '11px 14px',
  color: G.white, fontSize: '0.92rem',
  outline: 'none', transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', marginBottom: '6px',
  fontSize: '0.78rem', fontWeight: 700,
  color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.07em',
};

const primaryBtn = (disabled) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
  background: disabled
    ? 'rgba(100,116,139,0.3)'
    : `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
  color: disabled ? G.slateD : G.navy,
  fontSize: '0.92rem', fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: disabled ? 'none' : '0 4px 16px rgba(245,166,35,0.3)',
});

const secondaryBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  width: '100%', padding: '12px', borderRadius: '12px',
  border: `1px solid ${G.goldBorder}`,
  background: 'transparent', color: G.gold,
  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const WalletPage = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const { addNotification } = useNotification();
  const [showBankManager, setShowBankManager] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [showAllBanks, setShowAllBanks] = useState(false);
  const [kycStatus, setKycStatus] = useState(null); // 'approved', 'pending', 'rejected', etc.

  const BANK_VISIBLE_CAP = 3;

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const toggleBalanceVisibility = () => setIsBalanceVisible(v => !v);

  const getJwtToken = useCallback(() => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (!token) {
      handleAlert('You must be logged in to view your wallet.', 'error');
      navigate('/login');
      return null;
    }
    return token;
  }, [navigate]);

  // Fetch KYC status on mount
  useEffect(() => {
    const fetchKycStatus = async () => {
      const token = getJwtToken();
      if (!token) return;
      try {
        const res = await axios.get(`${apiUrl}/api/kyc/status`, { headers: { Authorization: `Bearer ${token}` } });
        setKycStatus(res.data?.kyc?.status || null);
      } catch (err) {
        setKycStatus(null);
      }
    };
    fetchKycStatus();
  }, [getJwtToken, apiUrl]);

  const fetchWalletData = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return;
    try {
      const response = await axios.get(`${apiUrl}/api/wallet/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balance = response.data.balance;
      const fee = response.data.withdrawFee ?? 0;
      if (typeof balance === 'number') {
        setWalletBalance(balance);
        setWithdrawFee(fee);
      } else {
        handleAlert('Unexpected response format: balance not found.', 'error');
      }
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Failed to load wallet data.', 'error');
    }
  }, [getJwtToken, apiUrl]);

  const fetchBankAccounts = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return;
    setBankLoading(true);
    setBankError(null);
    try {
      const response = await axios.get(`${apiUrl}/api/wallet/banks`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      if (Array.isArray(response.data.banks) && response.data.banks.length > 0) {
        setBankAccounts(response.data.banks);
        setSelectedBankAccount(response.data.banks[0]._id);
      } else {
        setBankAccounts([]);
        setSelectedBankAccount(null);
        handleAlert('No bank accounts available. Please add a bank account.', 'error');
      }
    } catch (error) {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.message || 'Failed to load bank accounts.';
      const friendly = serverMsg + (status ? ` (status ${status})` : '');
      setBankError(friendly);
      handleAlert(friendly, 'error');
    } finally {
      setBankLoading(false);
    }
  }, [getJwtToken, apiUrl]);

  useEffect(() => {
    fetchWalletData();
    fetchBankAccounts();
  }, [fetchWalletData, fetchBankAccounts]);

  const handleWithdraw = async () => {
    const token = getJwtToken();
    if (!token) return;
    try {
      const pinCheckResponse = await axios.get(`${apiUrl}/api/wallet/check-pin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pinCheckResponse.data.hasPin === false) {
        navigate('/set-pin');
        return;
      }
    } catch (err) {
      handleAlert('Failed to verify PIN setup.', 'error');
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (!bankAccounts || bankAccounts.length === 0) {
      handleAlert('No bank accounts found. Please add or refresh bank accounts.', 'error');
      return;
    }
    if (!selectedBankAccount) {
      handleAlert('Please select a bank account.', 'error');
      return;
    }
    const selectedBank = bankAccounts.find((bank) => String(bank._id) === String(selectedBankAccount));
    if (!selectedBank) {
      handleAlert('Invalid bank selection. Please select a valid bank account.', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      handleAlert('Please enter a valid withdrawal amount greater than zero.', 'error');
      return;
    }
    const totalDebit = Number(amount) + Number(withdrawFee || 0);
    if (totalDebit > Number(walletBalance || 0)) {
      handleAlert(`Insufficient funds. Withdrawal + fee (�?{withdrawFee}) exceeds your balance.`, 'error');
      return;
    }
    if (amount >= 100000) {
      let latestKycStatus = kycStatus;
      try {
        const token = getJwtToken();
        if (!token) return;
        const res = await axios.get(`${apiUrl}/api/kyc/status`, { headers: { Authorization: `Bearer ${token}` } });
        latestKycStatus = res.data?.kyc?.status || null;
        setKycStatus(latestKycStatus); // update state for UI
      } catch (err) {
        // fallback to current state if API fails
      }
      console.log('[Withdraw] amount:', amount, 'latestKycStatus:', latestKycStatus);
      if (latestKycStatus === null) {
        handleAlert('Could not verify your KYC status. Please refresh the page or try again.', 'error');
        return;
      }
      if (latestKycStatus !== 'approved') {
        const msg =
          latestKycStatus === 'pending'
            ? 'Your KYC is still under review. Withdrawals of ₦100,000 or more require a verified identity.'
            : latestKycStatus === 'rejected'
            ? 'Your KYC was rejected. Please resubmit your documents to unlock large withdrawals.'
            : 'Withdrawals of ₦100,000 or more require identity verification (KYC). Please complete your KYC first.';
        handleAlert(msg, 'error');
        return;
      }
    }
    setShowPinInput(true);
  };

  const handlePinSubmit = async (withdrawPin) => {
  const token = getJwtToken();
  if (!token) return false;
  if (!selectedBankAccount) { handleAlert('Please select a bank account.', 'error'); return false; }
  const selectedBank = bankAccounts.find((bank) => String(bank._id) === String(selectedBankAccount));
  if (!selectedBank) { handleAlert('Invalid bank account selected', 'error'); return false; }
  const amount = Number(withdrawAmount);
  if (isNaN(amount) || amount <= 0) { handleAlert('Invalid withdrawal amount.', 'error'); return false; }
  setIsSubmittingWithdrawal(true);
  handleAlert('Submitting withdrawal… please wait.', 'info');
    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/withdraw`,
        { amount, bankId: selectedBank._id, accountNumber: selectedBank.accountNumber, withdrawPin },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 20000 }
      );
      setWithdrawAmount('');
      setSelectedBankAccount('');
      setShowPinInput(false);
      if (response.data && (response.data.success || response.data.transactionId)) {
        handleAlert('Withdrawal request submitted successfully!', 'success');
        fetchWalletData();
        addNotification({ id: uuidv4(), message: 'Withdrawal request submitted successfully!', type: 'success', read: false });
        return true;
      }
      handleAlert(response.data?.message || 'Withdrawal failed. Please try again.', 'error');
      return false;
    } catch (error) {
      const serverMsg = error.response?.data?.message || error.message || 'Error submitting withdrawal request.';
      handleAlert(serverMsg, 'error');
      return false;
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const handleAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type || 'error');
    setShowAlert(true);
  };
  const handleCloseAlert = () => setShowAlert(false);

  const totalDebit = Number(withdrawAmount || 0) + Number(withdrawFee || 0);
  const isWithdrawDisabled = bankLoading || isSubmittingWithdrawal || !selectedBankAccount || Number(withdrawAmount) <= 0 || totalDebit > walletBalance;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 0 32px' }}>

      {/* ── Balance Card ── */}
      <div style={{
        background: `linear-gradient(135deg, rgba(245,166,35,0.18) 0%, rgba(15,23,42,0.95) 100%)`,
        border: `1px solid rgba(245,166,35,0.35)`,
        borderRadius: '20px',
        padding: '1.8rem 2rem',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FaWallet style={{ color: G.gold, fontSize: '1rem' }} />
              <span style={{ color: G.slateD, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Wallet Balance
              </span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: G.gold, letterSpacing: '0.01em', lineHeight: 1 }}>
              {isBalanceVisible ? `\u20a6${walletBalance.toLocaleString()}` : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
            </div>
            <div style={{ marginTop: 8, color: G.slateD, fontSize: '0.78rem' }}>
              Available for withdrawal
            </div>
          </div>
          <button onClick={toggleBalanceVisibility} style={{
            background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
            borderRadius: '10px', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: G.gold, fontSize: '1.1rem',
          }}>
            {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setActiveComponent('transfer')} style={secondaryBtn}>
          <FaExchangeAlt /> Send Money
        </button>
        <button
          onClick={() => setShowBankManager(true)}
          style={secondaryBtn}
        >
          <FaPlus /> Add Bank
        </button>
      </div>

      {/* ── Bank Manager Modal ── */}
      <Modal show={showBankManager} title="Add Bank Account" onClose={() => setShowBankManager(false)}>
        <BankManager onAdded={() => { fetchBankAccounts(); setShowBankManager(false); }} />
      </Modal>

      {/* ── Withdraw Section ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.4rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.navy,
          }}>
            <FaMoneyBillWave style={{ fontSize: '1rem' }} />
          </div>
          <div>
            <div style={{ color: G.white, fontWeight: 700, fontSize: '1rem' }}>Withdraw Funds</div>
            <div style={{ color: G.slateD, fontSize: '0.75rem' }}>Transfer to your bank account</div>
          </div>
          {!bankLoading && bankError && (
            <button onClick={fetchBankAccounts} style={{
              marginLeft: 'auto', background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              color: G.gold, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <FaRedo style={{ fontSize: '0.65rem' }} /> Retry
            </button>
          )}
        </div>

        {/* ── Step 1: Bank Account List ── */}
        <div style={{ marginBottom: selectedBankAccount ? 16 : 0 }}>
          <label style={labelStyle}>
            <FaUniversity style={{ marginRight: 4 }} />
            {selectedBankAccount ? 'Selected Account' : 'Select Bank Account'}
          </label>

          {bankLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', color: G.slateD, fontSize: '0.88rem' }}>
              <Spinner size={16} /> Loading your bank accounts...
            </div>
          ) : bankAccounts.length === 0 ? (
            <div style={{
              padding: '16px', borderRadius: 12,
              background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
              color: G.slate, fontSize: '0.85rem', textAlign: 'center',
            }}>
              No bank accounts saved.{' '}
              <button
                onClick={() => setShowBankManager(true)}
                style={{ background: 'none', border: 'none', color: G.gold, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Add one now +
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(showAllBanks ? bankAccounts : bankAccounts.slice(0, BANK_VISIBLE_CAP)).map((account) => {
                  const isSelected = String(selectedBankAccount) === String(account._id);
                  return (
                    <button
                      key={account._id}
                      onClick={() => setSelectedBankAccount(account._id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        width: '100%', textAlign: 'left',
                        background: isSelected ? G.goldFaint : 'rgba(10,15,30,0.5)',
                        border: `2px solid ${isSelected ? G.gold : 'rgba(245,166,35,0.12)'}`,
                        borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 0 3px rgba(245,166,35,0.1)' : 'none',
                      }}
                    >
                      {/* Bank icon */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: isSelected
                          ? `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`
                          : 'rgba(245,166,35,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? G.navy : G.gold,
                      }}>
                        <FaUniversity size={16} />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: G.white, fontWeight: 700, fontSize: '0.92rem', marginBottom: 3 }}>
                          {account.bankName}
                        </div>
                        <div style={{ color: G.slateD, fontSize: '0.8rem', letterSpacing: '0.06em' }}>
                          {account.accountNumber}
                        </div>
                        {account.accountName && (
                          <div style={{ color: G.slate, fontSize: '0.78rem', marginTop: 2 }}>
                            {account.accountName}
                          </div>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isSelected
                        ? <FaCheckCircle style={{ color: G.gold, fontSize: '1.1rem', flexShrink: 0 }} />
                        : <FaChevronRight style={{ color: G.slateD, fontSize: '0.85rem', flexShrink: 0 }} />
                      }
                    </button>
                  );
                })}
              </div>

              {/* Show more / less toggle — only if > BANK_VISIBLE_CAP */}
              {bankAccounts.length > BANK_VISIBLE_CAP && (
                <button
                  onClick={() => setShowAllBanks(v => !v)}
                  style={{
                    marginTop: 10, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: 'transparent',
                    border: `1px dashed ${G.goldBorder}`,
                    borderRadius: 10, padding: '9px 0',
                    color: G.slate, fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'color 0.2s',
                  }}
                >
                  {showAllBanks
                    ? <>&#9650; Show less</>
                    : <>&#9660; Show {bankAccounts.length - BANK_VISIBLE_CAP} more account{bankAccounts.length - BANK_VISIBLE_CAP > 1 ? 's' : ''}</>
                  }
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Step 2: Selected Account Details + Amount ── */}
        {selectedBankAccount && (() => {
          const acct = bankAccounts.find(b => String(b._id) === String(selectedBankAccount));
          if (!acct) return null;
          return (
            <>
              {/* Full account detail card */}
              <div style={{
                marginBottom: 16, padding: '14px 16px', borderRadius: 12,
                background: 'rgba(10,15,30,0.6)',
                border: `1px solid ${G.goldBorder}`,
              }}>
                <div style={{ fontSize: '0.72rem', color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                  Sending to
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: G.slateD, fontSize: '0.82rem' }}>Bank</span>
                    <span style={{ color: G.white, fontSize: '0.88rem', fontWeight: 600 }}>{acct.bankName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: G.slateD, fontSize: '0.82rem' }}>Account Number</span>
                    <span style={{ color: G.white, fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.1em' }}>{acct.accountNumber}</span>
                  </div>
                  {acct.accountName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: G.slateD, fontSize: '0.82rem' }}>Account Name</span>
                      <span style={{ color: G.green, fontSize: '0.88rem', fontWeight: 600 }}>{acct.accountName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Withdrawal Amount (&#8358;)</label>
                <input
                  type="number"
                  placeholder="Min ₦100 • Max ₦1,000,000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* KYC warning: only show if not approved */}
              {Number(withdrawAmount) >= 100000 && kycStatus !== 'approved' && (
                <div style={{
                  marginBottom: '16px', padding: '12px 14px',
                  background: G.amberFaint, border: `1px solid rgba(251,191,36,0.3)`,
                  borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>&#9888;&#65039;</span>
                  <span style={{ color: G.amber, fontSize: '0.82rem', lineHeight: 1.5 }}>
                    Withdrawals of <strong>&#8358;100,000+</strong> require approved KYC.{' '}
                    <button
                      type="button"
                      onClick={() => setActiveComponent('kyc')}
                      style={{ background: 'none', border: 'none', padding: 0, color: G.gold, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Complete KYC &#8594;
                    </button>
                  </span>
                </div>
              )}

              {/* Fee summary */}
              <div style={{
                marginBottom: '16px', padding: '12px 14px',
                background: 'rgba(10,15,30,0.5)', borderRadius: '10px',
                border: `1px solid rgba(255,255,255,0.05)`,
                display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: '0.82rem', color: G.slate }}>
                  Fee: <strong style={{ color: G.white }}>&#8358;{withdrawFee?.toLocaleString() ?? '0'}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: G.slate }}>
                  Total debit: <strong style={{ color: G.gold }}>&#8358;{totalDebit.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: G.slate }}>
                  Balance after: <strong style={{ color: totalDebit > walletBalance ? G.red : G.green }}>
                    &#8358;{Math.max(0, walletBalance - totalDebit).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Submit */}
              <button style={primaryBtn(isWithdrawDisabled)} onClick={handleWithdraw} disabled={isWithdrawDisabled}>
                {isSubmittingWithdrawal ? <><Spinner size={16} />{' '}Submitting...</> : 'Submit Withdrawal'}
              </button>
            </>
          );
        })()}
      </div>

      {/* PIN modal */}
      {showPinInput && (
        <ErrorBoundary>
          <Modal show={showPinInput} title="Enter Withdrawal PIN" onClose={() => setShowPinInput(false)}>
            <WithdrawalPinInput onPinSubmit={handlePinSubmit} onCancel={() => setShowPinInput(false)} />
          </Modal>
        </ErrorBoundary>
      )}

      {showAlert && <Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} />}
    </div>
  );
};

export default WalletPage;
