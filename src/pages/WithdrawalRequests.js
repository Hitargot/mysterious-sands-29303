import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';
import {jwtDecode} from 'jwt-decode'; // default import
import '../styles/withdrawalRequests.css';
import { useNavigate } from 'react-router-dom';
import { getAdminToken, removeAdminToken } from '../utils/adminAuth';

// Responsive admin withdrawal requests page (table on desktop, cards on mobile)
const WithdrawalRequests = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? getAdminToken() : null;

  const [withdrawals, setWithdrawals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [providerChoice, setProviderChoice] = useState('manual');
  const [receiptFile, setReceiptFile] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const isTokenExpired = (t) => {
    if (!t) return true;
    try {
      const d = jwtDecode(t);
      const now = Date.now() / 1000;
      return d.exp && d.exp < now;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    if (isTokenExpired(token)) {
      setError('Session expired N/A please log in again');
      removeAdminToken();
      navigate('/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/admin/withdrawal-requests`, { headers });
      const data = Array.isArray(res.data) ? res.data : (res.data.withdrawals || res.data.data || res.data);
      setWithdrawals(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error('fetch withdrawals error', err);
      setError(err.response?.data?.message || err.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }

  // Filtering/searching
  useEffect(() => {
    let list = withdrawals.slice();
    if (status !== 'all') list = list.filter(w => (w.status || '').toString().toLowerCase() === status.toLowerCase());
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(w => (
        (w.transactionId || w._id || '').toString().toLowerCase().includes(q) ||
        ((w.userId?.username || w.userId?.name || w.user?.username || w.username || '')).toString().toLowerCase().includes(q) ||
        ((w.bankId?.bankName || w.bankId?.accountName || w.bankName || w.bank?.name || '')).toString().toLowerCase().includes(q) ||
        String(w.amount || w.value || '').toLowerCase().includes(q)
      ));
    }
    setFiltered(list);
    setPage(1);
  }, [withdrawals, status, search]);

  const pages = useMemo(() => Math.max(1, Math.ceil((filtered.length || 0) / perPage)), [filtered.length]);
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  function openModal(tx, action) {
    setSelectedTx(tx);
    setModalAction(action);
    setProviderChoice('manual');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedTx(null);
    setModalAction('');
    setReceiptFile(null);
  }

  async function doAction() {
    if (!selectedTx) return closeModal();
    try {
      const url = `${apiUrl}/api/admin/process/${selectedTx.transactionId || selectedTx._id}`;
      const actionBody = { action: modalAction === 'process' ? 'complete' : (modalAction === 'reject' ? 'reject' : modalAction), provider: providerChoice };

      // If provider is manual, require a receiptFile (frontend validation)
      if (providerChoice === 'manual' && actionBody.action === 'complete' && !receiptFile) {
        setError('Please attach a receipt file before processing a manual withdrawal.');
        return;
      }

      let resp;
      if (receiptFile) {
        const form = new FormData();
        form.append('receipt', receiptFile);
        Object.keys(actionBody).forEach(k => form.append(k, actionBody[k]));
        resp = await axios.post(url, form, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      } else {
        resp = await axios.post(url, actionBody, { headers });
      }
      // apply optimistic update
      const updated = resp.data && resp.data.transaction ? resp.data.transaction : null;
  setWithdrawals(prev => prev.map(w => (w._id === selectedTx._id || w.transactionId === selectedTx.transactionId) ? (updated ? { ...w, ...updated } : { ...w, status: actionBody.action === 'complete' ? 'processing_admin' : (actionBody.action === 'reject' ? 'rejected' : w.status) }) : w));
      closeModal();
    } catch (err) {
      console.error('action error', err);
      setError(err.response?.data?.message || 'Action failed');
      closeModal();
    }
  }

  return (
    <div className="withdrawal-requests-page p-4">
      <h2 className="mb-4">Withdrawal Requests</h2>
      {error && <Alert type="error" message={error} />}

      <div className="controls mb-4">
        <input className="search-input" placeholder="Search id, user, bank, amount" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value)} className="status-select">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing_admin">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="btn refresh" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      {/* Desktop table */}
      <div className="table-wrap">
        <table className="withdrawals-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(w => {
              const st = ((w.status || '')).toString().toLowerCase();
              const canAct = st !== 'completed' && st !== 'paid' && st !== 'rejected' && st !== 'failed';
              return (
              <tr key={w._id || w.transactionId} className={`row ${st}`}>
                <td className="mono">{w.transactionId || w._id}</td>
                <td>{w.userId?.username || w.userId?.name || w.user?.username || w.username || 'N/A'}</td>
                <td>₦{Number(w.amount || w.value || 0).toLocaleString()}</td>
                <td>
                  <div>{w.bankId?.accountName || w.bankAccount?.accountName || 'N/A'}</div>
                  <div className="muted">{w.bankId?.accountNumber || w.bankAccount?.accountNumber || 'N/A'}</div>
                  <div className="muted">{w.bankId?.bankName || w.bankName || w.bank?.name || 'N/A'}</div>
                </td>
                <td><span className={`status-badge ${w.status ? w.status.toLowerCase() : ''}`}>{w.status || 'pending'}</span></td>
                <td>{w.createdAt ? new Date(w.createdAt).toLocaleString() : (w.requestedAt ? new Date(w.requestedAt).toLocaleString() : 'N/A')}</td>
                <td>
                  <div className="actions">
                    {canAct && (
                      <>
                        <button className="btn small" onClick={() => openModal(w, 'process')}>Process</button>
                        <button className="btn small danger" onClick={() => openModal(w, 'reject')}>Reject</button>
                      </>
                    )}
                    {(st === 'processing_admin' || st === 'processing_provider') && <button disabled className="btn small">Processing</button>}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Cards for mobile */}
      <div className="cards-wrap">
        {pageItems.map(w => {
          const st = ((w.status || '')).toString().toLowerCase();
          const canAct = st !== 'completed' && st !== 'paid' && st !== 'rejected' && st !== 'failed';
          return (
          <div key={w._id || w.transactionId} className="withdrawal-card">
            <div className="card-top">
              <div className="mono">{w.transactionId || w._id}</div>
              <div className={`status ${w.status ? w.status.toLowerCase() : ''}`}>{w.status || 'pending'}</div>
            </div>
            <div className="card-body">
              <div><strong>User:</strong> {w.userId?.username || w.userId?.name || w.user?.username || w.username || 'N/A'}</div>
              <div><strong>Amount:</strong> ₦{Number(w.amount || w.value || 0).toLocaleString()}</div>
              <div>
                <strong>Bank:</strong>
                <div>{w.bankId?.accountName || w.bankAccount?.accountName || 'N/A'}</div>
                <div className="muted">{w.bankId?.accountNumber || w.bankAccount?.accountNumber || 'N/A'}</div>
                <div className="muted">{w.bankId?.bankName || w.bankName || w.bank?.name || 'N/A'}</div>
              </div>
                <div className="card-actions">
                {canAct && (
                  <>
                    <button className="btn small" onClick={() => openModal(w, 'process')}>Process</button>
                    <button className="btn small danger" onClick={() => openModal(w, 'reject')}>Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
        <span>Page {page} of {pages}</span>
        <button className="btn" onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page >= pages}>Next</button>
      </div>

      {/* Modal */}
      {isModalOpen && selectedTx && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modalAction === 'process' ? 'Process withdrawal' : modalAction === 'reject' ? 'Reject withdrawal' : 'Confirm action'}</h3>
            {modalAction === 'process' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ marginRight: 8 }}>Provider</label>
                <select value={providerChoice} onChange={e => setProviderChoice(e.target.value)}>
                  <option value="manual">Manual</option>
                  <option value="flutterwave">Flutterwave</option>
                </select>
              </div>
            )}
            {modalAction === 'process' && providerChoice === 'manual' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Upload receipt (required for manual processing)</label>
                <input type="file" accept="image/*,application/pdf,video/*" onChange={(e) => setReceiptFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={doAction}>{modalAction === 'reject' ? 'Confirm Reject' : (modalAction === 'process' ? 'Process' : 'Confirm')}</button>
              <button className="btn close" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;
