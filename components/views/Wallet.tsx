'use client';

import { useState, type ChangeEvent } from 'react';
import { transactions, portfolio, walletAssets } from '../../lib/appData';
import { addDeposit } from '../../lib/store';
import Title from '../ui/Title';

interface WalletProps {
  notify:    (msg: string) => void;
  userName?: string;
  userEmail?: string;
}

const STATUS_COLOR: Record<string, string> = {
  Approved:   'green',
  Pending:    'gold',
  Processing: 'gold',
  Failed:     'red',
};

/* ── Payment methods ───────────────────────────── */
const CRYPTO_METHODS = [
  {
    id: 'usdt_trc20', label: 'USDT', network: 'TRC-20', icon: '💵',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    min: 10, fee: 1, color: '#26a17b',
  },
  {
    id: 'usdt_erc20', label: 'USDT', network: 'ERC-20', icon: '💵',
    address: '0x4e9ce36e442e55ecd9025b759b94a430e4a3c2e1',
    min: 50, fee: 5, color: '#627eea',
  },
  {
    id: 'btc', label: 'Bitcoin', network: 'BTC', icon: '₿',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    min: 20, fee: 2, color: '#f7931a',
  },
  {
    id: 'eth', label: 'Ethereum', network: 'ETH', icon: '⟠',
    address: '0x4e9ce36e442e55ecd9025b759b94a430e4a3c2e1',
    min: 30, fee: 3, color: '#627eea',
  },
];

const BANK_METHODS = [
  {
    id: 'kbz', label: 'KBZ Bank', icon: '🏦',
    bankName: 'Kanbawza Bank (KBZ)',
    accountNumber: '0987654321098765',
    accountName: 'NexoraCapi Myanmar Ltd',
    reference: 'NC-DEPOSIT',
    min: 50000, fee: 0, currency: 'MMK',
  },
  {
    id: 'aya', label: 'AYA Bank', icon: '🏦',
    bankName: 'Ayeyarwady Bank (AYA)',
    accountNumber: '2001234567890',
    accountName: 'NexoraCapi Myanmar Ltd',
    reference: 'NC-DEPOSIT',
    min: 50000, fee: 0, currency: 'MMK',
  },
  {
    id: 'wave', label: 'Wave Money', icon: '📱',
    bankName: 'Wave Money',
    accountNumber: '09123456789',
    accountName: 'NexoraCapi',
    reference: 'NC-DEP',
    min: 10000, fee: 0, currency: 'MMK',
  },
];

type ModalType = 'deposit' | 'withdraw' | null;
type MethodType = 'crypto' | 'bank';

function copyToClipboard(text: string, notify: (msg: string) => void) {
  navigator.clipboard.writeText(text).then(() => notify('✓ Copied to clipboard!')).catch(() => {
    /* fallback */
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    notify('✓ Copied!');
  });
}

/* ── Deposit Modal ───────────────────────────────── */
function DepositModal({ notify, userName, userEmail, onClose }: {
  notify: (msg: string) => void;
  userName: string; userEmail: string;
  onClose: () => void;
}) {
  const [step,       setStep]       = useState<1 | 2 | 3>(1);
  const [methodType, setMethodType] = useState<MethodType>('crypto');
  const [cryptoIdx,  setCryptoIdx]  = useState(0);
  const [bankIdx,    setBankIdx]    = useState(0);
  const [amount,     setAmount]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const crypto   = CRYPTO_METHODS[cryptoIdx];
  const bank     = BANK_METHODS[bankIdx];
  const amountNum = parseFloat(amount) || 0;
  const minAmount = methodType === 'crypto' ? crypto.min : 10;
  const isValid   = amountNum >= minAmount;
  const fee       = methodType === 'crypto' ? crypto.fee : 0;
  const net       = amountNum - fee;

  const methodLabel = methodType === 'crypto'
    ? `${crypto.label} (${crypto.network})`
    : bank.label;

  async function submit() {
    if (!isValid) return;
    setSubmitting(true);
    const entry = await addDeposit(userName, userEmail, 'Deposit', amountNum, methodLabel);
    notify(`✓ Deposit ${entry.amount} submitted — ${entry.id}`);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal wm-large" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="wallet-modal-header">
          <div>
            <h3 style={{ margin: 0 }}>↓ Deposit</h3>
            <div className="wm-steps">
              {['Method', 'Details', 'Confirm'].map((s, i) => (
                <span key={s} className={`wm-step${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                  {step > i + 1 ? '✓' : i + 1}. {s}
                </span>
              ))}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Step 1: Choose method type ── */}
        {step === 1 && (
          <div>
            <p className="wm-label">Select deposit method</p>
            <div className="wm-type-tabs">
              <button
                type="button"
                className={`wm-type-tab${methodType === 'crypto' ? ' active' : ''}`}
                onClick={() => setMethodType('crypto')}
              >
                🔐 Cryptocurrency
              </button>
              <button
                type="button"
                className={`wm-type-tab${methodType === 'bank' ? ' active' : ''}`}
                onClick={() => setMethodType('bank')}
              >
                🏦 Bank Transfer
              </button>
            </div>

            {methodType === 'crypto' && (
              <div className="wm-method-list">
                {CRYPTO_METHODS.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`wm-method-card${cryptoIdx === i ? ' selected' : ''}`}
                    onClick={() => setCryptoIdx(i)}
                  >
                    <span className="wm-method-icon" style={{ background: m.color + '22', color: m.color }}>
                      {m.icon}
                    </span>
                    <div className="wm-method-info">
                      <strong>{m.label}</strong>
                      <small>{m.network} · Min ${m.min}</small>
                    </div>
                    {cryptoIdx === i && <span className="wm-check">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {methodType === 'bank' && (
              <div className="wm-method-list">
                {BANK_METHODS.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`wm-method-card${bankIdx === i ? ' selected' : ''}`}
                    onClick={() => setBankIdx(i)}
                  >
                    <span className="wm-method-icon" style={{ background: 'rgba(16,217,160,0.1)', color: '#10d9a0' }}>
                      {m.icon}
                    </span>
                    <div className="wm-method-info">
                      <strong>{m.label}</strong>
                      <small>{m.currency} · Min {m.min.toLocaleString()} {m.currency}</small>
                    </div>
                    {bankIdx === i && <span className="wm-check">✓</span>}
                  </button>
                ))}
              </div>
            )}

            <button type="button" className="btn-next" style={{ width: '100%', marginTop: 16 }}
              onClick={() => setStep(2)}>
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: Address / Bank details ── */}
        {step === 2 && (
          <div>
            {methodType === 'crypto' ? (
              <>
                <div className="wm-address-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {crypto.label} ({crypto.network}) Wallet Address
                    </span>
                    <span style={{ fontSize: 11, color: crypto.color, fontWeight: 700, background: crypto.color + '22', padding: '2px 8px', borderRadius: 6 }}>
                      {crypto.network}
                    </span>
                  </div>
                  <div className="wm-address-text">{crypto.address}</div>
                  <button
                    type="button"
                    className="wm-copy-btn"
                    onClick={() => copyToClipboard(crypto.address, notify)}
                  >
                    📋 Copy Address
                  </button>
                </div>

                <div className="wm-info-grid">
                  <div className="wm-info-item">
                    <span>Network</span><strong>{crypto.network}</strong>
                  </div>
                  <div className="wm-info-item">
                    <span>Min Deposit</span><strong>${crypto.min}</strong>
                  </div>
                  <div className="wm-info-item">
                    <span>Network Fee</span><strong>${crypto.fee}</strong>
                  </div>
                  <div className="wm-info-item">
                    <span>Processing</span><strong>1–6 hours</strong>
                  </div>
                </div>

                <div className="wm-warning">
                  ⚠️ Send only <strong>{crypto.label} ({crypto.network})</strong> to this address. Sending other assets will result in permanent loss.
                </div>
              </>
            ) : (
              <>
                <div className="wm-bank-box">
                  {[
                    { label: 'Bank Name',      value: bank.bankName      },
                    { label: 'Account Number', value: bank.accountNumber },
                    { label: 'Account Name',   value: bank.accountName   },
                    { label: 'Reference',      value: bank.reference      },
                  ].map(r => (
                    <div key={r.label} className="wm-bank-row">
                      <span>{r.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong>{r.value}</strong>
                        <button
                          type="button"
                          className="wm-copy-inline"
                          onClick={() => copyToClipboard(r.value, notify)}
                        >📋</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="wm-warning">
                  ⚠️ Include your reference code <strong>{bank.reference}</strong> in the transfer remark. Processing takes 1–3 business days.
                </div>
              </>
            )}

            {/* Amount */}
            <div className="kyc-field" style={{ marginTop: 14 }}>
              <label className="kyc-label">Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span className="wallet-currency-prefix">$</span>
                <input
                  className="kyc-input" style={{ paddingLeft: 28 }}
                  type="number" min={minAmount} placeholder={`Min $${minAmount}`}
                  value={amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                />
              </div>
              {amount && !isValid && (
                <span className="kyc-field-error">Minimum is ${minAmount}</span>
              )}
            </div>
            <div className="gold-quick-row" style={{ marginBottom: 10 }}>
              {[100, 500, 1000, 5000].map(q => (
                <button key={q} type="button" className="quick-btn" onClick={() => setAmount(String(q))}>
                  ${q}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn-next" onClick={() => setStep(3)} disabled={!isValid}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
              <div style={{ fontSize: 40 }}>↓</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#10d9a0' }}>
                ${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Deposit via {methodLabel}</div>
            </div>

            <div className="wallet-summary">
              <div className="breakdown-row"><span>Amount</span><strong>${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
              <div className="breakdown-row"><span>Network Fee</span><strong style={{ color: fee > 0 ? '#ff6475' : '#10d9a0' }}>{fee > 0 ? `-$${fee}` : 'Free'}</strong></div>
              <div className="breakdown-row" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 4 }}>
                <span>You Receive</span>
                <strong style={{ color: '#10d9a0', fontSize: 16 }}>
                  ${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="breakdown-row"><span>Method</span><strong>{methodLabel}</strong></div>
              <div className="breakdown-row"><span>Status</span><strong style={{ color: '#ffd97a' }}>Pending Review</strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <button type="button" className="btn-back" onClick={() => setStep(2)}>← Back</button>
              <button
                type="button" className="btn-next"
                style={{ background: 'linear-gradient(135deg, #10d9a0, #0891b2)' }}
                onClick={submit} disabled={submitting}
              >
                {submitting ? 'Submitting…' : '✓ Confirm Deposit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Withdraw Modal ──────────────────────────────── */
function WithdrawModal({ notify, userName, userEmail, onClose }: {
  notify: (msg: string) => void;
  userName: string; userEmail: string;
  onClose: () => void;
}) {
  const [step,        setStep]        = useState<1 | 2 | 3>(1);
  const [methodType,  setMethodType]  = useState<MethodType>('crypto');
  const [network,     setNetwork]     = useState('USDT (TRC-20)');
  const [destination, setDestination] = useState('');
  const [bankName,    setBankName]    = useState('');
  const [accountNum,  setAccountNum]  = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount,      setAmount]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const amountNum  = parseFloat(amount) || 0;
  const fee        = methodType === 'crypto' ? 2 : 0;
  const net        = amountNum - fee;
  const minAmount  = methodType === 'crypto' ? 20 : 10;
  const isValidAmt = amountNum >= minAmount && net > 0;

  const cryptoNetworks = ['USDT (TRC-20)', 'USDT (ERC-20)', 'Bitcoin (BTC)', 'Ethereum (ETH)'];
  const bankOptions    = ['KBZ Bank', 'AYA Bank', 'CB Bank', 'KBZ Pay', 'Wave Money', 'Other'];

  const step2Valid = methodType === 'crypto'
    ? destination.length > 10
    : bankName && accountNum.length >= 8 && accountName;

  const methodLabel = methodType === 'crypto' ? network : bankName;

  async function submit() {
    if (!isValidAmt || !step2Valid) return;
    setSubmitting(true);
    const entry = await addDeposit(userName, userEmail, 'Withdrawal', amountNum, methodLabel);
    notify(`✓ Withdrawal ${entry.amount} submitted — ${entry.id}`);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal wm-large" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="wallet-modal-header">
          <div>
            <h3 style={{ margin: 0 }}>↑ Withdraw</h3>
            <div className="wm-steps">
              {['Method', 'Destination', 'Confirm'].map((s, i) => (
                <span key={s} className={`wm-step${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                  {step > i + 1 ? '✓' : i + 1}. {s}
                </span>
              ))}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Step 1: Method ── */}
        {step === 1 && (
          <div>
            <p className="wm-label">Select withdrawal method</p>
            <div className="wm-type-tabs">
              <button
                type="button"
                className={`wm-type-tab${methodType === 'crypto' ? ' active' : ''}`}
                onClick={() => setMethodType('crypto')}
              >🔐 Cryptocurrency</button>
              <button
                type="button"
                className={`wm-type-tab${methodType === 'bank' ? ' active' : ''}`}
                onClick={() => setMethodType('bank')}
              >🏦 Bank Transfer</button>
            </div>

            {methodType === 'crypto' && (
              <div className="wm-method-list">
                {cryptoNetworks.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`wm-method-card${network === n ? ' selected' : ''}`}
                    onClick={() => setNetwork(n)}
                  >
                    <span className="wm-method-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {n.includes('USDT') ? '💵' : n.includes('BTC') ? '₿' : '⟠'}
                    </span>
                    <div className="wm-method-info">
                      <strong>{n}</strong>
                      <small>Fee: $2 · Min $20</small>
                    </div>
                    {network === n && <span className="wm-check">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {methodType === 'bank' && (
              <div className="wm-method-list">
                {bankOptions.map(b => (
                  <button
                    key={b}
                    type="button"
                    className={`wm-method-card${bankName === b ? ' selected' : ''}`}
                    onClick={() => setBankName(b)}
                  >
                    <span className="wm-method-icon" style={{ background: 'rgba(16,217,160,0.1)', color: '#10d9a0' }}>🏦</span>
                    <div className="wm-method-info">
                      <strong>{b}</strong>
                      <small>MMK · Min $10 · 1–3 days</small>
                    </div>
                    {bankName === b && <span className="wm-check">✓</span>}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button" className="btn-next" style={{ width: '100%', marginTop: 16 }}
              onClick={() => setStep(2)}
              disabled={methodType === 'bank' && !bankName}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: Destination ── */}
        {step === 2 && (
          <div>
            {methodType === 'crypto' ? (
              <>
                <div className="kyc-field">
                  <label className="kyc-label">Network</label>
                  <select
                    className="kyc-input"
                    value={network}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setNetwork(e.target.value)}
                  >
                    {cryptoNetworks.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="kyc-field">
                  <label className="kyc-label">Destination Wallet Address</label>
                  <input
                    className={`kyc-input${destination && destination.length < 10 ? ' invalid' : ''}`}
                    type="text"
                    placeholder="Paste wallet address here…"
                    value={destination}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDestination(e.target.value)}
                  />
                  {destination && destination.length < 10 && (
                    <span className="kyc-field-error">Enter a valid wallet address</span>
                  )}
                </div>
                <div className="wm-warning">
                  ⚠️ Double-check the address. Transfers to wrong addresses cannot be reversed.
                </div>
              </>
            ) : (
              <>
                <div className="kyc-field">
                  <label className="kyc-label">Bank Name</label>
                  <select
                    className="kyc-input"
                    value={bankName}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setBankName(e.target.value)}
                  >
                    <option value="">Select bank…</option>
                    {bankOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="kyc-field">
                  <label className="kyc-label">Account Number</label>
                  <input
                    className="kyc-input" type="text"
                    placeholder="e.g. 0987654321"
                    value={accountNum}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountNum(e.target.value)}
                  />
                </div>
                <div className="kyc-field">
                  <label className="kyc-label">Account Holder Name</label>
                  <input
                    className="kyc-input" type="text"
                    placeholder="Full name as on bank account"
                    value={accountName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountName(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Amount */}
            <div className="kyc-field" style={{ marginTop: 4 }}>
              <label className="kyc-label">Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span className="wallet-currency-prefix">$</span>
                <input
                  className="kyc-input" style={{ paddingLeft: 28 }}
                  type="number" min={minAmount} placeholder={`Min $${minAmount}`}
                  value={amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                />
              </div>
              {amount && !isValidAmt && (
                <span className="kyc-field-error">Minimum withdrawal is ${minAmount}</span>
              )}
            </div>
            <div className="gold-quick-row" style={{ marginBottom: 12 }}>
              {[100, 500, 1000, 5000].map(q => (
                <button key={q} type="button" className="quick-btn" onClick={() => setAmount(String(q))}>
                  ${q}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back</button>
              <button
                type="button" className="btn-next"
                onClick={() => setStep(3)}
                disabled={!step2Valid || !isValidAmt}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
              <div style={{ fontSize: 40 }}>↑</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ff6475' }}>
                ${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                Withdraw via {methodLabel}
              </div>
            </div>

            <div className="wallet-summary">
              <div className="breakdown-row"><span>Amount</span><strong>${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
              <div className="breakdown-row">
                <span>Network Fee</span>
                <strong style={{ color: fee > 0 ? '#ff6475' : '#10d9a0' }}>{fee > 0 ? `-$${fee}` : 'Free'}</strong>
              </div>
              <div className="breakdown-row" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 4 }}>
                <span>You Receive</span>
                <strong style={{ color: '#10d9a0', fontSize: 16 }}>
                  ${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="breakdown-row"><span>Method</span><strong>{methodLabel}</strong></div>
              {methodType === 'crypto' && (
                <div className="breakdown-row">
                  <span>Destination</span>
                  <strong style={{ fontSize: 11, wordBreak: 'break-all', maxWidth: 150, textAlign: 'right' }}>
                    {destination.slice(0, 12)}…{destination.slice(-6)}
                  </strong>
                </div>
              )}
              {methodType === 'bank' && (
                <>
                  <div className="breakdown-row"><span>Bank</span><strong>{bankName}</strong></div>
                  <div className="breakdown-row"><span>Account</span><strong>{accountNum}</strong></div>
                  <div className="breakdown-row"><span>Name</span><strong>{accountName}</strong></div>
                </>
              )}
              <div className="breakdown-row"><span>Processing</span><strong style={{ color: '#ffd97a' }}>1–24 hours</strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <button type="button" className="btn-back" onClick={() => setStep(2)}>← Back</button>
              <button
                type="button" className="btn-next"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                onClick={submit} disabled={submitting}
              >
                {submitting ? 'Submitting…' : '✓ Confirm Withdrawal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Wallet component ───────────────────────── */
export default function Wallet({ notify, userName = 'User', userEmail = '' }: WalletProps) {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <Title title="Wallet" sub="Assets, deposit & withdrawal history" />

      {/* Balance hero */}
      <div className="hero">
        <small className="hero-label">Total Asset Value</small>
        <h2 className="hero-value">{portfolio.totalValue}</h2>
        <div className="hero-meta">
          <span className="green">{portfolio.monthlyPnl}</span>
          <span className="hero-sep">·</span>
          <span className="green">{portfolio.monthlyPnlPercent}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="actions two">
        <button type="button" onClick={() => setModal('deposit')}>↓ Deposit</button>
        <button type="button" onClick={() => setModal('withdraw')}>↑ Withdraw</button>
      </div>

      {/* Asset breakdown */}
      <h3>My Assets</h3>
      {walletAssets.map((a) => (
        <div className="asset-row" key={a.symbol}>
          <div className="asset-icon">{a.symbol.slice(0, 2)}</div>
          <div className="asset-info">
            <b>{a.symbol}</b>
            <small>{a.name}</small>
          </div>
          <div className="asset-values">
            <b>{a.balance} {a.symbol}</b>
            <small>{a.usdValue}</small>
          </div>
          <span className={`asset-change ${a.trend === 'down' ? 'red' : a.trend === 'neutral' ? '' : 'green'}`}>
            {a.change}
          </span>
        </div>
      ))}

      {/* Transaction history */}
      <h3>History</h3>
      {transactions.map((t) => {
        const color      = STATUS_COLOR[t.status] ?? '';
        const isPositive = t.amount.startsWith('+');
        const isNegative = t.amount.startsWith('-');
        return (
          <div className="txn-row" key={t.id}>
            <div className="txn-left">
              <b>{t.type}</b>
              <small>{t.date}</small>
              <small className="txn-note">{t.note}</small>
            </div>
            <div className="txn-right">
              <strong className={isPositive ? 'green' : isNegative ? 'red' : ''}>{t.amount}</strong>
              <span className={`txn-status ${color}`}>{t.status}</span>
            </div>
          </div>
        );
      })}

      {/* Modals */}
      {modal === 'deposit' && (
        <DepositModal
          notify={notify}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'withdraw' && (
        <WithdrawModal
          notify={notify}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
