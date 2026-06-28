/**
 * lib/store.ts
 * Supabase-backed event store.
 * Tables: nc_deposits, nc_kyc_events, nc_activities
 */

import { supabase } from './supabase';

/* ── Types ──────────────────────────────────── */
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
}

export interface StoreKyc {
  id:          string;
  name:        string;
  email:       string;
  nationality: string;
  submittedAt: string;
  status:      'Pending' | 'Approved' | 'Rejected';
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
  }));
}

export async function addDeposit(
  userName: string,
  userEmail: string,
  type: 'Deposit' | 'Withdrawal',
  amountNum: number,
  method: string,
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
  }));
}

export async function addKycEvent(
  name: string,
  email: string,
  nationality: string,
): Promise<StoreKyc> {
  const entry: StoreKyc = {
    id:          `KYC-APP-${uid().toUpperCase()}`,
    name,
    email,
    nationality,
    submittedAt: now(),
    status:      'Pending',
  };

  await supabase.from('nc_kyc_events').insert({
    id:           entry.id,
    name:         entry.name,
    email:        entry.email,
    nationality:  entry.nationality,
    submitted_at: entry.submittedAt,
    status:       entry.status,
  });

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
