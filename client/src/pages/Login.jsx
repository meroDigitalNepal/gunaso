import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  async function handleLogin() {
    setError(null);
    try {
      await login();
    } catch (err) {
      if (err?.errorCode !== 'user_cancelled') {
        setError(err?.message || 'Sign-in failed. Please try again.');
      }
    }
  }

  return (
    <main className="page" style={{ paddingTop: '80px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Admin Login</h1>
      <p className="text-secondary" style={{ marginBottom: '32px' }}>
        Sign in with your organisation account to access the dashboard.
      </p>
      {error && <div className="alert alert-error" style={{ marginBottom: '24px', textAlign: 'left' }}>{error}</div>}
      <button className="btn btn-primary" onClick={handleLogin}>
        Sign in with Microsoft
      </button>
    </main>
  );
}
