'use client';

import { transactions, portfolio, walletAssets } from '../../lib/appData';
import Title from '../ui/Title';

interface WalletProps {
  notify: (msg: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  Approved:   'green',
  Pending:    'gold',
  Processing: 'gold',
  Failed:     'red',
};

export default function Wallet({ notify }: WalletProps) {
  const totalAsset = portfolio.totalValue;

  return (
    <>
      <Title title="Wallet" sub="Assets, deposit & withdrawal history" />

      {/* Balance hero */}
      <div className="hero">
        <small className="hero-label">Total Asset Value</small>
        <h2 className="hero-value">{totalAsset}</h2>
        <div className="hero-meta">
          <span className="green">{portfolio.monthlyPnl}</span>
          <span className="hero-sep">·</span>
          <span className="green">{portfolio.monthlyPnlPercent}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="actions two">
        <button type="button" onClick={() => notify('Deposit request submitted')}>
          ↓ Deposit
        </button>
        <button type="button" onClick={() => notify('Withdrawal request submitted')}>
          ↑ Withdraw
        </button>
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
        const color = STATUS_COLOR[t.status] ?? '';
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
    </>
  );
}
