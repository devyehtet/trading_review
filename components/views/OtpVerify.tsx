'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import LogoIcon from '../ui/LogoIcon';
import type { UserCtx } from '../../lib/types';

interface OtpVerifyProps {
  user:       UserCtx;
  onVerified: () => void;
  onBack:     () => void;
}

const OTP_LENGTH = 6;
const RESEND_SEC = 60;

export default function OtpVerify({ user, onVerified, onBack }: OtpVerifyProps) {
  const [digits,     setDigits]     = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error,      setError]      = useState('');
  const [timer,      setTimer]      = useState(RESEND_SEC);
  const [sending,    setSending]    = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const [sent,       setSent]       = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Send OTP on mount */
  useEffect(() => {
    sendOtp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Countdown */
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  async function sendOtp() {
    setSending(true);
    setSent(false);
    setError('');
    try {
      const res = await fetch('/api/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: user.email, name: user.name }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to send OTP');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error — could not send OTP');
    } finally {
      setSending(false);
    }
  }

  function handleChange(index: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[index] = val.slice(-1);
    setDigits(next);
    setError('');
    if (val && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) { setError('Please enter the 6-digit code.'); return; }

    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: user.email, code }),
      });
      if (res.ok) {
        onVerified();
      } else {
        const data = await res.json() as { error?: string };
        const msg = data.error === 'OTP expired'
          ? 'Code expired — request a new one.'
          : data.error === 'Invalid OTP'
          ? 'Incorrect code. Please try again.'
          : (data.error ?? 'Verification failed');
        setError(msg);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setVerifying(false);
    }
  }

  function handleResend() {
    setTimer(RESEND_SEC);
    setDigits(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    sendOtp();
  }

  const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <div className="kyc-wrap">
      {/* Header */}
      <div className="auth" style={{ paddingBottom: 0 }}>
        <div className="biglogo" style={{ width: 60, height: 60, margin: '0 auto 10px' }}>
          <LogoIcon size={52} />
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900 }}>Verify Your Email</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
          {sending
            ? 'Sending verification code…'
            : sent
            ? <>Code sent to <strong style={{ color: 'var(--text-muted)' }}>{maskedEmail}</strong></>
            : <>Enter the code sent to <strong style={{ color: 'var(--text-muted)' }}>{maskedEmail}</strong></>
          }
        </p>
      </div>

      {/* OTP inputs */}
      <div className="otp-inputs">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`otp-cell${d ? ' filled' : ''}${error ? ' error' : ''}`}
            aria-label={`Digit ${i + 1}`}
            disabled={sending || verifying}
          />
        ))}
      </div>

      {error && <p className="kyc-error">{error}</p>}

      {/* Resend */}
      <p className="otp-resend">
        {timer > 0
          ? <>Resend code in <strong>{timer}s</strong></>
          : <button type="button" className="link-btn" onClick={handleResend} disabled={sending}>
              {sending ? 'Sending…' : 'Resend Code'}
            </button>
        }
      </p>

      {/* Actions */}
      <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
        <button
          type="button"
          className="btn-next"
          onClick={handleVerify}
          disabled={verifying || sending || digits.join('').length < OTP_LENGTH}
        >
          {verifying ? 'Verifying…' : 'Verify →'}
        </button>
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
