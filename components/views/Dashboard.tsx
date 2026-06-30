'use client';

import { useState, useEffect } from 'react';
import Title from '../ui/Title';
import {
  getDepositsByEmail, getDailyResults, getMarginRatio,
  type StoreDeposit, type StoreDailyResult, type InvestPlan,
} from '../../lib/store';

interface DashboardProps {
  userEmail?: string;
  userName?:  string;
}

const PLAN_COLOR: Record<InvestPlan, string> = {
  M: '#3b82f6',
  Q: '#8b5cf6',
  Y: '#10d9a0',
};
const PLAN_LABEL: Record<InvestPlan, string> = {
  M: 'M Plan · 1 Month',
  Q: 'Q Plan · 6 Months',
  Y: 'Y Plan · 12 Months',
};

export default function Dashboard({ userEmail = '', userName = 'User' }: DashboardProps) {
  const [deposits, setDeposits] = useState<StoreDeposit[]>([]);
  const [daily,    setDaily]    = useState<StoreDailyResult[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    async function load() {
      const [deps, drs] = await Promise.all([
        getDepositsByEmail(userEmail),
        getDailyResults(),
      ]);
      setDeposits(deps);
      setDaily(drs);
      setLoading(false);
    }
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [userEmail]);

  /* ── Compute user's profit from each daily result ── */
  const totalDeposited = deposits.reduce((s, d) => s + d.amountNum, 0);

  // For each daily result, compute user profit = sum over deposits of (dep × daily% × marginRatio)
  const dailyBreakdown = daily.map(dr => {
    let userProfit = 0;
    for (const dep of deposits) {
      const ratio  = getMarginRatio(dep.plan, dep.amountNum);
      const raw    = dep.amountNum * (dr.tradePercent / 100);
      userProfit  += raw * ratio;
    }
    return { ...dr, userProfit };
  });

  const totalPnl     = dailyBreakdown.reduce((s, d) => s + d.userProfit, 0);
  const totalBalance = totalDeposited + totalPnl;
  const wins         = dailyBreakdown.filter(d => d.userProfit > 0).length;
  const losses       = dailyBreakdown.filter(d => d.userProfit < 0).length;
  const winRate      = dailyBreakdown.length ? Math.round((wins / dailyBreakdown.length) * 100) : 0;
  const pnlColor     = totalPnl >= 0 ? '#10d9a0' : '#ff6475';
  const pnlPct       = totalDeposited > 0 ? ((totalPnl / totalDeposited) * 100).toFixed(2) : '0.00';

  /* ── Chart bars from running balance ── */
  const chartPoints = (() => {
    let running = totalDeposited;
    const pts = [running];
    const sorted = [...dailyBreakdown].reverse();
    for (const d of sorted) { running += d.userProfit; pts.push(Math.max(0, running)); }
    return pts;
  })();
  const chartMax  = Math.max(...chartPoints, 1);
  const chartPcts = chartPoints.map(p => Math.round((p / chartMax) * 100));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <Title title="Dashboard" sub={`Portfolio · ${userName}`} />

      {/* Balance hero */}
      <div className="hero" style={{ marginBottom: 16 }}>
        <small className="hero-label">Total Balance</small>
        <h2 className="hero-value">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h2>
        <div className="hero-meta">
          <span style={{ color: pnlColor }}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="hero-sep">·</span>
          <span style={{ color: pnlColor }}>{totalPnl >= 0 ? '+' : ''}{pnlPct}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid">
        <div className="card-stat">
          <small>Deposited</small>
          <strong>${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="card-stat">
          <small>Total P&L</small>
          <strong style={{ color: pnlColor }}>
            {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="card-stat">
          <small>Win Rate</small>
          <strong style={{ color: winRate >= 50 ? '#10d9a0' : '#ff6475' }}>{winRate}%</strong>
        </div>
        <div className="card-stat">
          <small>Trade Days</small>
          <strong>{dailyBreakdown.length}</strong>
        </div>
      </div>

      {/* Active investments */}
      {deposits.length > 0 && (
        <>
          <h3>Active Investments</h3>
          {deposits.map(d => {
            const ratio = getMarginRatio(d.plan, d.amountNum);
            const color = PLAN_COLOR[d.plan];
            return (
              <div key={d.id} style={{
                background: 'var(--card-alt)', borderRadius: 12,
                padding: '12px 14px', marginBottom: 8,
                borderLeft: `3px solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color }}>{PLAN_LABEL[d.plan]}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{d.timestamp} · {d.method}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{d.amount}</div>
                    <div style={{ fontSize: 11, color, marginTop: 2 }}>{(ratio * 100).toFixed(0)}% profit share</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Chart */}
      <div className="chart">
        <div className="chart-inner">
          <div className="chart-bars">
            {(chartPcts.length > 1 ? chartPcts : [40,55,48,70,62,80,75,88,72,95,84,100]).map((h, i) => (
              <div key={i} className="chart-bar" style={{
                height: `${h}%`,
                background: i === chartPcts.length - 1 ? '#10d9a0' : undefined,
              }} />
            ))}
          </div>
          <small>Portfolio Performance</small>
        </div>
      </div>

      {/* Daily results */}
      <h3>Daily Trade Results {dailyBreakdown.length > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 400 }}>({dailyBreakdown.length})</span>}</h3>

      {dailyBreakdown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-secondary)', background: 'var(--card-alt)', borderRadius: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <p style={{ margin: 0, fontSize: 13 }}>No trade results yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>Your admin will post daily results here</p>
        </div>
      ) : (
        dailyBreakdown.map(d => {
          const isWin  = d.userProfit >= 0;
          const color  = isWin ? '#10d9a0' : '#ff6475';
          return (
            <div key={d.id} className="txn-row">
              <div className="txn-left">
                <b style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 6, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    background: isWin ? 'rgba(16,217,160,0.12)' : 'rgba(255,100,117,0.12)',
                  }}>
                    {isWin ? '📈' : '📉'}
                  </span>
                  {d.date}
                </b>
                {d.note && <small className="txn-note">{d.note}</small>}
                <small style={{ color: 'var(--text-secondary)' }}>
                  Market: {d.tradePercent >= 0 ? '+' : ''}{d.tradePercent}%
                </small>
              </div>
              <div className="txn-right">
                <strong style={{ color, fontSize: 15 }}>
                  {isWin ? '+' : ''}${d.userProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
                <span style={{
                  fontSize: 11, fontWeight: 700, color,
                  background: isWin ? 'rgba(16,217,160,0.1)' : 'rgba(255,100,117,0.1)',
                  padding: '2px 7px', borderRadius: 6,
                }}>
                  {isWin ? '+' : ''}{d.tradePercent}%
                </span>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
