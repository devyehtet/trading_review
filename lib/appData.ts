import type {
  MarketItem, Plan, Position, Transaction,
  WalletAsset, Investor, AdminRequest, Portfolio,
} from './types';

// ─── Notice Board ────────────────────────────────────────────────────────────

export const notices: string[] = [
  'All plans will activate 48 hours after deposit to capital management wallets.',
  'To receive plan benefits, funds must remain deposited for the full period of each plan.',
  'A one-time $1.00 setup fee is required upon application.',
  'An annual fee of $2.00 will be charged each year to maintain the account.',
  'All P2P (peer to peer) transactions are subject to a 0.01% fee.',
  'Please allow 3 to 5 business days for all withdrawal requests to be processed.',
];

// ─── Portfolio Summary ────────────────────────────────────────────────────────

export const portfolio: Portfolio = {
  totalValue:       '$48,621.74',
  monthlyPnl:       '+$3,841.20',
  monthlyPnlPercent: '+8.58%',
  availableBalance:  '$8,340.00',
  activeInvestment:  '$40,281.74',
  drawdown:          '-2.84%',
  winRate:           '67%',
  totalTrades:       '214',
  openPositions:     '5',
};

// ─── Market Data (15 pairs) ───────────────────────────────────────────────────

export const marketData: MarketItem[] = [
  {
    symbol: 'BTC/USDT',  name: 'Bitcoin',
    price: '$64,820.40', change: '+2.41%', trend: 'up',
    volume: '$42.8B',    high24h: '$65,440.00', low24h: '$63,100.00',
  },
  {
    symbol: 'ETH/USDT',  name: 'Ethereum',
    price: '$3,485.20',  change: '+1.18%', trend: 'up',
    volume: '$18.1B',    high24h: '$3,512.80',  low24h: '$3,401.50',
  },
  {
    symbol: 'BNB/USDT',  name: 'BNB',
    price: '$612.51',    change: '+0.52%', trend: 'up',
    volume: '$1.4B',     high24h: '$618.90',    low24h: '$604.20',
  },
  {
    symbol: 'SOL/USDT',  name: 'Solana',
    price: '$142.88',    change: '-0.74%', trend: 'down',
    volume: '$3.6B',     high24h: '$147.30',    low24h: '$140.10',
  },
  {
    symbol: 'XRP/USDT',  name: 'XRP',
    price: '$2.4820',    change: '+3.12%', trend: 'up',
    volume: '$5.2B',     high24h: '$2.5240',    low24h: '$2.3880',
  },
  {
    symbol: 'ADA/USDT',  name: 'Cardano',
    price: '$0.9240',    change: '-1.05%', trend: 'down',
    volume: '$0.8B',     high24h: '$0.9440',    low24h: '$0.9060',
  },
  {
    symbol: 'DOGE/USDT', name: 'Dogecoin',
    price: '$0.3518',    change: '+1.88%', trend: 'up',
    volume: '$2.1B',     high24h: '$0.3620',    low24h: '$0.3402',
  },
  {
    symbol: 'AVAX/USDT', name: 'Avalanche',
    price: '$38.42',     change: '-2.34%', trend: 'down',
    volume: '$0.6B',     high24h: '$39.80',     low24h: '$37.60',
  },
  {
    symbol: 'LINK/USDT', name: 'Chainlink',
    price: '$18.54',     change: '+0.91%', trend: 'up',
    volume: '$0.5B',     high24h: '$18.82',     low24h: '$18.10',
  },
  {
    symbol: 'DOT/USDT',  name: 'Polkadot',
    price: '$8.24',      change: '-0.48%', trend: 'down',
    volume: '$0.3B',     high24h: '$8.42',      low24h: '$8.08',
  },
  {
    symbol: 'UNI/USDT',  name: 'Uniswap',
    price: '$12.84',     change: '+2.20%', trend: 'up',
    volume: '$0.4B',     high24h: '$13.10',     low24h: '$12.50',
  },
  {
    symbol: 'LTC/USDT',  name: 'Litecoin',
    price: '$98.24',     change: '+0.74%', trend: 'up',
    volume: '$0.7B',     high24h: '$99.80',     low24h: '$96.40',
  },
  {
    symbol: 'ATOM/USDT', name: 'Cosmos',
    price: '$9.38',      change: '-1.62%', trend: 'down',
    volume: '$0.2B',     high24h: '$9.64',      low24h: '$9.18',
  },
  {
    symbol: 'XAU/USD',   name: 'Gold CFD',
    price: '$2,358.30',  change: '+0.36%', trend: 'up',
    volume: '$9.2B',     high24h: '$2,371.50',  low24h: '$2,344.80',
  },
  {
    symbol: 'XAG/USD',   name: 'Silver CFD',
    price: '$29.84',     change: '-0.22%', trend: 'down',
    volume: '$1.1B',     high24h: '$30.24',     low24h: '$29.60',
  },
];

// ─── Investment Plans ─────────────────────────────────────────────────────────

export const plans: Plan[] = [
  {
    name: 'M Plan',   shortName: 'M',
    tag: 'Monthly',   duration: '1 Month',
    profitNote: '',
    tiers: [
      { range: '10 ~ 3,000 USDT',    profit: '30%' },
      { range: '3,010 ~ 30,000 USDT', profit: '35%' },
      { range: 'Above 30,010 USDT',  profit: '40%' },
    ],
    users: 118, progress: 68,
  },
  {
    name: 'Q Plan',   shortName: 'Q',
    tag: '6 Months',  duration: '6 Months',
    profitNote: 'per month',
    tiers: [
      { range: '10 ~ 3,000 USDT',    profit: '40%' },
      { range: '3,010 ~ 30,000 USDT', profit: '45%' },
      { range: 'Above 30,010 USDT',  profit: '50%' },
    ],
    users: 72, progress: 55,
  },
  {
    name: 'Y Plan',   shortName: 'Y',
    tag: 'Yearly',    duration: '1 Year (12 Months)',
    profitNote: 'per month',
    tiers: [
      { range: '10 ~ 3,000 USDT',    profit: '50%' },
      { range: '3,010 ~ 30,000 USDT', profit: '55%' },
      { range: 'Above 30,010 USDT',  profit: '60%' },
    ],
    users: 19, progress: 25,
  },
];

// ─── Open Positions ───────────────────────────────────────────────────────────

export const positions: Position[] = [
  {
    pair: 'BTCUSDT',  side: 'Long',
    entry: '$62,440', size: '$7,500',
    pnl: '+$315.80',  pnlPct: '+4.21%',
    leverage: '5x',   trend: 'up',
  },
  {
    pair: 'ETHUSDT',  side: 'Long',
    entry: '$3,320',  size: '$4,200',
    pnl: '+$87.36',   pnlPct: '+2.08%',
    leverage: '3x',   trend: 'up',
  },
  {
    pair: 'SOLUSDT',  side: 'Short',
    entry: '$145.10', size: '$2,100',
    pnl: '+$15.54',   pnlPct: '+0.74%',
    leverage: '2x',   trend: 'down',
  },
  {
    pair: 'BNBUSDT',  side: 'Long',
    entry: '$598.40', size: '$1,800',
    pnl: '+$42.33',   pnlPct: '+2.35%',
    leverage: '2x',   trend: 'up',
  },
  {
    pair: 'XRPUSDT',  side: 'Long',
    entry: '$2.3210', size: '$1,200',
    pnl: '+$19.44',   pnlPct: '+1.62%',
    leverage: '3x',   trend: 'up',
  },
  {
    pair: 'USDT Reserve', side: 'Cash',
    entry: '—',       size: '$7,455',
    pnl: '$0.00',     pnlPct: '15.3%',
    leverage: '—',    trend: 'neutral',
  },
];

// ─── Wallet Assets ────────────────────────────────────────────────────────────

export const walletAssets: WalletAsset[] = [
  { symbol: 'USDT', name: 'Tether',   balance: '8,340.00', usdValue: '$8,340.00',  change: '+0.00%', trend: 'neutral' },
  { symbol: 'BTC',  name: 'Bitcoin',  balance: '0.2841',   usdValue: '$18,412.50', change: '+2.41%', trend: 'up'      },
  { symbol: 'ETH',  name: 'Ethereum', balance: '4.8820',   usdValue: '$17,016.26', change: '+1.18%', trend: 'up'      },
  { symbol: 'BNB',  name: 'BNB',      balance: '8.4200',   usdValue: '$5,157.53',  change: '+0.52%', trend: 'up'      },
  { symbol: 'SOL',  name: 'Solana',   balance: '24.600',   usdValue: '$3,514.85',  change: '-0.74%', trend: 'down'    },
];

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions: Transaction[] = [
  { id: 'txn-010', type: 'USDT Deposit',       date: 'Jun 24, 2026', note: 'TRC20 · TX 8fa2...91c4',        amount: '+$2,000.00', status: 'Approved'   },
  { id: 'txn-009', type: 'Profit Credit',       date: 'Jun 23, 2026', note: 'Y Plan monthly distribution',   amount: '+$641.80',   status: 'Approved'   },
  { id: 'txn-008', type: 'Profit Credit',       date: 'Jun 23, 2026', note: 'M Plan settlement',              amount: '+$245.40',   status: 'Approved'   },
  { id: 'txn-007', type: 'Admin Fee',           date: 'Jun 23, 2026', note: 'Performance fee (M Plan)',       amount: '-$105.60',   status: 'Approved'   },
  { id: 'txn-006', type: 'Withdrawal',          date: 'Jun 20, 2026', note: 'Bank wire · REF #AV-20220',     amount: '-$1,500.00', status: 'Approved'   },
  { id: 'txn-005', type: 'Withdrawal Request',  date: 'Jun 18, 2026', note: 'TRC20 wallet · pending review', amount: '-$500.00',   status: 'Processing' },
  { id: 'txn-004', type: 'P2P Transfer',        date: 'Jun 15, 2026', note: 'Transfer to Investor 204',      amount: '-$200.00',   status: 'Approved'   },
  { id: 'txn-003', type: 'Setup Fee',           date: 'Jun 10, 2026', note: 'One-time account setup',        amount: '-$1.00',     status: 'Approved'   },
  { id: 'txn-002', type: 'USDT Deposit',        date: 'Jun 8, 2026',  note: 'TRC20 · TX 3d91...f44a',        amount: '+$5,000.00', status: 'Approved'   },
  { id: 'txn-001', type: 'Account Created',     date: 'Jun 1, 2026',  note: 'KYC verified',                  amount: '—',          status: 'Approved'   },
];

// ─── Investors ────────────────────────────────────────────────────────────────

export const investors: Investor[] = [
  { name: 'Ye Htet',       value: '$48,621', plan: 'Y Plan',  pnl: '+8.58%',  status: 'Active'      },
  { name: 'Aung Ko',       value: '$22,400', plan: 'Q Plan',  pnl: '+5.22%',  status: 'Active'      },
  { name: 'Moe Trading',   value: '$18,900', plan: 'Y Plan',  pnl: '-0.62%',  status: 'KYC Pending' },
  { name: 'Su Su Lwin',    value: '$12,500', plan: 'M Plan',  pnl: '+3.44%',  status: 'Active'      },
  { name: 'Investor 204',  value: '$8,420',  plan: 'M Plan',  pnl: '+1.14%',  status: 'Active'      },
  { name: 'Kyaw Zin',      value: '$6,800',  plan: 'Q Plan',  pnl: '+4.80%',  status: 'Active'      },
  { name: 'Investor 118',  value: '$5,000',  plan: 'M Plan',  pnl: '+3.77%',  status: 'Active'      },
  { name: 'Thida Aye',     value: '$3,200',  plan: 'M Plan',  pnl: '+2.10%',  status: 'Suspended'   },
];

// ─── Admin Requests ───────────────────────────────────────────────────────────

export const adminRequests: AdminRequest[] = [
  { name: 'Ye Htet',      detail: 'Y Plan deposit $2,000 • USDT TRC20',    action: 'Approve' },
  { name: 'Aung Ko',      detail: 'Q Plan upgrade $5,000 • BEP20',         action: 'Approve' },
  { name: 'Moe Trading',  detail: 'KYC — proof of address upload',          action: 'Verify'  },
  { name: 'Investor 204', detail: 'Withdrawal $500 • Bank wire',            action: 'Review'  },
  { name: 'Su Su Lwin',   detail: 'P2P transfer $300 • fee 0.01%',          action: 'Review'  },
  { name: 'Thida Aye',    detail: 'Account suspension appeal',               action: 'Review'  },
];
