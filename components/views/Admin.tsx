'use client';

import { useState } from 'react';
import { adminRequests, investors } from '../../lib/appData';
import Card from '../ui/Card';
import Title from '../ui/Title';

interface AdminProps {
  notify: (msg: string) => void;
}

/* ── KYC Application data (demo) ──────────────── */
interface KycApp {
  id:        string;
  name:      string;
  email:     string;
  nationality: string;
  idType:    string;
  submitted: string;
  status:    'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  risk:      'Low' | 'Medium' | 'High';
  pep:       boolean;
  income:    string;
}

const INIT_APPS: KycApp[] = [
  { id: 'KYC-001', name: 'Aung Kyaw Zin',  email: 'aungkyaw@email.com', nationality: 'Myanmar',   idType: 'National ID',  submitted: 'Jun 24, 10:31', status: 'Pending',      risk: 'Medium', pep: false, income: '$25k–$50k' },
  { id: 'KYC-002', name: 'Thida Myint',    email: 'thida.m@email.com',  nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 24, 09:18', status: 'Pending',      risk: 'Low',    pep: false, income: 'Under $25k' },
  { id: 'KYC-003', name: 'Chan Myae Aung', email: 'chanmyae@email.com', nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 24, 08:45', status: 'Under Review', risk: 'High',   pep: true,  income: '$100k–$250k' },
  { id: 'KYC-004', name: 'Su Su Win',      email: 'susuwin@email.com',  nationality: 'Myanmar',   idType: 'National ID',  submitted: 'Jun 23, 17:22', status: 'Pending',      risk: 'Low',    pep: false, income: '$25k–$50k' },
  { id: 'KYC-005', name: 'Zaw Lin Oo',     email: 'zawlin@email.com',   nationality: 'Singapore', idType: 'Passport',     submitted: 'Jun 23, 14:09', status: 'Approved',     risk: 'Medium', pep: false, income: '$50k–$100k' },
  { id: 'KYC-006', name: 'Hnin Wai',       email: 'hninwai@email.com',  nationality: 'Myanmar',   idType: "Driver's Lic", submitted: 'Jun 23, 11:55', status: 'Rejected',     risk: 'High',   pep: true,  income: 'Over $250k' },
  { id: 'KYC-007', name: 'Kyaw Soe Thu',   email: 'kyawsoe@email.com',  nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 22, 16:30', status: 'Approved',     risk: 'Low',    pep: false, income: '$25k–$50k' },
  { id: 'KYC-008', name: 'May Thu Zin',    email: 'maythu@email.com',   nationality: 'Thailand',  idType: 'Passport',     submitted: 'Jun 22, 09:10', status: 'Under Review', risk: 'Medium', pep: false, income: '$50k–$100k' },
];

const STATUS_COLOR: Record<string, string> = {
  Active:           'green',
  Suspended:        'red',
  'KYC Pending':    'gold',
};

const KYC_STATUS_STYLE: Record<KycApp['status'], { bg: string; color: string; label: string }> = {
  'Pending':      { bg: 'rgba(246,201,69,0.12)',  color: '#ffd97a',              label: '⏳ Pending'      },
  'Under Review': { bg: 'rgba(59,130,246,0.12)',  color: 'var(--color-primary)', label: '🔍 Under Review' },
  'Approved':     { bg: 'rgba(16,217,160,0.12)',  color: 'var(--color-accent)',  label: '✓ Approved'     },
  'Rejected':     { bg: 'rgba(255,100,117,0.12)', color: 'var(--color-red)',     label: '✕ Rejected'     },
};

const RISK_COLOR: Record<KycApp['risk'], string> = {
  Low:    'var(--color-accent)',
  Medium: '#ffd97a',
  High:   'var(--color-red)',
};

type Tab       = 'overview' | 'kyc';
type KycFilter = 'All' | KycApp['status'];

/* ────────────────────────────────────────────────
   Main component
──────────────────────────────────────────────── */
export default function Admin({ notify }: AdminProps) {
  const [tab,    setTab]    = useState<Tab>('overview');
  const [apps,   setApps]   = useState<KycApp[]>(INIT_APPS);
  const [filter, setFilter] = useState<KycFilter>('All');
  const [detail, setDetail] = useState<KycApp | null>(null);

  /* ── KYC counts ─────────────────────────────── */
  const pending      = apps.filter(a => a.status === 'Pending').length;
  const underReview  = apps.filter(a => a.status === 'Under Review').length;
  const approved     = apps.filter(a => a.status === 'Approved').length;
  const rejected     = apps.filter(a => a.status === 'Rejected').length;

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter);

  function approve(id: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    setDetail(null);
    notify(`✓ KYC Approved — ${apps.find(a => a.id === id)?.name}`);
  }

  function reject(id: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    setDetail(null);
    notify(`✕ KYC Rejected — ${apps.find(a => a.id === id)?.name}`);
  }

  function review(id: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'Under Review' } : a));
    notify(`🔍 Moved to Under Review — ${apps.find(a => a.id === id)?.name}`);
  }

  return (
    <>
      <Title title="Admin Panel" sub="KYC management & investor records" />

      {/* ── Tab toggle ───────────────────────── */}
      <div className="switch" style={{ marginBottom: 14 }}>
        <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button type="button" className={tab === 'kyc' ? 'active' : ''} onClick={() => setTab('kyc')}>
          KYC Queue {pending > 0 && <span className="badge-pill">{pending}</span>}
        </button>
      </div>

      {/* ── OVERVIEW TAB ────────────────────── */}
      {tab === 'overview' && (
        <>
          <div className="grid">
            <Card title="Investors"   value="179"   />
            <Card title="Requests"    value="14"    />
            <Card title="AUM"         value="$382K" />
            <Card title="Pending KYC" value={String(pending + underReview)} />
          </div>
          <div className="grid">
            <Card title="Active Plans"  value="209"     />
            <Card title="Monthly PnL"   value="+$38.2K" />
            <Card title="Total Fees"    value="$4,820"  />
            <Card title="New (7d)"      value="+12"     />
          </div>

          <h3 style={{ margin: '14px 0 10px', fontSize: 15 }}>Pending Requests</h3>
          {adminRequests.map((r) => (
            <div className="row" key={r.name + r.action}>
              <div>
                <b>{r.name}</b>
                <small>{r.detail}</small>
              </div>
              <button type="button" onClick={() => notify(`${r.name} — ${r.action} saved`)}>
                {r.action}
              </button>
            </div>
          ))}

          <h3 style={{ margin: '14px 0 10px', fontSize: 15 }}>Investor Records</h3>
          {investors.map((i) => {
            const color = STATUS_COLOR[i.status] ?? '';
            return (
              <div className="investor-row" key={i.name}>
                <div className="investor-info">
                  <b>{i.name}</b>
                  <small>{i.plan} · <span className={color}>{i.status}</span></small>
                </div>
                <div className="investor-values">
                  <strong>{i.value}</strong>
                  <span className={i.pnl.startsWith('-') ? 'red' : 'green'}>{i.pnl}</span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── KYC QUEUE TAB ───────────────────── */}
      {tab === 'kyc' && !detail && (
        <>
          {/* Summary cards */}
          <div className="kyc-admin-stats">
            {[
              { label: 'Pending',      count: pending,     color: '#ffd97a'              },
              { label: 'Under Review', count: underReview, color: 'var(--color-primary)' },
              { label: 'Approved',     count: approved,    color: 'var(--color-accent)'  },
              { label: 'Rejected',     count: rejected,    color: 'var(--color-red)'     },
            ].map(s => (
              <div key={s.label} className="kyc-stat-card" style={{ borderColor: s.color + '44' }}>
                <span className="kyc-stat-count" style={{ color: s.color }}>{s.count}</span>
                <span className="kyc-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="kyc-filter-row">
            {(['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as KycFilter[]).map(f => (
              <button
                key={f}
                type="button"
                className={`filter-pill${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Application list */}
          {filtered.length === 0 && (
            <p className="kyc-sub" style={{ textAlign: 'center', padding: '20px 0' }}>No applications</p>
          )}
          {filtered.map(app => {
            const s = KYC_STATUS_STYLE[app.status];
            return (
              <div key={app.id} className="kyc-app-row" onClick={() => setDetail(app)}>
                {/* Avatar */}
                <div className="kyc-avatar">
                  {app.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>

                {/* Info */}
                <div className="kyc-app-info">
                  <div className="kyc-app-name">
                    {app.name}
                    {app.pep && <span className="pep-flag">PEP</span>}
                  </div>
                  <div className="kyc-app-meta">
                    {app.idType} · {app.nationality}
                  </div>
                  <div className="kyc-app-time">{app.submitted}</div>
                </div>

                {/* Status + risk */}
                <div className="kyc-app-right">
                  <span className="kyc-status-pill" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                  <span className="kyc-risk-badge" style={{ color: RISK_COLOR[app.risk] }}>
                    {app.risk} Risk
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── KYC DETAIL PANEL ────────────────── */}
      {tab === 'kyc' && detail && (
        <KycDetail
          app={detail}
          onBack={() => setDetail(null)}
          onApprove={() => approve(detail.id)}
          onReject={() => reject(detail.id)}
          onReview={() => { review(detail.id); setDetail(null); }}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────
   KYC Detail panel
──────────────────────────────────────────────── */
interface DetailProps {
  app:       KycApp;
  onBack:    () => void;
  onApprove: () => void;
  onReject:  () => void;
  onReview:  () => void;
}

function KycDetail({ app, onBack, onApprove, onReject, onReview }: DetailProps) {
  const s = KYC_STATUS_STYLE[app.status];
  const isPending = app.status === 'Pending' || app.status === 'Under Review';

  return (
    <div>
      {/* Back */}
      <button type="button" className="kyc-detail-back" onClick={onBack}>
        ← Back to Queue
      </button>

      {/* Header */}
      <div className="kyc-detail-header">
        <div className="kyc-detail-avatar">
          {app.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <div className="kyc-detail-name">
            {app.name}
            {app.pep && <span className="pep-flag">PEP</span>}
          </div>
          <div className="kyc-app-meta">{app.email}</div>
          <span className="kyc-status-pill" style={{ background: s.bg, color: s.color, marginTop: 6, display: 'inline-block' }}>
            {s.label}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="kyc-detail-grid">
        <DetailRow label="Application ID"  value={app.id} />
        <DetailRow label="Nationality"     value={app.nationality} />
        <DetailRow label="ID Document"     value={app.idType} />
        <DetailRow label="Annual Income"   value={app.income} />
        <DetailRow label="Risk Profile"    value={app.risk} valueColor={RISK_COLOR[app.risk]} />
        <DetailRow label="PEP Status"      value={app.pep ? '⚠️ Yes — Enhanced DD required' : 'No'} valueColor={app.pep ? 'var(--color-red)' : ''} />
        <DetailRow label="Submitted"       value={app.submitted} />
      </div>

      {/* Document preview placeholder */}
      <div className="kyc-doc-preview">
        <span className="upload-icon">🪪</span>
        <span>ID Document — Uploaded</span>
        <button type="button" className="link-btn" style={{ marginLeft: 'auto' }}>View</button>
      </div>

      {/* PEP warning */}
      {app.pep && (
        <div className="kyc-warning" style={{ marginBottom: 12 }}>
          ⚠️ This applicant declared PEP status. Enhanced due diligence is mandatory before approval per AML/CFT regulations.
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="kyc-action-row">
          {app.status === 'Pending' && (
            <button type="button" className="kyc-action-btn review" onClick={onReview}>
              🔍 Mark Under Review
            </button>
          )}
          <button type="button" className="kyc-action-btn reject" onClick={onReject}>
            ✕ Reject
          </button>
          <button type="button" className="kyc-action-btn approve" onClick={onApprove}>
            ✓ Approve
          </button>
        </div>
      )}

      {!isPending && (
        <div className="kyc-closed-note">
          This application is <strong style={{ color: s.color }}>{app.status}</strong>. No further action required.
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value" style={valueColor ? { color: valueColor } : {}}>{value}</span>
    </div>
  );
}
