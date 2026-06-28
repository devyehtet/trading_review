'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import LogoIcon from '../../../components/ui/LogoIcon';

const ADMIN_EMAIL    = 'admin@nexoracapi.com';
const ADMIN_PASSWORD = 'Admin@2024';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        router.push('/admin/adminpanel');
      } else {
        setError('Invalid credentials. Check the demo credentials below.');
        setLoading(false);
      }
    }, 800);
  }

  return (
    <div className="admin-login-wrap">
      {/* Card */}
      <div className="admin-login-card">

        {/* Logo + brand */}
        <div className="admin-login-brand">
          <LogoIcon size={52} />
          <div>
            <b className="brand-wordmark" style={{ fontSize: 22 }}>
              <span className="brand-nexora">nexora</span>
              <span className="brand-capi">capi</span>
            </b>
            <span className="admin-login-sub">Admin Portal</span>
          </div>
        </div>

        <h2 className="admin-login-title">Sign in to Admin</h2>
        <p className="admin-login-desc">Authorised personnel only. All activity is monitored and logged.</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nexoracapi.com"
              required
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="admin-login-error">⚠️ {error}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="admin-demo-creds">
          <span className="demo-creds-label">Demo credentials</span>
          <div className="demo-cred-row">
            <span>Email</span>
            <code onClick={() => setEmail(ADMIN_EMAIL)}>{ADMIN_EMAIL}</code>
          </div>
          <div className="demo-cred-row">
            <span>Password</span>
            <code onClick={() => setPassword(ADMIN_PASSWORD)}>{ADMIN_PASSWORD}</code>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Tap to auto-fill
          </p>
        </div>

        {/* Back to app */}
        <a href="/" className="admin-back-link">← Back to App</a>
      </div>
    </div>
  );
}
