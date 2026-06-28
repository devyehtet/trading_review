'use client';

import { useState, type FormEvent } from 'react';
import LogoIcon from '../ui/LogoIcon';
import type { UserCtx } from '../../lib/types';

interface AuthProps {
  onLoginSuccess:    (user: UserCtx) => void;
  onRegisterSuccess: (user: UserCtx) => void;
}

type AuthMode = 'login' | 'register';

export default function Auth({ onLoginSuccess, onRegisterSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');

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
      {/* Brand splash */}
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

      {/* Mode toggle */}
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

      {/* Form */}
      <form className="form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input name="fullName" placeholder="Full name" required />
        )}
        <input name="email" type="email" placeholder="Email address" required />
        {mode === 'register' && (
          <input name="phone" placeholder="Phone / Telegram" />
        )}
        <input name="password" type="password" placeholder="Password" required />
        {mode === 'register' && (
          <input name="confirmPassword" type="password" placeholder="Confirm password" required />
        )}
        <button type="submit">
          {mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>
      </form>
    </>
  );
}
