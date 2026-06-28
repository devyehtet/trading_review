'use client';

import LogoIcon from '../ui/LogoIcon';

interface KycPendingProps {
  name:      string;
  onApprove: () => void; // demo-only: simulates compliance approval
}

const REVIEW_STEPS = [
  { label: 'Application Received',         done: true  },
  { label: 'Document Verification',        done: true  },
  { label: 'Identity Check (AML / KYC)',   done: false },
  { label: 'Risk Assessment Review',       done: false },
  { label: 'Compliance Approval',          done: false },
  { label: 'Account Activation',           done: false },
];

export default function KycPending({ name, onApprove }: KycPendingProps) {
  return (
    <div className="pending-screen">
      {/* Icon */}
      <div className="pending-icon-wrap">
        <div className="pending-icon">⏳</div>
      </div>

      <h3 className="pending-title">Under Review</h3>
      <p className="pending-sub">
        Thank you, <strong>{name || 'Applicant'}</strong>. Your KYC application has been submitted successfully.
      </p>

      {/* Status steps */}
      <div className="pending-steps">
        {REVIEW_STEPS.map((s, i) => (
          <div key={i} className={`pending-step${s.done ? ' done' : ''}`}>
            <div className="step-dot">
              {s.done ? '✓' : (i === REVIEW_STEPS.findIndex((x) => !x.done) ? '●' : '')}
            </div>
            <div className="step-line-wrap">
              <span className="step-label">{s.label}</span>
              {s.done && <span className="step-status">Completed</span>}
              {!s.done && i === REVIEW_STEPS.findIndex((x) => !x.done) && (
                <span className="step-status pending-pulse">In Progress</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ETA */}
      <div className="pending-eta">
        <span>⏱</span>
        <div>
          <strong>Estimated Review Time</strong>
          <span>1–3 business days</span>
        </div>
      </div>

      {/* Info */}
      <p className="pending-info">
        We will notify you by email once your account is verified. You can check your status by logging in again.
      </p>

      {/* DEMO shortcut */}
      <div className="demo-approve-wrap">
        <div className="demo-label">— Demo Only —</div>
        <button type="button" className="btn-next" onClick={onApprove}
          style={{ background: 'linear-gradient(135deg, #065f46, #10d9a0)' }}>
          ✓ Simulate Compliance Approval
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '6px 0 0', textAlign: 'center' }}>
          This button simulates the back-office approval step
        </p>
      </div>
    </div>
  );
}
