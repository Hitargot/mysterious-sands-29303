import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import dayjs from 'dayjs';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [presubmissions, setPresubmissions] = useState([]);
  const [serverTxByType, setServerTxByType] = useState({});
  const [confirmationsByStatus, setConfirmationsByStatus] = useState({});
  const [transfersCount, setTransfersCount] = useState(0);
  const [tradesCount, setTradesCount] = useState(0);
  const [withdrawalsCount, setWithdrawalsCount] = useState(0);
  const [withdrawalsByStatus, setWithdrawalsByStatus] = useState({});
  const [presubmissionsCount, setPresubmissionsCount] = useState(0);
  const [ticketsCount, setTicketsCount] = useState(0);
  
  const [confirmationsCount, setConfirmationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tsLoading, setTsLoading] = useState(false);
  const [tsError, setTsError] = useState(null);
  const [granularity, setGranularity] = useState('daily'); // daily|weekly|monthly
  const [spanDays, setSpanDays] = useState(30); // number of days
  const [resource, setResource] = useState('users'); // users|transactions|confirmations|presubmissions
  const [timeseriesSeries, setTimeseriesSeries] = useState([]);
  const tsCache = useRef({}); // cache keyed by `${resource}|${granularity}|${spanDays}`

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prefer a consolidated admin stats endpoint which returns precomputed aggregates
        // Shape we support (flexible): { users, usersCount, usersByDay, tickets, ticketCounts, transactions, transactionsCount, presubmissions, presubmissionsCount, recentTransactions, recentTickets }
        let statsRes = null;
        try {
          statsRes = await api.get('/api/admin/stats');
        } catch (e) {
          // continue to best-effort individual endpoints if stats endpoint missing
          statsRes = null;
        }

        if (statsRes && statsRes.data) {
          const s = statsRes.data;
          if (!mounted) return;
          setUsers(Array.isArray(s.users) ? s.users : (s.usersList || []));
          setTickets(Array.isArray(s.tickets) ? s.tickets : (s.chats || []));
          setTransactions(Array.isArray(s.transactions) ? s.transactions : (s.recentTransactions || []));
          setPresubmissions(Array.isArray(s.presubmissions) ? s.presubmissions : (s.recentPresubmissions || []));
          // optional enhanced stats
          if (s.txByType) setServerTxByType(s.txByType);
          if (s.confirmationsByStatus) setConfirmationsByStatus(s.confirmationsByStatus);
          if (s.withdrawalsByStatus) setWithdrawalsByStatus(s.withdrawalsByStatus);
          if (typeof s.transfersCount === 'number') setTransfersCount(s.transfersCount);
          if (typeof s.tradesCount === 'number') setTradesCount(s.tradesCount);
          if (typeof s.withdrawalsCount === 'number') setWithdrawalsCount(s.withdrawalsCount);
          if (typeof s.presubmissionsCount === 'number') setPresubmissionsCount(s.presubmissionsCount);
          if (typeof s.ticketsCount === 'number') setTicketsCount(s.ticketsCount);
          // recentTransfers ignored N/A we use transactions/recentTransactions from the stats payload
          if (typeof s.confirmationsCount === 'number') setConfirmationsCount(s.confirmationsCount);
          // keep usersByDay in local state via users array mapping (the chart derives from users)
        } else {
          // Fallback: fetch individual resources (best-effort)
          // Users
          let usersRes = null;
          try { usersRes = await api.get('/api/users/users'); } catch (e) { try { usersRes = await api.get('/api/users'); } catch (er) { usersRes = null; } }
          const usersData = usersRes && usersRes.data ? (Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.users || usersRes.data.usersList || [])) : [];

          // Tickets
          let ticketsRes = null;
          try { ticketsRes = await api.get('/api/tickets'); } catch (e) { try { ticketsRes = await api.get('/api/admin/chat?status=all'); } catch (er) { ticketsRes = null; } }
          const ticketsData = ticketsRes && ticketsRes.data ? (Array.isArray(ticketsRes.data) ? ticketsRes.data : (ticketsRes.data.tickets || ticketsRes.data.chats || [])) : [];

          // Transactions (best-effort)
          let txRes = null;
          try { txRes = await api.get('/api/transactions?limit=200'); } catch (e) { try { txRes = await api.get('/api/transactions/last'); } catch (er) { txRes = null; } }
          const txData = txRes && txRes.data ? (Array.isArray(txRes.data) ? txRes.data : (txRes.data.transactions || txRes.data || [])) : [];

          // Presubmissions
          let preRes = null;
          try { preRes = await api.get('/api/presubmissions'); } catch (e) { try { preRes = await api.get('/api/presubmissions/last'); } catch (er) { preRes = null; } }
          const preData = preRes && preRes.data ? (Array.isArray(preRes.data) ? preRes.data : (preRes.data.preSubmissions || preRes.data || [])) : [];

          if (!mounted) return;
          setUsers(usersData || []);
          setTickets(ticketsData || []);
          setTransactions(txData || []);
          setPresubmissions(preData || []);
          // derive counts from fallback data
          setPresubmissionsCount((preData || []).length);
          setTicketsCount((ticketsData || []).length);
          // derive withdrawalsByStatus from transactions fallback if server didn't provide it
          // derive withdrawalsByStatus from transactions fallback
          {
            const wCounts = {};
            const wTotal = (txData || []).reduce((acc, t) => {
              const type = (t.type || t.txType || t.transactionType || '').toString().toLowerCase();
              if (type !== 'withdrawal' && type !== 'withdraw') return acc;
              // possible status fields
              const st = (t.status || t.withdrawalStatus || t.state || t.statusInternal || 'unknown').toString().toLowerCase();
              const key = st || 'unknown';
              wCounts[key] = (wCounts[key] || 0) + 1;
              return acc + 1;
            }, 0);
            setWithdrawalsByStatus(wCounts);
            setWithdrawalsCount(wTotal);
          }
        }
      } catch (err) {
        console.error('AdminHome load error', err);
        if (mounted) setError(String(err?.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Fetch aggregated timeseries for users when granularity/span changes
  useEffect(() => {
    let mounted = true;
    const loadSeries = async () => {
      setTsLoading(true);
      setTsError(null);
      try {
        const cacheKey = `${resource}|${granularity}|${spanDays}`;
        if (tsCache.current[cacheKey]) {
          setTimeseriesSeries(tsCache.current[cacheKey]);
          setTsLoading(false);
          return;
        }
        // clear previous series while we fetch new resource (avoid showing stale data)
        setTimeseriesSeries([]);
        const res = await api.get('/api/admin/stats/timeseries', { params: { resource, granularity, span: spanDays } });
        if (!mounted) return;
        const series = (res && res.data && Array.isArray(res.data.series)) ? res.data.series : [];

        // normalize into a map for quick lookup
        const map = {};
        (series || []).forEach(s => { if (s && s.period) map[s.period] = s.count || 0; });

        // zero-fill missing periods depending on granularity
        const periods = [];
        const now = dayjs();
        if (granularity === 'daily') {
          for (let i = spanDays - 1; i >= 0; i--) {
            const d = now.subtract(i, 'day').format('YYYY-MM-DD');
            periods.push({ period: d, count: map[d] || 0 });
          }
        } else if (granularity === 'monthly') {
          const months = Math.ceil(spanDays / 30);
          for (let i = months - 1; i >= 0; i--) {
            const m = now.subtract(i, 'month').format('YYYY-MM');
            // server returns YYYY-MM, match keys
            periods.push({ period: m, count: map[m] || 0 });
          }
        } else if (granularity === 'weekly') {
          // server returns '%Y-%U' (year-weekNumber with Sunday as first day)
          // We'll construct week periods by computing the week number used by server and zero-fill based on week starts
          const totalWeeks = Math.ceil(spanDays / 7);
          for (let i = totalWeeks - 1; i >= 0; i--) {
            const weekStart = now.subtract(i * 7, 'day').startOf('week'); // Sunday
            // compute server-style period key '%Y-%U'
            const year = weekStart.year();
            // compute week number since first Sunday of year (U)
            const jan1 = dayjs(`${year}-01-01`);
            const jan1Dow = jan1.day(); // 0..6
            const diffDays = weekStart.startOf('day').diff(jan1.startOf('day'), 'day');
            const weekNum = Math.floor((diffDays + jan1Dow) / 7);
            const periodKey = `${year}-${String(weekNum).padStart(2, '0')}`;
            periods.push({ period: periodKey, count: map[periodKey] || 0, label: weekStart.format('YYYY-MM-DD') });
          }
        }

        setTimeseriesSeries(periods);
        tsCache.current[cacheKey] = periods;
      } catch (err) {
        console.error('timeseries load error', err);
        if (mounted) {
          setTsError(String(err?.message || err));
          setTimeseriesSeries([]);
        }
      } finally {
        if (mounted) setTsLoading(false);
      }
    };
    loadSeries();
    return () => { mounted = false; };
  }, [granularity, spanDays, resource]);

  // Derived metrics
  const totalUsers = users.length;
  const openTickets = tickets.filter(t => String(t.status || '').toLowerCase() === 'open').length;
  const pendingTickets = tickets.filter(t => String(t.status || '').toLowerCase() === 'pending').length;
  const resolvedTickets = tickets.filter(t => String(t.status || '').toLowerCase() === 'resolved').length;

  const localTxByType = transactions.reduce((acc, tx) => {
    const type = (tx.type || tx.txType || tx.transactionType || 'unknown').toString().toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // If server provided txByType, prefer that
  const effectiveTxByType = (serverTxByType && Object.keys(serverTxByType).length) ? serverTxByType : localTxByType;

  // compute transfers count/recentTransfers if server didn't provide
  const effectiveTransfersCount = transfersCount || transactions.filter(t => String((t.type || t.txType || t.transactionType) || '').toLowerCase() === 'transfer').length;
  const effectiveTradesCount = tradesCount || (effectiveTxByType && (effectiveTxByType.trade || effectiveTxByType.trades)) || transactions.filter(t => String((t.type || t.txType || t.transactionType) || '').toLowerCase() === 'trade').length;
  const effectiveWithdrawalsCount = withdrawalsCount || (effectiveTxByType && (effectiveTxByType.withdrawal || effectiveTxByType.withdrawals)) || transactions.filter(t => String((t.type || t.txType || t.transactionType) || '').toLowerCase() === 'withdrawal').length;
  const effectivePresubmissionsCount = presubmissionsCount || presubmissions.length;
  const effectiveTicketsCount = ticketsCount || tickets.length;

  // Prefer server-provided withdrawalsByStatus, otherwise derive from transactions
  const effectiveWithdrawalsByStatus = (withdrawalsByStatus && Object.keys(withdrawalsByStatus).length) ? withdrawalsByStatus : (() => {
    const out = {};
    (transactions || []).forEach(t => {
      const type = (t.type || t.txType || t.transactionType || '').toString().toLowerCase();
      if (type !== 'withdrawal' && type !== 'withdraw') return;
      const st = (t.status || t.withdrawalStatus || t.state || t.statusInternal || 'unknown').toString().toLowerCase();
      const key = st || 'unknown';
      out[key] = (out[key] || 0) + 1;
    });
    return out;
  })();

  // If withdrawalsCount not provided, compute from effectiveWithdrawalsByStatus
  // (removed unused derived variables: effectiveRecentTransfers, finalWithdrawalsCount)

  // Users over last 30 days
  const usersByDay = (() => {
    const counts = {};
    const days = 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      counts[d] = 0;
    }
    users.forEach(u => {
      const c = u.createdAt || u.created_at || u.created || u.createdAtString || u.createdAtISO || null;
      const day = c ? dayjs(c).format('YYYY-MM-DD') : null;
      if (day && counts[day] !== undefined) counts[day] += 1;
    });
    return Object.keys(counts).map(k => ({ date: k, count: counts[k] }));
  })();

  // prefer server timeseries when available
  const resourceLabel = (() => {
    switch ((resource || '').toString().toLowerCase()) {
      case 'users': return 'New users';
      case 'transactions': return 'Transactions';
      case 'confirmations': return 'Confirmations';
      case 'presubmissions': return 'Presubmissions';
      default: return String(resource || 'Series');
    }
  })();

  const userLineData = (() => {
    if (timeseriesSeries && timeseriesSeries.length) {
      return {
        labels: timeseriesSeries.map(p => p.label || p.period),
        datasets: [{ label: resourceLabel, data: timeseriesSeries.map(p => p.count || 0), fill: true, backgroundColor: 'rgba(54,162,235,0.15)', borderColor: 'rgba(54,162,235,1)' }]
      };
    }
    return {
      labels: usersByDay.map(d => d.date),
      datasets: [ { label: resourceLabel, data: usersByDay.map(d => d.count), fill: true, backgroundColor: 'rgba(54,162,235,0.15)', borderColor: 'rgba(54,162,235,1)' } ]
    };
  })();

  // preferred display order for status lists
  const statusDisplayOrder = ['pending', 'funding', 'processing', 'approved', 'rejected', 'completed', 'unknown'];

  const orderedConfirmationEntries = (() => {
    const src = confirmationsByStatus || {};
    const ordered = [];
    const seen = new Set();
    statusDisplayOrder.forEach(k => {
      if (src[k] !== undefined) { ordered.push([k, src[k]]); seen.add(k); }
    });
    // append any other keys not in preferred order
    Object.keys(src).forEach(k => { if (!seen.has(k)) ordered.push([k, src[k]]); });
    return ordered;
  })();

  const orderedWithdrawalEntries = (() => {
    const src = effectiveWithdrawalsByStatus || {};
    const ordered = [];
    const seen = new Set();
    statusDisplayOrder.forEach(k => {
      if (src[k] !== undefined) { ordered.push([k, src[k]]); seen.add(k); }
    });
    Object.keys(src).forEach(k => { if (!seen.has(k)) ordered.push([k, src[k]]); });
    return ordered;
  })();

  const ticketBarData = {
    labels: ['Open', 'Pending', 'Resolved'],
    datasets: [
      {
        label: 'Tickets',
        data: [openTickets, pendingTickets, resolvedTickets],
        backgroundColor: ['#ff9800', '#f39c12', '#2e7d32']
      }
    ]
  };

  const txDoughnutData = {
    labels: Object.keys(effectiveTxByType).length ? Object.keys(effectiveTxByType) : ['none'],
    datasets: [{ data: Object.keys(effectiveTxByType).length ? Object.values(effectiveTxByType) : [1], backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'] }]
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Admin Dashboard</h2>
      {loading && <div>Loading dashboard...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {!loading && !error && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 12 }}>
            <div style={cardStyle}>
              <div style={cardLabel}>Trades</div>
              <div style={cardValue}>{effectiveTradesCount}</div>
              <div style={cardHint}>Includes confirmations counted as trades</div>
            </div>
            <div style={cardStyle}>
              <div style={cardLabel}>Withdrawals</div>
              <div style={cardValue}>{effectiveWithdrawalsCount}</div>
              <div style={cardHint}>Processed withdrawals</div>
            </div>
            <div style={cardStyle}>
              <div style={cardLabel}>Transfers</div>
              <div style={cardValue}>{effectiveTransfersCount}</div>
              <div style={cardHint}>On-chain / off-chain transfers</div>
            </div>
            <div style={cardStyle}>
              <div style={cardLabel}>Presubmissions</div>
              <div style={cardValue}>{effectivePresubmissionsCount}</div>
              <div style={cardHint}>Recent presubmissions</div>
            </div>
            <div style={cardStyle}>
              <div style={cardLabel}>Tickets</div>
              <div style={cardValue}>{effectiveTicketsCount}</div>
              <div style={cardHint}>Support tickets</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={cardStyle}>
              <div style={cardLabel}>Total users</div>
              <div style={cardValue}>{totalUsers}</div>
              <div style={cardHint}>Recent signups (30 days)</div>
            </div>
            <div style={cardStyle}>
              <div style={cardLabel}>Open tickets</div>
              <div style={cardValue}>{openTickets}</div>
              <div style={cardHint}>Pending: {pendingTickets} • Resolved: {resolvedTickets}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>{String(resource).charAt(0).toUpperCase() + String(resource).slice(1)}</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: 13, color: '#666' }}>Resource:</label>
                  <select value={resource} onChange={e => setResource(e.target.value)} style={{ padding: '4px 8px' }}>
                    <option value="users">Users</option>
                    <option value="transactions">Transactions</option>
                    <option value="confirmations">Confirmations</option>
                    <option value="presubmissions">Presubmissions</option>
                  </select>
                  <label style={{ fontSize: 13, color: '#666' }}>Granularity:</label>
                  <select value={granularity} onChange={e => setGranularity(e.target.value)} style={{ padding: '4px 8px' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <label style={{ fontSize: 13, color: '#666' }}>Span:</label>
                  <select value={spanDays} onChange={e => setSpanDays(Number(e.target.value))} style={{ padding: '4px 8px' }}>
                    <option value={30}>30d</option>
                    <option value={90}>90d (3m)</option>
                    <option value={180}>180d (6m)</option>
                    <option value={365}>365d (1y)</option>
                  </select>
                  {tsLoading ? <span style={{ fontSize: 13, color: '#666' }}>Loading...</span> : null}
                  {tsError ? <span style={{ fontSize: 13, color: '#c00', marginLeft: 8 }}>Error: {tsError}</span> : null}
                </div>
              </div>
              <Line data={userLineData} />
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
                  <h4>Tickets status</h4>
                  <Bar data={ticketBarData} />
                </div>
                <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
                  <h4>Transactions by type</h4>
                  <Doughnut data={txDoughnutData} />
                </div>
                <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
                  <h4>Confirmations</h4>
                  <div style={{ marginBottom: 8 }}>Total confirmations: <strong>{confirmationsCount}</strong></div>
                  {orderedConfirmationEntries.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#666' }}>No confirmation status data</div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {orderedConfirmationEntries.map(([k, v]) => (
                        <li key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed #eee' }}>
                          <span style={{ textTransform: 'capitalize' }}>{k}</span>
                          <span style={{ fontWeight: 700 }}>{v}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
                      <h4>Withdrawals</h4>
                      <div style={{ marginBottom: 8 }}>Total withdrawals: <strong>{effectiveWithdrawalsCount}</strong></div>
                      {orderedWithdrawalEntries.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#666' }}>No withdrawal status data</div>
                      ) : (
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {orderedWithdrawalEntries.map(([k, v]) => (
                            <li key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed #eee' }}>
                              <span style={{ textTransform: 'capitalize' }}>{k}</span>
                              <span style={{ fontWeight: 700 }}>{v}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <h4>Recent Transactions</h4>
              {transactions.length === 0 ? <div>No transactions</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><th>ID</th><th>Type</th><th>Amount</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((t, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                        <td>{t.transactionId || t.id || t._id || '-'}</td>
                        <td>{t.type || t.txType || '-'}</td>
                        <td>{t.amount ?? t.value ?? '-'}</td>
                        <td>{t.createdAt ? dayjs(t.createdAt).format('YYYY-MM-DD HH:mm') : (t.date ? dayjs(t.date).format('YYYY-MM-DD HH:mm') : '-')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <h4>Recent Tickets</h4>
              {tickets.length === 0 ? <div>No tickets</div> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {tickets.slice(0, 8).map((t, i) => (
                    <li key={i} style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
                      <div style={{ fontWeight: 600 }}>{t.subject || t.userQuery || (t.message && String(t.message).slice(0, 80)) || String(t.ticketId || t._id || t.id || '').slice(-12)}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{String(t.status || 'open').toUpperCase()} • {t.createdAt ? dayjs(t.createdAt).fromNow() : (t.timestamp ? dayjs(t.timestamp).fromNow() : '')}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const cardStyle = { background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 1px 4px rgba(16,24,40,0.04)' };
const cardLabel = { fontSize: 13, color: '#666' };
const cardValue = { fontSize: 28, fontWeight: 700, marginTop: 6 };
const cardHint = { fontSize: 12, color: '#888', marginTop: 6 };

export default AdminHome;
