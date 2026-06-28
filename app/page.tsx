'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LogoIcon from '../components/ui/LogoIcon';
import type { View, AppPhase, UserCtx } from '../lib/types';
import { addLoginActivity, addKycEvent } from '../lib/store';

/* ── Lazy-loaded views ─────────────────────────── */
function ViewLoader() { return <div className="view-loader">Loading…</div>; }

const Home       = dynamic(() => import('../components/views/Home'),       { loading: () => <ViewLoader /> });
const Plans      = dynamic(() => import('../components/views/Plans'),      { loading: () => <ViewLoader /> });
const Dashboard  = dynamic(() => import('../components/views/Dashboard'),  { loading: () => <ViewLoader /> });
const Markets    = dynamic(() => import('../components/views/Markets'),    { loading: () => <ViewLoader /> });
const Wallet     = dynamic(() => import('../components/views/Wallet'),     { loading: () => <ViewLoader /> });
const Admin      = dynamic(() => import('../components/views/Admin'),      { loading: () => <ViewLoader /> });
const Auth       = dynamic(() => import('../components/views/Auth'),       { loading: () => <ViewLoader /> });
const OtpVerify  = dynamic(() => import('../components/views/OtpVerify'),  { loading: () => <ViewLoader /> });
const KycFlow    = dynamic(() => import('../components/views/KycFlow'),    { loading: () => <ViewLoader /> });
const KycPending      = dynamic(() => import('../components/views/KycPending'),      { loading: () => <ViewLoader /> });
const GoldInvestment  = dynamic(() => import('../components/views/GoldInvestment'),  { loading: () => <ViewLoader /> });

const NAV_VIEWS: View[] = ['home', 'plans', 'markets', 'wallet', 'gold', 'dashboard'];

const NAV_ICONS: Partial<Record<View, string>> = {
  home:      '🏠',
  plans:     '📈',
  markets:   '📊',
  wallet:    '💼',
  gold:      '🪙',
  dashboard: '⚡',
};

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>('auth');
  const [user,  setUser]  = useState<UserCtx>({ name: '', email: '', phone: '', mode: 'login' });
  const [view,  setView]  = useState<View>('home');
  const [toast, setToast] = useState('');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  /* ── Auth callbacks ──────────────────────────── */
  function handleLoginSuccess(u: UserCtx) {
    setUser(u);
    setPhase('otp');
  }

  function handleRegisterSuccess(u: UserCtx) {
    setUser(u);
    setPhase('otp');
  }

  /* ── OTP callbacks ───────────────────────────── */
  async function handleOtpVerified() {
    if (user.mode === 'login') {
      await addLoginActivity(user.name || user.email);
      notify(`Welcome back, ${user.name || user.email}!`);
      setPhase('app');
    } else {
      setPhase('kyc');
    }
  }

  /* ── KYC callbacks ───────────────────────────── */
  async function handleKycCompleted() {
    try {
      await addKycEvent(user.name, user.email, 'Myanmar');
      setPhase('kyc_pending');
    } catch (e) {
      notify(`⚠️ ${e instanceof Error ? e.message : 'Submission failed — check connection'}`);
    }
  }

  function handleKycApproved() {
    notify(`Account verified! Welcome, ${user.name}!`);
    setPhase('app');
  }

  /* ── Render helper: phase-gated screens ─────── */
  function renderPhase() {
    if (phase === 'auth') {
      return (
        <Auth
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }

    if (phase === 'otp') {
      return (
        <OtpVerify
          user={user}
          onVerified={handleOtpVerified}
          onBack={() => setPhase('auth')}
        />
      );
    }

    if (phase === 'kyc') {
      return (
        <KycFlow
          user={user}
          onCompleted={handleKycCompleted}
          onBack={() => setPhase('auth')}
        />
      );
    }

    if (phase === 'kyc_pending') {
      return (
        <KycPending
          name={user.name}
          email={user.email}
          onApprove={handleKycApproved}
          onRejected={() => {
            setPhase('auth');
            setUser({ name: '', email: '', phone: '', mode: 'login' });
          }}
        />
      );
    }

    // phase === 'app' — full authenticated app
    return (
      <>
        {view === 'home'      && <Home            notify={notify} setView={setView} />}
        {view === 'plans'     && <Plans           notify={notify} setView={setView} />}
        {view === 'dashboard' && <Dashboard />}
        {view === 'markets'   && <Markets   />}
        {view === 'wallet'    && <Wallet          notify={notify} userName={user.name} userEmail={user.email} />}
        {view === 'admin'     && <Admin           notify={notify} />}
        {view === 'gold'      && <GoldInvestment  notify={notify} />}
      </>
    );
  }

  const isApp = phase === 'app';
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main className="wrap">
      <section className="phone">
        {/* Status bar */}
        <div className="status">
          <b>9:41</b>
          <span>●●● 5G 🔋</span>
        </div>

        {/* Header */}
        <header className="header">
          <div className="brand">
            <div className="logo">
              <LogoIcon size={40} />
            </div>
            <div>
              <b className="brand-wordmark">
                <span className="brand-nexora">nexora</span>
                <span className="brand-capi">capi</span>
              </b>
              <small>Connect · Automate · Grow</small>
            </div>
          </div>

          {isApp ? (
            /* Logged-in: avatar → profile menu */
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="icon"
                onClick={() => setProfileOpen(o => !o)}
              >
                👤
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  {/* User info */}
                  <div className="profile-menu-user">
                    <div className="profile-menu-avatar">
                      {(user.name || user.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{user.name || 'User'}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>

                  <div className="profile-menu-divider" />

                  {/* Admin Panel */}
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => { setView('admin'); setProfileOpen(false); }}
                  >
                    <span>⚙️</span> Admin Panel
                  </button>

                  {/* Dashboard */}
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => { setView('dashboard'); setProfileOpen(false); }}
                  >
                    <span>📊</span> Dashboard
                  </button>

                  <div className="profile-menu-divider" />

                  {/* Sign out */}
                  <button
                    type="button"
                    className="profile-menu-item danger"
                    onClick={() => {
                      setPhase('auth');
                      setUser({ name: '', email: '', phone: '', mode: 'login' });
                      setView('home');
                      setProfileOpen(false);
                    }}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in: phase indicator chip */
            <div className="phase-chip">
              {phase === 'auth'        && '🔒 Login'}
              {phase === 'otp'         && '📨 OTP'}
              {phase === 'kyc'         && '🪪 KYC'}
              {phase === 'kyc_pending' && '⏳ Review'}
            </div>
          )}
        </header>

        {/* Profile menu backdrop */}
        {profileOpen && (
          <div className="profile-backdrop" onClick={() => setProfileOpen(false)} />
        )}

        {/* Main content */}
        <div className="content">
          {renderPhase()}
        </div>

        {/* FAB — only in app */}
        {isApp && (
          <button
            type="button"
            className="fab"
            onClick={() => notify('Quick action: Deposit / Withdraw / Invest')}
          >
            ＋
          </button>
        )}

        {/* Bottom nav — only in app */}
        {isApp && (
          <nav className="nav">
            {NAV_VIEWS.map((x) => (
              <button
                type="button"
                key={x}
                onClick={() => setView(x)}
                className={view === x ? 'on' : ''}
              >
                <span className="nav-icon">{NAV_ICONS[x]}</span>
                <span className="nav-label">{x}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Toast */}
        {toast && (
          <div className="toast" role="status" aria-live="polite">{toast}</div>
        )}
      </section>
    </main>
  );
}
