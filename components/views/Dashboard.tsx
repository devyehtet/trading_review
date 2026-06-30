'use client';

import { useState, useEffect } from 'react';
import Title from '../ui/Title';
import {
  getDepositsByEmail, getTradeResultsByEmail,
  type StoreDeposit, type StoreTradeResult,
} from '../../lib/store';

interface DashboardProps {
  userEmail?: string;
  userName?:  string;
}

export default function Dashboard({ userEmail = '', userName = 'User' }: DashboardProps) {
  const [deposits, setDeposits] = useState<StoreDeposit[]>([]);
  const [trades,   setTrades]   = useState<StoreTradeResult[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    async function load() {
      const [deps, trs] = await Promise.all([
        getDepositsByEmail(userEmail),
        getTradeResultsByEmail(userEmail),
      ]);
      setDeposits(deps);
      setTrades(trs);
      setLoading(false);
    }
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [userEmail]);

  /* ── Computed stats ── */
  const totalDeposited = deposits.reduce((s, d) => s + d.amountNum, 0);
  const totalPnl       = trades.reduce((s, t) => s + (t.tradeType === 'win' ? t.amount : -t.amount), 0);
  const totalBalance   = totalDeposited + totalPnl;
  const wins           = trades.filter(t => t.tradeType === 'win').length;
  const losses         = trades.filter(t => t.tradeType === 'loss').length;
  const winRate        = trades.length ? Math.round((wins / trades.length) * 100) : 0;
  const pnlColor       = totalPnl >= 0 ? '#10d9a0' : '#ff6475';

  /* ── Chart data from trade history ── */
  const chartPoints = (() => {
    let running = totalDeposited;
    const points = [running];
    const sorted = [...trades].reverse();
    for (const t of sorted) {
      running += t.tradeType === 'win' ? t.amount : -t.amount;
      points.push(Math.max(0, running));
    }
    return points;
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
      <Title title="Dashboard" sub={`Portfolio overview · ${userName}`} />

      {/* Balance hero */}
      <div className="hero" style={{ marginBottom: 16 }}>
        <small className="hero-label">Total Balance</small>
        <h2 className="hero-value" style={{ color: totalBalance > 0 ? 'var(--text-primary)' : '#ff6475' }}>
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h2>
        <div className="hero-meta">
          <span style={{ color: pnlColor }}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })} P&L
          </span>
          <span className="hero-sep">·</span>
          <span style={{ color: pnlColor }}>
            {totalDeposited > 0 ? `${totalPnl >= 0 ? '+' : ''}${((totalPnl / totalDeposited) * 100).toFixed(2)}%` : '—'}
          </span>
        </div>
      </div>

      {/* Stat grid */}
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
          <small>Trades</small>
          <strong>{trades.length}</strong>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 0 }}>
        <div className="card-stat">
          <small>Wins 🟢</small>
          <strong style={{ color: '#10d9a0' }}>{wins}</strong>
        </div>
        <div className="card-stat">
          <small>Losses 🔴</small>
          <strong style={{ color: '#ff6475' }}>{losses}</strong>
        </div>
        <div className="card-stat">
          <small>Deposits</small>
          <strong>{deposits.length}</strong>
        </div>
        <div className="card-stat">
          <small>Status</small>
          <strong style={{ color: '#10d9a0', fontSize: 11 }}>Active</strong>
        </div>
      </div>

      {/* Portfolio chart */}
      <div className="chart">
        <div className="chart-inner">
          <div className="chart-bars">
            {(chartPcts.length > 1 ? chartPcts : [40,55,48,70,62,80,75,88,72,95,84,100]).map((h, i) => (
              <div
                key={i}
                className="chart-bar"
                style={{
                  height: `${h}%`,
                  background: i === chartPcts.length - 1
                    ? 'var(--accent)'
                    : undefined,
                }}
              />
            ))}
          </div>
          <small>Portfolio Performance</small>
        </div>
      </div>

      {/* Trade history */}
      <h3>Trade History {trades.length > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 400 }}>({trades.length})</span>}</h3>

      {trades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-secondary)', background: 'var(--card-alt)', borderRadius: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <p style={{ margin: 0, fontSize: 13 }}>No trade results yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>Your admin will post trade results here</p>
        </div>
      ) : (
        trades.map(t => {
          const isWin = t.tradeType === 'win';
          return (
            <div key={t.id} className="txn-row" style={{ alignItems: 'flex-start' }}>
              <div className="txn-left">
                <b style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    background: isWin ? 'rgba(16,217,160,0.12)' : 'rgba(255,100,117,0.12)',
                  }}>
                    {isWin ? '📈' : '📉'}
                  </span>
                  Trade {isWin ? 'Profit' : 'Loss'}
                </b>
                <small>{t.timestamp}</small>
                {t.note && <small className="txn-note" style={{ marginTop: 2 }}>{t.note}</small>}
              </div>
              <div className="txn-right">
                <strong style={{ color: isWin ? '#10d9a0' : '#ff6475', fontSize: 15 }}>
                  {isWin ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: isWin ? '#10d9a0' : '#ff6475',
                  background: isWin ? 'rgba(16,217,160,0.1)' : 'rgba(255,100,117,0.1)',
                  padding: '2px 7px', borderRadius: 6,
                }}>
                  {isWin ? '+' : '-'}{t.pnlPercent}%
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* Deposit history */}
      {deposits.length > 0 && (
        <>
          <h3 style={{ marginTop: 20 }}>Deposit History</h3>
          {deposits.map(d => (
            <div key={d.id} className="txn-row">
              <div className="txn-left">
                <b>Deposit</b>
                <small>{d.timestamp}</small>
                <small className="txn-note">{d.method}</small>
              </div>
              <div className="txn-right">
                <strong className="green">{d.amount}</strong>
                <span className={`txn-status ${d.status === 'Approved' ? 'green' : 'gold'}`}>{d.status}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
