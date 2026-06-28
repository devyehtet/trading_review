'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoIcon from '../../../components/ui/LogoIcon';
import { adminRequests, investors } from '../../../lib/appData';
import type { AdminRequest, Investor } from '../../../lib/types';

/* ─────────────────────────────────────────────────
   KYC Application data
───────────────────────────────────────────────── */
interface KycApp {
  id:          string;
  name:        string;
  email:       string;
  nationality: string;
  idType:      string;
  submitted:   string;
  status:      'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  risk:        'Low' | 'Medium' | 'High';
  pep:         boolean;
  income:      string;
}

const INIT_APPS: KycApp[] = [
  { id: 'KYC-001', name: 'Aung Kyaw Zin',  email: 'aungkyaw@email.com',  nationality: 'Myanmar',   idType: 'National ID',  submitted: 'Jun 24, 10:31', status: 'Pending',      risk: 'Medium', pep: false, income: '$25k–$50k'   },
  { id: 'KYC-002', name: 'Thida Myint',    email: 'thida.m@email.com',   nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 24, 09:18', status: 'Pending',      risk: 'Low',    pep: false, income: 'Under $25k'  },
  { id: 'KYC-003', name: 'Chan Myae Aung', email: 'chanmyae@email.com',  nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 24, 08:45', status: 'Under Review', risk: 'High',   pep: true,  income: '$100k–$250k' },
  { id: 'KYC-004', name: 'Su Su Win',      email: 'susuwin@email.com',   nationality: 'Myanmar',   idType: 'National ID',  submitted: 'Jun 23, 17:22', status: 'Pending',      risk: 'Low',    pep: false, income: '$25k–$50k'   },
  { id: 'KYC-005', name: 'Zaw Lin Oo',     email: 'zawlin@email.com',    nationality: 'Singapore', idType: 'Passport',     submitted: 'Jun 23, 14:09', status: 'Approved',     risk: 'Medium', pep: false, income: '$50k–$100k'  },
  { id: 'KYC-006', name: 'Hnin Wai',       email: 'hninwai@email.com',   nationality: 'Myanmar',   idType: "Driver's Lic", submitted: 'Jun 23, 11:55', status: 'Rejected',     risk: 'High',   pep: true,  income: 'Over $250k'  },
  { id: 'KYC-007', name: 'Kyaw Soe Thu',   email: 'kyawsoe@email.com',   nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 22, 16:30', status: 'Approved',     risk: 'Low',    pep: false, income: '$25k–$50k'   },
  { id: 'KYC-008', name: 'May Thu Zin',    email: 'maythu@email.com',    nationality: 'Thailand',  idType: 'Passport',     submitted: 'Jun 22, 09:10', status: 'Under Review', risk: 'Medium', pep: false, income: '$50k–$100k'  },
  { id: 'KYC-009', name: 'Pyae Sone Aung', email: 'pyaesone@email.com',  nationality: 'Myanmar',   idType: 'National ID',  submitted: 'Jun 21, 14:22', status: 'Pending',      risk: 'Low',    pep: false, income: '$25k–$50k'   },
  { id: 'KYC-010', name: 'Ei Phyu Win',    email: 'eiphyu@email.com',    nationality: 'Myanmar',   idType: 'Passport',     submitted: 'Jun 21, 11:05', status: 'Approved',     risk: 'Medium', pep: false, income: '$50k–$100k'  },
];

type AdminTab  = 'overview' | 'kyc' | 'investors';
type KycFilter = 'All' | KycApp['status'];

const STATUS_COLOR: Record<string, string> = {
  Active:        '#10d9a0',
  Suspended:     '#ff6475',
  'KYC Pending': '#ffd97a',
};

const KYC_STYLE: Record<KycApp['status'], { bg: string; color: string; label: string }> = {
  'Pending':      { bg: 'rgba(246,201,69,0.14)',  color: '#ffd97a',  label: '⏳ Pending'      },
  'Under Review': { bg: 'rgba(59,130,246,0.14)',  color: '#60a5fa',  label: '🔍 Under Review' },
  'Approved':     { bg: 'rgba(16,217,160,0.14)',  color: '#10d9a0',  label: '✓ Approved'     },
  'Rejected':     { bg: 'rgba(255,100,117,0.14)', color: '#ff6475',  label: '✕ Rejected'     },
};

const RISK_COLOR: Record<KycApp['risk'], string> = {
  Low: '#10d9a0', Medium: '#ffd97a', High: '#ff6475',
};

/* ─────────────────────────────────────────────────
   Main admin page
───────────────────────────────────────────────── */
export default function AdminPage() {
  const router  = useRouter();
  const [tab,    setTab]    = useState<AdminTab>('overview');
  const [apps,   setApps]   = useState<KycApp[]>(INIT_APPS);
  const [filter, setFilter] = useState<KycFilter>('All');
  const [detail, setDetail] = useState<KycApp | null>(null);
  const [toast,  setToast]  = useState('');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function approve(id: string) {
    const name = apps.find(a => a.id === id)?.name;
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    setDetail(null);
    notify(`✓ Approved — ${name}`);
  }

  function reject(id: string) {
    const name = apps.find(a => a.id === id)?.name;
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    setDetail(null);
    notify(`✕ Rejected — ${name}`);
  }

  function markReview(id: string) {
    const name = apps.find(a => a.id === id)?.name;
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'Under Review' } : a));
    setDetail(d => d?.id === id ? { ...d, status: 'Under Review' } : d);
    notify(`🔍 Under Review — ${name}`);
  }

  const pending     = apps.filter(a => a.status === 'Pending').length;
  const underReview = apps.filter(a => a.status === 'Under Review').length;
  const approved    = apps.filter(a => a.status === 'Approved').length;
  const rejected    = apps.filter(a => a.status === 'Rejected').length;
  const filtered    = filter === 'All' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="ap-root">

      {/* ── Sidebar ─────────────────────────── */}
      <aside className="ap-sidebar">
        <div className="ap-sidebar-brand">
          <LogoIcon size={36} />
          <div>
            <b className="brand-wordmark" style={{ fontSize: 16 }}>
              <span className="brand-nexora">nexora</span>
              <span className="brand-capi">capi</span>
            </b>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>
              Admin Portal
            </span>
          </div>
        </div>

        <nav className="ap-nav">
          {([
            { id: 'overview',  icon: '📊', label: 'Overview'    },
            { id: 'kyc',       icon: '🪪', label: 'KYC Queue', badge: pending + underReview },
            { id: 'investors', icon: '👥', label: 'Investors'   },
          ] as { id: AdminTab; icon: string; label: string; badge?: number }[]).map(item => (
            <button
              key={item.id}
              type="button"
              className={`ap-nav-item${tab === item.id ? ' active' : ''}`}
              onClick={() => { setTab(item.id); setDetail(null); }}
            >
              <span className="ap-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <span className="ap-nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <button type="button" className="ap-logout" onClick={() => router.push('/admin/login')}>
            🚪 Sign Out
          </button>
          <a href="/" className="ap-back-app">← View App</a>
        </div>
      </aside>

      {/* ── Main content ────────────────────── */}
      <main className="ap-main">

        {/* Top bar */}
        <div className="ap-topbar">
          <div>
            <h1 className="ap-page-title">
              {tab === 'overview'  && 'Overview'}
              {tab === 'kyc'       && 'KYC Queue'}
              {tab === 'investors' && 'Investor Records'}
            </h1>
            <p className="ap-page-sub">NexoraCapi Admin Panel · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="ap-admin-badge">⚙️ Admin</div>
        </div>

        {/* ── OVERVIEW ──────────────────────── */}
        {tab === 'overview' && (
          <>
            {/* Stat grid */}
            <div className="ap-stat-grid">
              {[
                { label: 'Total Investors', value: '179',    color: '#60a5fa', icon: '👥' },
                { label: 'Assets Under Mgmt', value: '$382K', color: '#10d9a0', icon: '💰' },
                { label: 'Pending KYC',     value: String(pending + underReview), color: '#ffd97a', icon: '⏳' },
                { label: 'Monthly PnL',     value: '+$38.2K', color: '#10d9a0', icon: '📈' },
                { label: 'Active Plans',    value: '209',    color: '#a78bfa', icon: '📋' },
                { label: 'New (7 days)',     value: '+12',    color: '#60a5fa', icon: '🆕' },
                { label: 'Total Fees',      value: '$4,820', color: '#ffd97a', icon: '💳' },
                { label: 'KYC Approved',    value: String(approved), color: '#10d9a0', icon: '✓' },
              ].map(s => (
                <div key={s.label} className="ap-stat-card">
                  <div className="ap-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <div className="ap-stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="ap-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* KYC status summary */}
            <div className="ap-section-title">KYC Status Breakdown</div>
            <div className="ap-kyc-summary">
              {[
                { label: 'Pending',      count: pending,     color: '#ffd97a' },
                { label: 'Under Review', count: underReview, color: '#60a5fa' },
                { label: 'Approved',     count: approved,    color: '#10d9a0' },
                { label: 'Rejected',     count: rejected,    color: '#ff6475' },
              ].map(s => (
                <div key={s.label} className="ap-kyc-summary-card" style={{ borderLeftColor: s.color }}>
                  <span className="ap-kyc-count" style={{ color: s.color }}>{s.count}</span>
                  <span className="ap-kyc-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Pending requests */}
            <div className="ap-section-title">Pending Requests</div>
            <div className="ap-table">
              <div className="ap-table-head">
                <span>Name</span><span>Detail</span><span>Action</span>
              </div>
              {adminRequests.map((r: AdminRequest) => (
                <div key={r.name} className="ap-table-row">
                  <span className="ap-table-name">{r.name}</span>
                  <span className="ap-table-detail">{r.detail}</span>
                  <button type="button" className="ap-action-sm" onClick={() => notify(`${r.name} — ${r.action} saved`)}>
                    {r.action}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── KYC QUEUE ─────────────────────── */}
        {tab === 'kyc' && (
          <>
            {/* Filter + search */}
            <div className="ap-kyc-toolbar">
              <div className="ap-filter-pills">
                {(['All', 'Pending', 'Under Review', 'Approved', 'Rejected'] as KycFilter[]).map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`ap-filter-pill${filter === f ? ' active' : ''}`}
                    onClick={() => { setFilter(f); setDetail(null); }}
                  >
                    {f}
                    {f === 'Pending'      && pending     > 0 && <span className="ap-pill-count">{pending}</span>}
                    {f === 'Under Review' && underReview > 0 && <span className="ap-pill-count">{underReview}</span>}
                  </button>
                ))}
              </div>
              <span className="ap-result-count">{filtered.length} applications</span>
            </div>

            <div className="ap-kyc-layout">
              {/* List */}
              <div className="ap-kyc-list">
                {filtered.map(app => {
                  const s = KYC_STYLE[app.status];
                  return (
                    <div
                      key={app.id}
                      className={`ap-kyc-row${detail?.id === app.id ? ' selected' : ''}`}
                      onClick={() => setDetail(app)}
                    >
                      <div className="ap-kyc-avatar">
                        {app.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div className="ap-kyc-info">
                        <div className="ap-kyc-name">
                          {app.name}
                          {app.pep && <span className="ap-pep-flag">PEP</span>}
                        </div>
                        <div className="ap-kyc-meta">{app.email}</div>
                        <div className="ap-kyc-meta">{app.idType} · {app.nationality}</div>
                      </div>
                      <div className="ap-kyc-right">
                        <span className="ap-status-pill" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                        <span className="ap-risk" style={{ color: RISK_COLOR[app.risk] }}>
                          {app.risk} Risk
                        </span>
                        <span className="ap-time">{app.submitted}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail panel */}
              {detail && (
                <div className="ap-kyc-detail">
                  <div className="ap-detail-header">
                    <div className="ap-detail-avatar">
                      {detail.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="ap-detail-name">
                        {detail.name}
                        {detail.pep && <span className="ap-pep-flag">PEP</span>}
                      </div>
                      <div className="ap-detail-email">{detail.email}</div>
                      <span className="ap-status-pill" style={{
                        background: KYC_STYLE[detail.status].bg,
                        color: KYC_STYLE[detail.status].color,
                        marginTop: 6, display: 'inline-block'
                      }}>
                        {KYC_STYLE[detail.status].label}
                      </span>
                    </div>
                  </div>

                  <div className="ap-detail-fields">
                    {[
                      { label: 'Application ID', value: detail.id },
                      { label: 'Nationality',    value: detail.nationality },
                      { label: 'ID Document',    value: detail.idType },
                      { label: 'Annual Income',  value: detail.income },
                      { label: 'Risk Profile',   value: detail.risk,  color: RISK_COLOR[detail.risk] },
                      { label: 'PEP Status',     value: detail.pep ? '⚠️ Yes' : 'No', color: detail.pep ? '#ff6475' : '' },
                      { label: 'Submitted',      value: detail.submitted },
                    ].map(f => (
                      <div key={f.label} className="ap-detail-row">
                        <span className="ap-detail-label">{f.label}</span>
                        <span className="ap-detail-value" style={f.color ? { color: f.color } : {}}>{f.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Document */}
                  <div className="ap-doc-row">
                    <span>🪪</span>
                    <span>ID Document — Uploaded</span>
                    <button type="button" className="ap-link-btn">View</button>
                  </div>

                  {detail.pep && (
                    <div className="ap-pep-warning">
                      ⚠️ PEP declared. Enhanced due diligence required before approval per AML/CFT regulations.
                    </div>
                  )}

                  {/* Action buttons */}
                  {(detail.status === 'Pending' || detail.status === 'Under Review') && (
                    <div className="ap-actions">
                      {detail.status === 'Pending' && (
                        <button type="button" className="ap-btn review" onClick={() => markReview(detail.id)}>
                          🔍 Mark Under Review
                        </button>
                      )}
                      <button type="button" className="ap-btn reject" onClick={() => reject(detail.id)}>
                        ✕ Reject
                      </button>
                      <button type="button" className="ap-btn approve" onClick={() => approve(detail.id)}>
                        ✓ Approve
                      </button>
                    </div>
                  )}

                  {(detail.status === 'Approved' || detail.status === 'Rejected') && (
                    <div className="ap-closed-note">
                      Application is <strong style={{ color: KYC_STYLE[detail.status].color }}>{detail.status}</strong>. No further action required.
                    </div>
                  )}
                </div>
              )}

              {!detail && (
                <div className="ap-detail-empty">
                  <span style={{ fontSize: 32 }}>🪪</span>
                  <p>Select an application to review</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── INVESTORS ─────────────────────── */}
        {tab === 'investors' && (
          <>
            <div className="ap-table">
              <div className="ap-table-head" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}>
                <span>Name</span><span>Plan</span><span>Value</span><span>PnL</span><span>Status</span>
              </div>
              {investors.map((i: Investor) => (
                <div key={i.name} className="ap-table-row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr' }}>
                  <span className="ap-table-name">{i.name}</span>
                  <span>{i.plan}</span>
                  <span>{i.value}</span>
                  <span style={{ color: i.pnl.startsWith('-') ? '#ff6475' : '#10d9a0' }}>{i.pnl}</span>
                  <span style={{ color: STATUS_COLOR[i.status] ?? '' }}>{i.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Toast */}
      {toast && <div className="ap-toast">{toast}</div>}
    </div>
  );
}
