import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Alert from '../components/Alert';
import '../styles/adminKYC.css';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all'];

const STATUS_LABEL = {
  none: { label: 'None', color: '#6b7280' },
  pending: { label: 'Pending', color: '#d97706' },
  approved: { label: 'Approved', color: '#16a34a' },
  rejected: { label: 'Rejected', color: '#dc2626' },
};

const ID_TYPE_LABEL = {
  nin: 'NIN',
  bvn: 'BVN',
  passport: 'Passport',
  drivers_license: "Driver's License",
};

const AdminKYC = () => {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '', show: false });

  const [activeTab, setActiveTab] = useState('pending');
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Selected submission for the detail/action modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Image preview modal
  const [previewUrl, setPreviewUrl] = useState(null);
  // Track which doc images failed to load so we can show a fallback link
  const [imgErrors, setImgErrors] = useState({});
  const markImgError = (key) => setImgErrors((prev) => ({ ...prev, [key]: true }));

  const apiUrl = process.env.REACT_APP_API_URL || '';

  const triggerAlert = (message, type) => {
    setAlert({ message, type, show: true });
    setTimeout(() => setAlert({ message: '', type: '', show: false }), 4000);
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/kyc', {
        params: { status: activeTab, page, limit: perPage },
      });
      setSubmissions(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load KYC submissions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const openDetail = (user) => {
    setSelected(user);
    setShowModal(true);
    setRejectReason('');
    setImgErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.put(`/api/admin/kyc/${selected._id}/approve`);
      triggerAlert(`KYC approved for ${selected.username || selected.email}`, 'success');
      closeModal();
      fetchSubmissions();
    } catch (err) {
      triggerAlert(err?.response?.data?.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.put(`/api/admin/kyc/${selected._id}/reject`, { reason: rejectReason.trim() });
      triggerAlert(`KYC rejected for ${selected.username || selected.email}`, 'success');
      closeModal();
      fetchSubmissions();
    } catch (err) {
      triggerAlert(err?.response?.data?.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="admin-kyc">
      {alert.show && (
        <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* Header */}
      <div className="kyc-header">
        <h2>KYC Submissions</h2>
        <span className="kyc-total-badge">{total} {activeTab === 'all' ? 'total' : activeTab}</span>
      </div>

      {/* Tabs */}
      <div className="kyc-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            className={`kyc-tab ${activeTab === tab ? 'kyc-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="kyc-error">{error}</div>}

      {/* Table */}
      {loading ? (
        <div className="kyc-loading">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="kyc-empty">No {activeTab} KYC submissions found.</div>
      ) : (
        <div className="kyc-table-wrapper">
          <table className="kyc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Phone</th>
                <th>ID Type</th>
                <th>ID Number</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((user, idx) => {
                const kyc = user.kyc || {};
                const statusMeta = STATUS_LABEL[kyc.status] || STATUS_LABEL.none;
                return (
                  <tr key={user._id}>
                    <td>{(page - 1) * perPage + idx + 1}</td>
                    <td>
                      <div className="kyc-user-cell">
                        <span className="kyc-username">{user.username || 'N/A'}</span>
                        <span className="kyc-email">{user.email}</span>
                      </div>
                    </td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{ID_TYPE_LABEL[kyc.idType] || kyc.idType || 'N/A'}</td>
                    <td className="kyc-id-number">{kyc.idNumber || 'N/A'}</td>
                    <td>
                      <span
                        className="kyc-status-badge"
                        style={{ background: statusMeta.color + '22', color: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td>
                      {kyc.submittedAt
                        ? new Date(kyc.submittedAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                    <td>
                      <button className="kyc-btn kyc-btn--view" onClick={() => openDetail(user)}>
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="kyc-pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="kyc-page-btn">
            ‹ Prev
          </button>
          <span className="kyc-page-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="kyc-page-btn">
            Next ›
          </button>
        </div>
      )}

      {/* Detail / Action Modal */}
      {showModal && selected && (
        <div className="kyc-modal-overlay" onClick={closeModal}>
          <div className="kyc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kyc-modal-header">
              <h3>KYC Review</h3>
              <button className="kyc-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="kyc-modal-body">
              {/* User info */}
              <div className="kyc-detail-section">
                <h4>User Details</h4>
                <div className="kyc-detail-grid">
                  <span className="kyc-detail-label">Username</span>
                  <span>{selected.username || 'N/A'}</span>
                  <span className="kyc-detail-label">Email</span>
                  <span>{selected.email}</span>
                  <span className="kyc-detail-label">Phone</span>
                  <span>{selected.phone || 'N/A'}</span>
                </div>
              </div>

              {/* KYC info */}
              <div className="kyc-detail-section">
                <h4>Submitted Documents</h4>
                <div className="kyc-detail-grid">
                  <span className="kyc-detail-label">ID Type</span>
                  <span>{ID_TYPE_LABEL[selected.kyc?.idType] || selected.kyc?.idType || 'N/A'}</span>
                  <span className="kyc-detail-label">ID Number</span>
                  <span className="kyc-id-number">{selected.kyc?.idNumber || 'N/A'}</span>
                  <span className="kyc-detail-label">Status</span>
                  <span
                    className="kyc-status-badge"
                    style={{
                      background: (STATUS_LABEL[selected.kyc?.status]?.color || '#888') + '22',
                      color: STATUS_LABEL[selected.kyc?.status]?.color || '#888',
                    }}
                  >
                    {STATUS_LABEL[selected.kyc?.status]?.label || selected.kyc?.status}
                  </span>
                  <span className="kyc-detail-label">Submitted</span>
                  <span>
                    {selected.kyc?.submittedAt
                      ? new Date(selected.kyc.submittedAt).toLocaleString()
                      : 'N/A'}
                  </span>
                  {selected.kyc?.reviewedAt && (
                    <>
                      <span className="kyc-detail-label">Reviewed</span>
                      <span>{new Date(selected.kyc.reviewedAt).toLocaleString()}</span>
                    </>
                  )}
                  {selected.kyc?.rejectionReason && (
                    <>
                      <span className="kyc-detail-label">Rejection Reason</span>
                      <span className="kyc-rejection-text">{selected.kyc.rejectionReason}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Document images */}
              <div className="kyc-detail-section">
                <h4>Documents</h4>
                <div className="kyc-docs-row">
                  {selected.kyc?.documentUrl && (() => {
                    const url = `${apiUrl}${selected.kyc.documentUrl}`;
                    const isPdf = !selected.kyc.documentUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
                    return (
                      <div className="kyc-doc-card">
                        <span className="kyc-doc-label">Government ID</span>
                        {isPdf || imgErrors['document'] ? (
                          <div className="kyc-doc-fallback">
                            <span className="kyc-doc-fallback-icon">📄</span>
                            <span className="kyc-doc-fallback-text">
                              {imgErrors['document'] ? 'Image failed to load' : 'PDF document'}
                            </span>
                            <a href={url} target="_blank" rel="noreferrer" className="kyc-doc-open-btn">
                              🔗 Open in new tab
                            </a>
                          </div>
                        ) : (
                          <div className="kyc-doc-img-wrap">
                            <img
                              src={url}
                              alt="ID Document"
                              className="kyc-doc-img"
                              onClick={() => setPreviewUrl(url)}
                              onError={() => markImgError('document')}
                            />
                            <a href={url} target="_blank" rel="noreferrer" className="kyc-doc-open-link">
                              🔗 Open full size
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {selected.kyc?.selfieUrl && (() => {
                    const url = `${apiUrl}${selected.kyc.selfieUrl}`;
                    const isPdf = !selected.kyc.selfieUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
                    return (
                      <div className="kyc-doc-card">
                        <span className="kyc-doc-label">Selfie</span>
                        {isPdf || imgErrors['selfie'] ? (
                          <div className="kyc-doc-fallback">
                            <span className="kyc-doc-fallback-icon">📄</span>
                            <span className="kyc-doc-fallback-text">
                              {imgErrors['selfie'] ? 'Image failed to load' : 'PDF file'}
                            </span>
                            <a href={url} target="_blank" rel="noreferrer" className="kyc-doc-open-btn">
                              🔗 Open in new tab
                            </a>
                          </div>
                        ) : (
                          <div className="kyc-doc-img-wrap">
                            <img
                              src={url}
                              alt="Selfie"
                              className="kyc-doc-img kyc-doc-img--selfie"
                              onClick={() => setPreviewUrl(url)}
                              onError={() => markImgError('selfie')}
                            />
                            <a href={url} target="_blank" rel="noreferrer" className="kyc-doc-open-link">
                              🔗 Open full size
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <p className="kyc-img-hint">Click an image to enlarge, or use the link to open it in a new tab.</p>
              </div>

              {/* Action buttons N/A only show for pending */}
              {selected.kyc?.status === 'pending' && (
                <div className="kyc-detail-section">
                  <h4>Decision</h4>

                  {!showRejectModal ? (
                    <div className="kyc-action-row">
                      <button
                        className="kyc-btn kyc-btn--approve"
                        onClick={handleApprove}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        className="kyc-btn kyc-btn--reject"
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <div className="kyc-reject-form">
                      <label className="kyc-reject-label">Rejection Reason <span style={{ color: '#dc2626' }}>*</span></label>
                      <textarea
                        className="kyc-reject-textarea"
                        rows={3}
                        placeholder="e.g. ID photo is blurry, selfie does not match ID..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="kyc-action-row">
                        <button
                          className="kyc-btn kyc-btn--reject"
                          onClick={handleReject}
                          disabled={actionLoading || !rejectReason.trim()}
                        >
                          {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                        </button>
                        <button
                          className="kyc-btn kyc-btn--secondary"
                          onClick={() => setShowRejectModal(false)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full-size image preview */}
      {previewUrl && (
        <div className="kyc-preview-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="kyc-preview-container">
            <button className="kyc-preview-close" onClick={() => setPreviewUrl(null)}>✕</button>
            <img src={previewUrl} alt="Preview" className="kyc-preview-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC;
