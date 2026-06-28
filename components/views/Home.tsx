'use client';

import { marketData, portfolio } from '../../lib/appData';
import type { ViewProps } from '../../lib/types';
import Card from '../ui/Card';
import MarketRow from '../ui/MarketRow';

export default function Home({ notify, setView }: ViewProps) {
  return (
    <>
      {/* Hero */}
      <div className="hero">
        <small className="hero-label">Total Portfolio Value</small>
        <h2 className="hero-value">{portfolio.totalValue}</h2>
        <div className="hero-meta">
          <span className="green">{portfolio.monthlyPnl}</span>
          <span className="hero-sep">·</span>
          <span className="green">{portfolio.monthlyPnlPercent} this month</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid">
        <Card title="Available"      value={portfolio.availableBalance} />
        <Card title="In Plans"       value={portfolio.activeInvestment} />
        <Card title="Open Positions" value={portfolio.openPositions} />
        <Card title="Win Rate"       value={portfolio.winRate} />
      </div>

      {/* Quick actions */}
      <h3>Quick Actions</h3>
      <div className="actions">
        <button type="button" onClick={() => setView('wallet')}>Deposit</button>
        <button type="button" onClick={() => setView('wallet')}>Withdraw</button>
        <button type="button" onClick={() => setView('plans')}>Invest</button>
        <button type="button" onClick={() => setView('kyc')}>KYC</button>
      </div>

      {/* Market snapshot */}
      <div className="section-header">
        <h3>Market Watch</h3>
        <button type="button" className="see-all" onClick={() => setView('markets')}>
          See all →
        </button>
      </div>
      {marketData.slice(0, 4).map((m) => (
        <MarketRow key={m.symbol} {...m} />
      ))}

      <p className="risk">
        Trading involves risk. Profit is not guaranteed. Past performance is not indicative of future results. Capital loss is possible.
      </p>
    </>
  );
}
