import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="page" style={{ paddingTop: '120px', paddingBottom: '120px', textAlign: 'center' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-accent)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
        Civic Feedback Platform
      </p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '20px' }}>
        Your voice,<br />delivered to your MP.
      </h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 40px' }}>
        Submit questions and complaints to your local MP's team. Track progress. Get answers.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/submit" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
          Submit a request
        </Link>
        <Link to="/track" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
          Track my request
        </Link>
      </div>
    </main>
  );
}
