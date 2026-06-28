'use client';

import { plans, notices } from '../../lib/appData';
import type { ViewProps } from '../../lib/types';
import Title from '../ui/Title';

export default function Plans({ notify, setView }: ViewProps) {
  return (
    <>
      <Title title="Investment Plans" sub="1 Month • 6 Months • 1 Year" />

      {plans.map((p) => (
        <div className="plan" key={p.name}>
          <div className="plan-top">
            <span className="badge">{p.tag}</span>
            <h2>{p.name}</h2>
            <p className="plan-sub">
              {p.duration}
              {p.profitNote && <span className="plan-note"> • Profit {p.profitNote}</span>}
            </p>
          </div>

          <div className="tier-table">
            <div className="tier-head">
              <span>Investment (USDT)</span>
              <span>Your Share</span>
            </div>
            {p.tiers.map((t) => (
              <div className="tier-row" key={t.range}>
                <span className="tier-range">{t.range}</span>
                <span className="tier-profit">{t.profit} of profits</span>
              </div>
            ))}
          </div>

          <div className="plan-progress">
            <div className="plan-progress-bar">
              <i style={{ width: `${p.progress}%` }} />
            </div>
            <small>{p.users} investors</small>
          </div>

          <button
            type="button"
            onClick={() => { notify(`${p.name} selected`); setView('wallet'); }}
          >
            Select {p.shortName} Plan
          </button>
        </div>
      ))}

      {/* Notice Board */}
      <div className="notice-board">
        <div className="notice-title">
          <span className="notice-icon">📋</span>
          <b>Notice Board</b>
        </div>
        <ol className="notice-list">
          {notices.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ol>
      </div>
    </>
  );
}
