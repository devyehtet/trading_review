/**
 * lib/store.ts
 * Supabase-backed event store.
 * Tables: nc_deposits, nc_kyc_events, nc_activities
 */

import { supabase } from './supabase';

/* ── Types ──────────────────────────────────── */
export type InvestPlan = 'M' | 'Q' | 'Y';

export interface StoreDeposit {
  id:        string;
  userName:  string;
  userEmail: string;
  type:      'Deposit' | 'Withdrawal';
  amount:    string;
  amountNum: number;
  method:    string;
  timestamp: string;
  status:    'Pending' | 'Processing' | 'Approved' | 'Failed';
  plan:      InvestPlan;
}

export interface StoreDailyResult {
  id:           string;
  date:         string;
  tradePercent: number;  // positive = profit, negative = loss
  note:         string;
  timestamp:    string;
}

/* ── Margin ratio helper ─────────────────────── */
export function getMarginRatio(plan: InvestPlan, amount: number): number {
  if (plan === 'M') {
    if (amount <= 3000)  return 0.30;
    if (amount <= 30000) return 0.35;
    return 0.40;
  }
  if (plan === 'Q') {
    if (amount <= 3000)  return 0.40;
    if (amount <= 30000) return 0.45;
    return 0.50;
  }
  // Y
  if (amount <= 3000)  return 0.50;
  if (amount <= 30000) return 0.55;
  return 0.60;
}

export function getPlanLabel(plan: InvestPlan): string {
  return plan === 'M' ? 'Monthly (1 month)' : plan === 'Q' ? 'Quarterly (6 months)' : 'Yearly (12 months)';
}

export interface StoreKyc {
  id:          string;
  name:        string;
  email:       string;
  nationality: string;
  submittedAt: string;
  status:      'Pending' | 'Approved' | 'Rejected';
  docUrl?:     string;
}

export interface StoreActivity {
  id:        string;
  type:      'deposit' | 'withdrawal' | 'kyc' | 'login' | 'invest';
  user:      string;
  detail:    string;
  amount?:   string;
  timestamp: string;
}

/* ── Helpers ────────────────────────────────── */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function now(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Deposits ───────────────────────────────── */
export async function getDeposits(): Promise<StoreDeposit[]> {
  const { data, error } = await supabase
    .from('nc_deposits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) { console.error('getDeposits:', error.message); return []; }
  return (data ?? []).map(r => ({
    id:        r.id,
    userName:  r.user_name,
    userEmail: r.user_email,
    type:      r.type,
    amount:    r.amount,
    amountNum: r.amount_num,
    method:    r.method,
    timestamp: r.timestamp,
    status:    r.status,
    plan:      (r.plan ?? 'M') as InvestPlan,
  }));
}

export async function addDeposit(
  userName: string,
  userEmail: string,
  type: 'Deposit' | 'Withdrawal',
  amountNum: number,
  method: string,
  plan: InvestPlan = 'M',
): Promise<StoreDeposit> {
  const entry: StoreDeposit = {
    id:        `DEP-${uid().toUpperCase()}`,
    userName,
    userEmail,
    type,
    amountNum,
    amount:    `$${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    method,
    timestamp: now(),
    status:    'Pending',
    plan,
  };

  await supabase.from('nc_deposits').insert({
    id:         entry.id,
    user_name:  entry.userName,
    user_email: entry.userEmail,
    type:       entry.type,
    amount:     entry.amount,
    amount_num: entry.amountNum,
    method:     entry.method,
    timestamp:  entry.timestamp,
    status:     entry.status,
    plan:       entry.plan,
  });

  await addActivity({
    type:   type === 'Deposit' ? 'deposit' : 'withdrawal',
    user:   userName || userEmail,
    detail: `${type} via ${method}`,
    amount: entry.amount,
  });

  return entry;
}

/* ── KYC events ─────────────────────────────── */
export async function getKycEvents(): Promise<StoreKyc[]> {
  const { data, error } = await supabase
    .from('nc_kyc_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) { console.error('getKycEvents:', error.message); return []; }
  return (data ?? []).map(r => ({
    id:          r.id,
    name:        r.name,
    email:       r.email,
    nationality: r.nationality,
    submittedAt: r.submitted_at,
    status:      r.status,
    docUrl:      r.doc_url ?? undefined,
  }));
}

export async function addKycEvent(
  name: string,
  email: string,
  nationality: string,
  docUrl?: string,
): Promise<StoreKyc> {
  const entry: StoreKyc = {
    id:          `KYC-APP-${uid().toUpperCase()}`,
    name,
    email,
    nationality,
    submittedAt: now(),
    status:      'Pending',
  };

  const { error: kycErr } = await supabase.from('nc_kyc_events').insert({
    id:           entry.id,
    name:         entry.name,
    email:        entry.email,
    nationality:  entry.nationality,
    submitted_at: entry.submittedAt,
    status:       entry.status,
    doc_url:      docUrl ?? null,
  });

  if (kycErr) {
    console.error('addKycEvent insert failed:', kycErr.message, kycErr.code);
    throw new Error(`KYC save failed: ${kycErr.message}`);
  }

  await addActivity({
    type:   'kyc',
    user:   name || email,
    detail: 'KYC application submitted',
  });

  return entry;
}

/* ── Activity log ───────────────────────────── */
export async function getActivities(): Promise<StoreActivity[]> {
  const { data, error } = await supabase
    .from('nc_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) { console.error('getActivities:', error.message); return []; }
  return (data ?? []).map(r => ({
    id:        r.id,
    type:      r.type,
    user:      r.user,
    detail:    r.detail,
    amount:    r.amount ?? undefined,
    timestamp: r.timestamp,
  }));
}

export async function addActivity(
  partial: Omit<StoreActivity, 'id' | 'timestamp'>,
): Promise<StoreActivity> {
  const entry: StoreActivity = {
    ...partial,
    id:        uid(),
    timestamp: now(),
  };

  await supabase.from('nc_activities').insert({
    id:        entry.id,
    type:      entry.type,
    user:      entry.user,
    detail:    entry.detail,
    amount:    entry.amount ?? null,
    timestamp: entry.timestamp,
  });

  return entry;
}

export async function addLoginActivity(user: string): Promise<void> {
  await addActivity({ type: 'login', user, detail: 'User signed in' });
}

/* ── KYC status update (admin) ───────────────── */
export async function updateKycStatus(
  id: string,
  status: 'Approved' | 'Rejected' | 'Pending',
): Promise<void> {
  const { error } = await supabase
    .from('nc_kyc_events')
    .update({ status })
    .eq('id', id);
  if (error) console.error('updateKycStatus:', error.message);
}

/* ── Trade Results ───────────────────────────── */
export interface StoreTradeResult {
  id:         string;
  userEmail:  string;
  userName:   string;
  tradeType:  'win' | 'loss';
  amount:     number;
  pnlPercent: number;
  note:       string;
  timestamp:  string;
}

export async function addTradeResult(
  userEmail: string,
  userName: string,
  tradeType: 'win' | 'loss',
  amount: number,
  pnlPercent: number,
  note: string,
): Promise<StoreTradeResult> {
  const entry: StoreTradeResult = {
    id: `TR-${uid().toUpperCase()}`,
    userEmail, userName, tradeType, amount, pnlPercent, note,
    timestamp: now(),
  };
  await supabase.from('nc_trade_results').insert({
    id:          entry.id,
    user_email:  entry.userEmail,
    user_name:   entry.userName,
    trade_type:  entry.tradeType,
    amount:      entry.amount,
    pnl_percent: entry.pnlPercent,
    note:        entry.note,
    timestamp:   entry.timestamp,
  });
  return entry;
}

export async function getTradeResults(): Promise<StoreTradeResult[]> {
  const { data, error } = await supabase
    .from('nc_trade_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) { console.error('getTradeResults:', error.message); return []; }
  return (data ?? []).map(r => ({
    id:         r.id,
    userEmail:  r.user_email,
    userName:   r.user_name,
    tradeType:  r.trade_type,
    amount:     r.amount,
    pnlPercent: r.pnl_percent,
    note:       r.note,
    timestamp:  r.timestamp,
  }));
}

export async function getTradeResultsByEmail(email: string): Promise<StoreTradeResult[]> {
  const { data, error } = await supabase
    .from('nc_trade_results')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) { console.error('getTradeResultsByEmail:', error.message); return []; }
  return (data ?? []).map(r => ({
    id:         r.id,
    userEmail:  r.user_email,
    userName:   r.user_name,
    tradeType:  r.trade_type,
    amount:     r.amount,
    pnlPercent: r.pnl_percent,
    note:       r.note,
    timestamp:  r.timestamp,
  }));
}

export async function getDepositsByEmail(email: string): Promise<StoreDeposit[]> {
  const { data, error } = await supabase
    .from('nc_deposits')
    .select('*')
    .eq('user_email', email)
    .eq('type', 'Deposit')
    .order('created_at', { ascending: false });
  if (error) { console.error('getDepositsByEmail:', error.message); return []; }
  return (data ?? []).map(r => ({
    id: r.id, userName: r.user_name, userEmail: r.user_email,
    type: r.type, amount: r.amount, amountNum: r.amount_num,
    method: r.method, timestamp: r.timestamp, status: r.status,
    plan: (r.plan ?? 'M') as InvestPlan,
  }));
}

/* ── Daily Trade Results (global) ────────────── */
export async function getDailyResults(): Promise<StoreDailyResult[]> {
  const { data, error } = await supabase
    .from('nc_daily_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(365);
  if (error) { console.error('getDailyResults:', error.message); return []; }
  return (data ?? []).map(r => ({
    id:           r.id,
    date:         r.date,
    tradePercent: r.trade_percent,
    note:         r.note ?? '',
    timestamp:    r.timestamp ?? '',
  }));
}

export async function addDailyResult(
  date: string,
  tradePercent: number,
  note: string,
): Promise<StoreDailyResult> {
  const entry: StoreDailyResult = {
    id:           `DR-${uid().toUpperCase()}`,
    date,
    tradePercent,
    note,
    timestamp:    now(),
  };
  await supabase.from('nc_daily_results').insert({
    id:            entry.id,
    date:          entry.date,
    trade_percent: entry.tradePercent,
    note:          entry.note,
    timestamp:     entry.timestamp,
  });
  return entry;
}

/* ── Poll KYC status by email (user side) ────── */
export async function getKycStatusByEmail(
  email: string,
): Promise<'Pending' | 'Approved' | 'Rejected' | null> {
  const { data, error } = await supabase
    .from('nc_kyc_events')
    .select('status')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.status as 'Pending' | 'Approved' | 'Rejected';
}
