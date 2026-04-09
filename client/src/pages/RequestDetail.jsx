import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_LABELS = {
  infrastructure: 'Infrastructure', health: 'Health',
  education: 'Education', security: 'Security', other: 'Other',
};

export default function RequestDetail() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [status, setStatus] = useState('');
  const [publicResponse, setPublicResponse] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  async function fetchSubmission() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmission(id);
      setSubmission(data);
      setStatus(data.status);
      setPublicResponse(data.publicResponse || '');
      setInternalNotes(data.internalNotes || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const updated = await api.updateSubmission(id, { status, publicResponse, internalNotes });
      setSubmission(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', padding: '10px 14px',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
    width: '100%', outline: 'none', background: '#fff',
  };

  if (loading) return <main className="page" style={{ paddingTop: '64px' }}><p className="text-secondary">Loading…</p></main>;
  if (error && !submission) return (
    <main className="page" style={{ paddingTop: '64px' }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/dashboard" className="btn btn-secondary mt-16">← Back to dashboard</Link>
    </main>
  );
  if (!submission) return null;

  return (
    <main className="page" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: '720px' }}>
      <Link to="/dashboard" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '28px' }}>
        ← Dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '6px', fontFamily: 'monospace' }}>{submission.trackingId}</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.3px' }}>{submission.title}</h1>
          <p className="text-secondary text-sm mt-8">{CATEGORY_LABELS[submission.category]} · Submitted {new Date(submission.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="card mb-24">
        <h2 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Description</h2>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7 }}>{submission.description}</p>
        {submission.contactEmail && (
          <p style={{ marginTop: '14px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Contact: <a href={`mailto:${submission.contactEmail}`}>{submission.contactEmail}</a>
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        {saveSuccess && <div className="alert alert-success">Changes saved successfully.</div>}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
            Public response <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>(visible to citizen)</span>
          </label>
          <textarea
            value={publicResponse}
            onChange={e => setPublicResponse(e.target.value)}
            placeholder="Write a response that the citizen will see on the tracking page…"
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
            Internal notes <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>(not visible to citizen)</span>
          </label>
          <textarea
            value={internalNotes}
            onChange={e => setInternalNotes(e.target.value)}
            placeholder="Add internal notes for your team…"
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start', minWidth: '120px' }}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </main>
  );
}
