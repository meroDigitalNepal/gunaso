import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, categoryFilter]);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const data = await api.listSubmissions(params);
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectStyle = {
    padding: '8px 12px', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem', background: '#fff', cursor: 'pointer', outline: 'none',
  };

  return (
    <main className="page" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p className="text-secondary text-sm mt-8">Manage and respond to citizen submissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select style={selectStyle} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="text-secondary">Loading…</p>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: '64px' }}>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>No submissions found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{s.trackingId}</td>
                  <td style={{ fontWeight: 500 }}>{s.title}</td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{s.category}</td>
                  <td><span className={`badge badge-${s.status}`}>{s.status.replace('_', ' ')}</span></td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td><Link to={`/dashboard/${s.id}`} style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
