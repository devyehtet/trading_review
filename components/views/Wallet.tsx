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

const METHODS = ['USDT (TRC-20)', 'USDT (ERC-20)', 'Bank Transfer', 'Bitcoin (BTC)', 'Ethereum (ETH)'];

type ModalType = 'deposit' | 'withdraw' | null;

export default function Wallet({ notify, userName = 'User', userEmail = '' }: WalletProps) {
  const [modal,     setModal]     = useState<ModalType>(null);
  const [amount,    setAmount]    = useState('');
  const [method,    setMethod]    = useState(METHODS[0]);
  const [submitting, setSubmitting] = useState(false);

  const amountNum = parseFloat(amount.replace(/,/g, '')) || 0;
  const isValid   = amountNum >= 10;

  function openModal(type: ModalType) {
    setModal(type);
    setAmount('');
    setMethod(METHODS[0]);
  }

  async function handleSubmit() {
    if (!isValid || !modal) return;
    setSubmitting(true);
    const type = modal === 'deposit' ? 'Deposit' : 'Withdrawal';
    const entry = await addDeposit(userName, userEmail, type, amountNum, method);
    notify(`${type} ${entry.amount} submitted — ${entry.id}`);
    setModal(null);
    setSubmitting(false);
  }

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
        <button type="button" onClick={() => openModal('deposit')}>↓ Deposit</button>
        <button type="button" onClick={() => openModal('withdraw')}>↑ Withdraw</button>
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
              <strong className={isPositive ? 'green' : isNegative ? 'red' : ''}>
                {t.amount}
              </strong>
              <span className={`txn-status ${color}`}>{t.status}</span>
            </div>
          </div>
        );
      })}

      {/* ── Deposit / Withdraw modal ──────────── */}
      {modal && (
        <div className="wallet-modal-overlay" onClick={() => setModal(null)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="wallet-modal-header">
              <h3>{modal === 'deposit' ? '↓ Deposit' : '↑ Withdraw'}</h3>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {/* Amount */}
            <div className="kyc-field">
              <label className="kyc-label">Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span className="wallet-currency-prefix">$</span>
                <input
                  className="kyc-input"
                  style={{ paddingLeft: 28 }}
                  type="number"
                  min={10}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                />
              </div>
              {amount && !isValid && (
                <span className="kyc-field-error">Minimum amount is $10.00</span>
              )}
            </div>

            {/* Quick amounts */}
            <div className="gold-quick-row" style={{ marginBottom: 14 }}>
              {[100, 500, 1000, 5000].map(q => (
                <button key={q} type="button" className="quick-btn" onClick={() => setAmount(String(q))}>
                  ${q}
                </button>
              ))}
            </div>

            {/* Method */}
            <div className="kyc-field">
              <label className="kyc-label">Payment Method</label>
              <select
                className="kyc-input"
                value={method}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setMethod(e.target.value)}
              >
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Summary */}
            {isValid && (
              <div className="wallet-summary">
                <div className="breakdown-row">
                  <span>Amount</span>
                  <strong>${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Method</span>
                  <strong>{method}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Processing</span>
                  <strong style={{ color: 'var(--color-accent)' }}>1–24 hours</strong>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              className="btn-next"
              style={{
                width: '100%',
                background: modal === 'deposit'
                  ? 'linear-gradient(135deg, var(--color-primary), #1d4ed8)'
                  : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              }}
              onClick={handleSubmit}
              disabled={!isValid || submitting}
            >
              {submitting
                ? 'Submitting…'
                : modal === 'deposit'
                  ? `↓ Submit Deposit — $${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : `↑ Submit Withdrawal — $${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}
