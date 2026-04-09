import { useState } from 'react';
import { api } from '../api';

const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

export default function Submit() {
  const [form, setForm] = useState({ title: '', category: '', description: '', contactEmail: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const submission = await api.createSubmission(form);
      setResult(submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="page" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '560px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✓</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Request submitted</h2>
          <p className="text-secondary mb-24">Save your tracking ID to check on progress.</p>
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '18px 24px',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Tracking ID</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--color-accent)' }}>
              {result.trackingId}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`/track/${result.trackingId}`} className="btn btn-primary">Track this request</a>
            <button className="btn btn-secondary" onClick={() => setResult(null)}>Submit another</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ paddingTop: '64px', paddingBottom: '80px', maxWidth: '560px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '8px' }}>Submit a request</h1>
      <p className="text-secondary mb-40">Your MP's team will review and respond to your submission.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title" name="title" type="text"
            placeholder="Brief summary of your request"
            value={form.title} onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description" name="description"
            placeholder="Describe your request in detail"
            value={form.description} onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Contact email <span className="text-secondary" style={{ fontWeight: 400 }}>(optional)</span></label>
          <input
            id="contactEmail" name="contactEmail" type="email"
            placeholder="you@example.com"
            value={form.contactEmail} onChange={handleChange}
          />
          <span className="form-hint">We'll only use this to follow up on your request.</span>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {loading ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </main>
  );
}
