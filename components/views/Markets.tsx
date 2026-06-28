'use client';

import { marketData } from '../../lib/appData';
import MarketRow from '../ui/MarketRow';
import Title from '../ui/Title';

const ASKS = [
  { price: '64,920.40', size: '0.482',  total: '$31,251' },
  { price: '64,898.10', size: '0.841',  total: '$54,579' },
  { price: '64,875.10', size: '1.208',  total: '$78,369' },
  { price: '64,852.60', size: '0.366',  total: '$23,736' },
  { price: '64,840.20', size: '0.731',  total: '$47,398' },
];

const BIDS = [
  { price: '64,810.20', size: '0.934',  total: '$60,533' },
  { price: '64,795.50', size: '2.104',  total: '$136,329' },
  { price: '64,790.00', size: '1.420',  total: '$91,002' },
  { price: '64,774.50', size: '0.621',  total: '$40,205' },
  { price: '64,760.80', size: '0.882',  total: '$57,119' },
];

export default function Markets() {
  return (
    <>
      <Title title="Markets" sub="Crypto · Forex · Commodities" />

      {/* Spot watchlist */}
      <div className="market-section-label">SPOT PAIRS</div>
      {marketData.filter(m => m.symbol.includes('USDT')).map((m) => (
        <MarketRow key={m.symbol} {...m} />
      ))}

      <div className="market-section-label">COMMODITIES</div>
      {marketData.filter(m => !m.symbol.includes('USDT')).map((m) => (
        <MarketRow key={m.symbol} {...m} />
      ))}

      {/* Order Book */}
      <h3>Order Book · BTC/USDT</h3>
      <div className="orderbook">
        <div className="ob-header">
          <span>Price (USDT)</span>
          <span>Amount (BTC)</span>
          <span>Total</span>
        </div>

        {ASKS.map((a) => (
          <div className="ob-row ask" key={a.price}>
            <span className="red">{a.price}</span>
            <span>{a.size}</span>
            <span className="ob-total">{a.total}</span>
            <div className="ob-depth ask-depth" style={{ width: `${Math.random() * 60 + 20}%` }} />
          </div>
        ))}

        <div className="ob-spread">
          <span className="green">$64,820.40</span>
          <span className="ob-spread-label">Last price · Spread $109.60</span>
        </div>

        {BIDS.map((b) => (
          <div className="ob-row bid" key={b.price}>
            <span className="green">{b.price}</span>
            <span>{b.size}</span>
            <span className="ob-total">{b.total}</span>
            <div className="ob-depth bid-depth" style={{ width: `${Math.random() * 60 + 20}%` }} />
          </div>
        ))}
      </div>
    </>
  );
}
