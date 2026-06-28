export type View = 'home' | 'plans' | 'dashboard' | 'markets' | 'wallet' | 'admin' | 'auth' | 'kyc' | 'gold';
export type Trend = 'up' | 'down' | 'neutral';

/** App-level phase state machine */
export type AppPhase = 'auth' | 'otp' | 'kyc' | 'kyc_pending' | 'app';

/** Context passed through auth / OTP / KYC */
export interface UserCtx {
  name: string;
  email: string;
  phone: string;
  mode: 'login' | 'register';
}

export interface ViewProps {
  notify: (msg: string) => void;
  setView: (view: View) => void;
}

export interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  trend: Trend;
  volume: string;
  high24h: string;
  low24h: string;
}

export interface ProfitTier {
  range: string;
  profit: string;
}

export interface Plan {
  name: string;
  shortName: string;
  tag: string;
  duration: string;
  profitNote: string;
  tiers: ProfitTier[];
  users: number;
  progress: number;
}

export interface Position {
  pair: string;
  side: string;
  entry: string;
  size: string;
  pnl: string;      // dollar amount e.g. "+$315.80"
  pnlPct: string;   // percentage e.g. "+4.21%"
  leverage: string; // "5x" | "-"
  trend: Trend;
}

export interface Transaction {
  id: string;
  type: string;
  date: string;
  note: string;
  amount: string;
  status: 'Approved' | 'Pending' | 'Processing' | 'Failed';
}

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  change: string;
  trend: Trend;
}

export interface Investor {
  name: string;
  value: string;
  plan: string;
  pnl: string;
  status: string;
}

export interface AdminRequest {
  name: string;
  detail: string;
  action: string;
}

export interface Portfolio {
  totalValue: string;
  monthlyPnl: string;
  monthlyPnlPercent: string;
  availableBalance: string;
  activeInvestment: string;
  drawdown: string;
  winRate: string;
  totalTrades: string;
  openPositions: string;
}
