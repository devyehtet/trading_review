'use client';

import { useState, type FormEvent, type MouseEvent } from 'react';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
import LogoIcon from '../ui/LogoIcon';
import type { UserCtx } from '../../lib/types';

interface AuthProps {
  onLoginSuccess:    (user: UserCtx) => void;
  onRegisterSuccess: (user: UserCtx) => void;
}

type AuthMode = 'login' | 'register';

export default function Auth({ onLoginSuccess, onRegisterSuccess }: AuthProps) {
  const [mode,    setMode]    = useState<AuthMode>('login');
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const user: UserCtx = {
      name:  (fd.get('fullName')  as string) ?? 'User',
      email: (fd.get('email')     as string) ?? '',
      phone: (fd.get('phone')     as string) ?? '',
      mode,
    };
    if (mode === 'login') {
      onLoginSuccess(user);
    } else {
      onRegisterSuccess(user);
    }
  }

  return (
    <>
      <div className="auth">
        <div className="biglogo">
          <LogoIcon size={72} />
        </div>
        <div className="auth-brand">
          <b className="brand-wordmark">
            <span className="brand-nexora">nexora</span>
            <span className="brand-capi">capi</span>
          </b>
        </div>
        <p className="brand-tagline">CONNECT · AUTOMATE · GROW</p>

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>
          {mode === 'login'
            ? 'Sign in to your account'
            : 'Create your account and complete KYC before investing'}
        </p>
      </div>

      <div className="switch">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input name="fullName" placeholder="Full name" required />
        )}
        <input name="email" type="email" placeholder="Email address" required />
        {mode === 'register' && (
          <input name="phone" placeholder="Phone / Telegram" />
        )}
        <div className="pw-field">
          <input name="password" type={showPw ? 'text' : 'password'} placeholder="Password" required />
          <button
            type="button"
            className="pw-toggle"
            onClick={(e: MouseEvent) => { e.preventDefault(); setShowPw(v => !v); }}
            tabIndex={-1}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
        {mode === 'register' && (
          <div className="pw-field">
            <input name="confirmPassword" type={showCpw ? 'text' : 'password'} placeholder="Confirm password" required />
            <button
              type="button"
              className="pw-toggle"
              onClick={(e: MouseEvent) => { e.preventDefault(); setShowCpw(v => !v); }}
              tabIndex={-1}
            >
              <EyeIcon open={showCpw} />
            </button>
          </div>
        )}
        <button type="submit">
          {mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>
      </form>
    </>
  );
}
