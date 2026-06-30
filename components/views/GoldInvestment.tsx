'use client';

import { useState, useEffect, useRef, type ChangeEvent } from 'react';

interface GoldInvestmentProps {
  notify: (msg: string) => void;
}

const BASE_SPOT   = 2_338.50;   // XAU/USD starting price (oz)
const SPREAD      = 2.00;       // $2 total spread → ±$1 each side
const HALF_SPREAD = SPREAD / 2;
const BASE_MMK    = 4_200;      // USD/MMK base rate
const MIN_OZ      = 0.001;
const TROY_G      = 31.1035;    // grams per troy ounce
const HISTORY_LEN = 24;

function fmtUSD(n: number, dp = 2) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
function fmtMMK(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MMK';
}
function randomWalk(prev: number, pct: number, lo: number, hi: number) {
  const delta = prev * (Math.random() * pct * 2 - pct);
  return Math.max(lo, Math.min(hi, prev + delta));
}

const DEMO_TRADES = [
  { side: 'Buy',  oz: '0.050', price: '2,331.20', date: 'Jun 23' },
  { side: 'Buy',  oz: '0.025', price: '2,298.70', date: 'Jun 20' },
  { side: 'Sell', oz: '0.010', price: '2,315.50', date: 'Jun 17' },
  { side: 'Buy',  oz: '0.100', price: '2,280.00', date: 'Jun 12' },
];

export default function GoldInvestment({ notify }: GoldInvestmentProps) {
  const [spot,    setSpot]    = useState(BASE_SPOT);
  const [mmkRate, setMmkRate] = useState(BASE_MMK);
  const [history, setHistory] = useState<number[]>([BASE_SPOT]);
  const [dir,     setDir]     = useState<'up' | 'down' | 'flat'>('flat');
  const [mode,    setMode]    = useState<'buy' | 'sell'>('buy');
  const [ozInput, setOzInput] = useState('');
  const [tab,     setTab]     = useState<'trade' | 'portfolio'>('trade');
  const prevSpot = useRef(BASE_SPOT);

  useEffect(() => {
    const id = setInterval(() => {
      setSpot((p) => {
        const next = randomWalk(p, 0.0025, 2_150, 2_550);
        setDir(next > p ? 'up' : next < p ? 'down' : 'flat');
        prevSpot.current = p;
        setHistory((h) => [...h.slice(-(HISTORY_LEN - 1)), next]);
        return next;
      });
      setMmkRate((p) => randomWalk(p, 0.0008, 4_100, 4_350));
    }, 2_500);
    return () => clearInterval(id);
  }, []);

  const buyPrice  = spot + HALF_SPREAD;
  const sellPrice = spot - HALF_SPREAD;
  const tradePrice = mode === 'buy' ? buyPrice : sellPrice;

  const ozNum   = parseFloat(ozInput) || 0;
  const usdCost = ozNum > 0 ? ozNum * tradePrice : 0;
  const mmkCost = usdCost * mmkRate;
  const grams   = ozNum * TROY_G;
  const isValid = ozNum >= MIN_OZ;

  const dayChange    = spot - BASE_SPOT;
  const dayChangePct = (dayChange / BASE_SPOT) * 100;

  const hMax  = Math.max(...history);
  const hMin  = Math.min(...history);
  const hRange = hMax - hMin || 1;
  const barH  = (v: number) => Math.max(4, Math.round(((v - hMin) / hRange) * 52));

  function handleTrade() {
    if (!isValid) {
      notify(`Minimum trade: ${MIN_OZ} oz`);
      return;
    }
    notify(
      `${mode === 'buy' ? '🟡 Bought' : '🔴 Sold'} ${ozNum.toFixed(4)} oz @ ${fmtUSD(tradePrice)} — ${fmtUSD(usdCost)}`
    );
    setOzInput('');
  }

  function setQuick(oz: number) {
    setOzInput(oz.toString());
  }

  return (
    <div>
      <div className="gold-hero">
        <div className="gold-hero-top">
          <div className="gold-hero-left">
            <span className="gold-badge">XAU / USD</span>
            <div className={`gold-price ${dir}`}>
              {fmtUSD(spot)}
            </div>
            <div className={`gold-change ${dayChange >= 0 ? 'green' : 'red'}`}>
              {dayChange >= 0 ? '▲' : '▼'} {fmtUSD(Math.abs(dayChange))}
              <span> ({dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(2)}%)</span>
            </div>
          </div>
          <div className="gold-hero-right">
            <div className="gold-icon">🪙</div>
          </div>
        </div>

        <div className="gold-spread-row">
          <div className="spread-cell">
            <span>Buy</span>
            <strong className="green">{fmtUSD(buyPrice)}</strong>
          </div>
          <div className="spread-mid">Spread ${SPREAD.toFixed(2)}</div>
          <div className="spread-cell right">
            <span>Sell</span>
            <strong className="red">{fmtUSD(sellPrice)}</strong>
          </div>
        </div>

        <div className="gold-rate-row">
          <span className="gold-rate-label">Exchange Rate</span>
          <span className="gold-rate-value">
            1 USD = {mmkRate.toLocaleString('en-US', { maximumFractionDigits: 0 })} MMK
          </span>
        </div>
      </div>

      <div className="gold-chart-wrap">
        <div className="gold-chart-bars">
          {history.map((v, i) => {
            const isLast = i === history.length - 1;
            const isUp   = i > 0 && v >= history[i - 1];
            return (
              <div
                key={i}
                className={`gold-bar ${isUp ? 'up' : 'dn'}${isLast ? ' current' : ''}`}
                style={{ height: barH(v) }}
              />
            );
          })}
        </div>
        <div className="gold-chart-labels">
          <span>{fmtUSD(hMin, 0)}</span>
          <span className="gold-chart-live">● LIVE</span>
          <span>{fmtUSD(hMax, 0)}</span>
        </div>
      </div>

      <div className="switch" style={{ margin: '14px 0' }}>
        <button
          type="button"
          className={tab === 'trade' ? 'active' : ''}
          onClick={() => setTab('trade')}
        >
          Trade
        </button>
        <button
          type="button"
          className={tab === 'portfolio' ? 'active' : ''}
          onClick={() => setTab('portfolio')}
        >
          Portfolio
        </button>
      </div>

      {tab === 'trade' && (
        <>
          <div className="gold-bs-toggle">
            <button
              type="button"
              className={mode === 'buy' ? 'active buy' : ''}
              onClick={() => setMode('buy')}
            >
              Buy Gold
            </button>
            <button
              type="button"
              className={mode === 'sell' ? 'active sell' : ''}
              onClick={() => setMode('sell')}
            >
              Sell Gold
            </button>
          </div>

          <div className="gold-input-wrap">
            <label className="kyc-label">Amount (troy ounces)</label>
            <div className="gold-input-row">
              <input
                type="number"
                className="kyc-input"
                placeholder={`Min ${MIN_OZ} oz`}
                min={MIN_OZ}
                step={MIN_OZ}
                value={ozInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOzInput(e.target.value)}
              />
              <span className="gold-unit">oz</span>
            </div>

            <div className="gold-quick-row">
              {[0.001, 0.01, 0.05, 0.1].map((q) => (
                <button key={q} type="button" className="quick-btn" onClick={() => setQuick(q)}>
                  {q} oz
                </button>
              ))}
            </div>
          </div>

          {ozNum > 0 && (
            <div className="gold-breakdown">
              <div className="breakdown-row">
                <span>Weight</span>
                <strong>{grams.toFixed(4)} g</strong>
              </div>
              <div className="breakdown-row">
                <span>{mode === 'buy' ? 'Buy' : 'Sell'} Price / oz</span>
                <strong>{fmtUSD(tradePrice)}</strong>
              </div>
              <div className="breakdown-row">
                <span>Spread</span>
                <strong style={{ color: 'var(--text-secondary)' }}>${HALF_SPREAD.toFixed(2)}/oz</strong>
              </div>
              <div className="breakdown-row total">
                <span>Total ({mode === 'buy' ? 'You Pay' : 'You Get'})</span>
                <div>
                  <strong className={mode === 'buy' ? 'red' : 'green'}>{fmtUSD(usdCost)}</strong>
                  <small style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11 }}>
                    ≈ {fmtMMK(mmkCost)}
                  </small>
                </div>
              </div>
            </div>
          )}

          {!isValid && ozInput !== '' && (
            <p style={{ color: 'var(--color-red)', fontSize: 12, marginTop: 6 }}>
              Minimum trade is {MIN_OZ} oz
            </p>
          )}

          <button
            type="button"
            className={`gold-trade-btn${mode === 'sell' ? ' sell' : ''}`}
            onClick={handleTrade}
            disabled={!isValid}
          >
            {mode === 'buy'
              ? `🟡 Buy ${ozNum > 0 ? ozNum + ' oz' : 'Gold'}`
              : `🔴 Sell ${ozNum > 0 ? ozNum + ' oz' : 'Gold'}`
            }
          </button>

          <p className="gold-disclaimer">
            Gold prices update every ~2.5 s. Spread: ${SPREAD.toFixed(2)}/oz. Min order: {MIN_OZ} oz. Trading involves risk of loss.
          </p>
        </>
      )}

      {tab === 'portfolio' && (
        <>
          <div className="gold-holding-card">
            <div className="holding-row">
              <span>Total Holdings</span>
              <strong>0.175 oz</strong>
            </div>
            <div className="holding-row">
              <span>≈ Weight</span>
              <strong>{(0.175 * TROY_G).toFixed(3)} g</strong>
            </div>
            <div className="holding-row">
              <span>Market Value</span>
              <strong className="green">{fmtUSD(0.175 * spot)}</strong>
            </div>
            <div className="holding-row">
              <span>Avg. Cost</span>
              <strong>$2,301.85 / oz</strong>
            </div>
            <div className="holding-row">
              <span>Unrealised P&L</span>
              <strong className="green">
                +{fmtUSD((spot - 2_301.85) * 0.175)} (+{(((spot - 2_301.85) / 2_301.85) * 100).toFixed(2)}%)
              </strong>
            </div>
            <div className="holding-row">
              <span>MMK Equivalent</span>
              <strong>{fmtMMK(0.175 * spot * mmkRate)}</strong>
            </div>
          </div>

          <div className="gold-section-label">Recent Trades</div>
          {DEMO_TRADES.map((t, i) => (
            <div key={i} className="gold-trade-row">
              <div className={`trade-side-badge ${t.side.toLowerCase()}`}>{t.side}</div>
              <div className="trade-info">
                <strong>{t.oz} oz</strong>
                <small>@ ${t.price}</small>
              </div>
              <div className="trade-date">{t.date}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
