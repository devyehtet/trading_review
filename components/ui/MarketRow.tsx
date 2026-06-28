import type { MarketItem } from '../../lib/types';

export default function MarketRow({ symbol, name, price, change, trend, volume, high24h, low24h }: MarketItem) {
  const isDown = trend === 'down';
  return (
    <div className="market-row">
      <div className="market-left">
        <div className="market-symbol-badge" data-trend={trend}>
          {symbol.split('/')[0].slice(0, 3)}
        </div>
        <div>
          <b className="market-symbol">{symbol}</b>
          <small className="market-meta">Vol {volume}</small>
        </div>
      </div>
      <div className="market-right">
        <b className="market-price">{price}</b>
        <span className={`market-change ${isDown ? 'red' : 'green'}`}>{change}</span>
        <small className="market-hl">H {high24h} · L {low24h}</small>
      </div>
    </div>
  );
}
