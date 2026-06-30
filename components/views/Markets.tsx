'use client';

import { useState, useEffect } from 'react';
import Title from '../ui/Title';

interface CoinPrice {
  id:        string;
  symbol:    string;
  name:      string;
  icon:      string;
  price:     number;
  change24h: number;
  volume:    string;
  marketCap: string;
}

const COINS = [
  { id: 'bitcoin',        symbol: 'BTC/USDT',  name: 'Bitcoin',    icon: '₿'  },
  { id: 'ethereum',       symbol: 'ETH/USDT',  name: 'Ethereum',   icon: '⟠'  },
  { id: 'binancecoin',    symbol: 'BNB/USDT',  name: 'BNB',        icon: '🔶' },
  { id: 'solana',         symbol: 'SOL/USDT',  name: 'Solana',     icon: '◎'  },
  { id: 'ripple',         symbol: 'XRP/USDT',  name: 'XRP',        icon: '◈'  },
  { id: 'cardano',        symbol: 'ADA/USDT',  name: 'Cardano',    icon: '₳'  },
  { id: 'dogecoin',       symbol: 'DOGE/USDT', name: 'Dogecoin',   icon: 'Ð'  },
  { id: 'tron',           symbol: 'TRX/USDT',  name: 'TRON',       icon: '⬡'  },
];

function fmt(n: number): string {
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1)    return n.toFixed(4);
  return n.toFixed(6);
}

export default function Markets() {
  const [coins,     setCoins]     = useState<CoinPrice[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [lastUpdate,setLastUpdate]= useState('');
  const [error,     setError]     = useState('');

  async function fetchPrices() {
    try {
      const ids = COINS.map(c => c.id).join(',');
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&sparkline=false&price_change_percentage=24h`,
        { next: { revalidate: 0 } },
      );
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as Array<{
        id: string; current_price: number;
        price_change_percentage_24h: number;
        total_volume: number; market_cap: number;
      }>;

      const mapped: CoinPrice[] = COINS.map(c => {
        const d = data.find(x => x.id === c.id);
        return {
          ...c,
          price:     d?.current_price ?? 0,
          change24h: d?.price_change_percentage_24h ?? 0,
          volume:    fmt(d?.total_volume ?? 0),
          marketCap: fmt(d?.market_cap ?? 0),
        };
      });
      setCoins(mapped);
      setError('');
      setLastUpdate(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setError('Unable to fetch live prices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Title title="Markets" sub="Live Crypto Prices" />

      {/* Live indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: error ? '#ff6475' : '#10d9a0',
            display: 'inline-block',
            boxShadow: error ? 'none' : '0 0 6px #10d9a0',
          }} />
          {error ? 'Offline' : 'Live · Updates every 30s'}
        </div>
        {lastUpdate && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Updated {lastUpdate}
          </span>
        )}
        <button
          type="button"
          onClick={fetchPrices}
          style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          ↻
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <p style={{ fontSize: 13 }}>Fetching live prices…</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: '#ff6475', background: 'rgba(255,100,117,0.06)', borderRadius: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
          <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
          <button type="button" onClick={fetchPrices}
            style={{ marginTop: 12, background: 'var(--card-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 16px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13 }}>
            Retry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr',
            padding: '6px 14px', fontSize: 10,
            color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5,
          }}>
            <span>ASSET</span><span style={{ textAlign: 'right' }}>PRICE</span><span style={{ textAlign: 'right' }}>24H</span>
          </div>

          {coins.map(coin => {
            const isUp = coin.change24h >= 0;
            return (
              <div key={coin.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr',
                alignItems: 'center',
                background: 'var(--card-alt)', borderRadius: 12,
                padding: '12px 14px', gap: 4,
              }}>
                {/* Coin info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: isUp ? 'rgba(16,217,160,0.12)' : 'rgba(255,100,117,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, flexShrink: 0,
                  }}>
                    {coin.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{coin.symbol}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Vol {coin.volume}</div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>
                    ${fmtPrice(coin.price)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{coin.marketCap}</div>
                </div>

                {/* 24h change */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: isUp ? '#10d9a0' : '#ff6475',
                    background: isUp ? 'rgba(16,217,160,0.1)' : 'rgba(255,100,117,0.1)',
                    padding: '3px 8px', borderRadius: 7,
                  }}>
                    {isUp ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 16 }}>
        Data powered by CoinGecko · Prices in USD
      </p>
    </>
  );
}
