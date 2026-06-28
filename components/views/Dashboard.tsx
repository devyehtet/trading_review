'use client';

import { positions, portfolio } from '../../lib/appData';
import Card from '../ui/Card';
import Title from '../ui/Title';

export default function Dashboard() {
  return (
    <>
      <Title title="Dashboard" sub="Portfolio overview & open positions" />

      {/* Stats */}
      <div className="grid">
        <Card title="Portfolio"    value={portfolio.totalValue} />
        <Card title="Monthly PnL"  value={portfolio.monthlyPnl} />
        <Card title="Drawdown"     value={portfolio.drawdown} />
        <Card title="Win Rate"     value={portfolio.winRate} />
      </div>
      <div className="grid">
        <Card title="Total Trades" value={portfolio.totalTrades} />
        <Card title="Open Pos."    value={portfolio.openPositions} />
        <Card title="Invested"     value={portfolio.activeInvestment} />
        <Card title="Cash"         value={portfolio.availableBalance} />
      </div>

      {/* Chart placeholder */}
      <div className="chart">
        <div className="chart-inner">
          <div className="chart-bars">
            {[40, 55, 48, 70, 62, 80, 75, 88, 72, 95, 84, 100].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
          <small>Monthly Performance</small>
        </div>
      </div>

      {/* Positions */}
      <h3>Open Positions</h3>
      {positions.map((p) => (
        <div className="pos-row" key={p.pair}>
          <div className="pos-left">
            <div className="pos-title">
              <b>{p.pair}</b>
              {p.leverage !== '—' && (
                <span className={`lev-badge ${p.side === 'Short' ? 'short' : 'long'}`}>
                  {p.leverage} {p.side}
                </span>
              )}
              {p.leverage === '—' && (
                <span className="lev-badge cash">Cash</span>
              )}
            </div>
            <small>Entry {p.entry} · Size {p.size}</small>
          </div>
          <div className="pos-right">
            <strong className={p.pnl.startsWith('-') ? 'red' : 'green'}>{p.pnl}</strong>
            <span className={`pos-pct ${p.pnl.startsWith('-') ? 'red' : 'green'}`}>{p.pnlPct}</span>
          </div>
        </div>
      ))}
    </>
  );
}
