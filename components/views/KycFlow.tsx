'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import type { UserCtx } from '../../lib/types';

interface KycFlowProps {
  user:        UserCtx;
  onCompleted: () => void;
  onBack:      () => void;
}

/* ─────────────────────────────────────────────────
   Step definitions
───────────────────────────────────────────────── */
const STEPS = [
  {
    id: 1,
    icon: '🪪',
    title: 'Identity Verification',
    sub: 'Personal details and government-issued ID',
  },
  {
    id: 2,
    icon: '🏦',
    title: 'Address & Financial Profile',
    sub: 'Residential address and source of funds',
  },
  {
    id: 3,
    icon: '✍️',
    title: 'Risk Profile & Agreements',
    sub: 'Investment profile and regulatory consents',
  },
] as const;

type StepId = 1 | 2 | 3;

/* ─────────────────────────────────────────────────
   Form data shape
───────────────────────────────────────────────── */
interface KycData {
  /* Step 1 */
  dob:              string;
  nationality:      string;
  idType:           string;
  idNumber:         string;
  idExpiry:         string;
  idUploaded:       boolean;
  /* Step 2 */
  address:          string;
  city:             string;
  country:          string;
  employment:       string;
  annualIncome:     string;
  fundSources:      string[];
  pep:              string;
  /* Step 3 */
  investPurpose:    string;
  riskTolerance:    string;
  experience:       string;
  agreeTerms:       boolean;
  agreePrivacy:     boolean;
  agreeRisk:        boolean;
  eSignature:       string;
}

const INIT: KycData = {
  dob: '', nationality: '', idType: 'passport', idNumber: '', idExpiry: '', idUploaded: false,
  address: '', city: '', country: '', employment: '', annualIncome: '', fundSources: [], pep: 'no',
  investPurpose: '', riskTolerance: '', experience: '', agreeTerms: false, agreePrivacy: false, agreeRisk: false, eSignature: '',
};

const NATIONALITIES = [
  { value: 'MM', label: 'Myanmar' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thailand' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'OTHER', label: 'Other' },
];

const COUNTRIES = NATIONALITIES;

const FUND_SOURCES = [
  'Employment / Salary',
  'Business Income',
  'Investment Returns',
  'Savings',
  'Inheritance / Gift',
  'Other',
];

/* ─────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────── */
export default function KycFlow({ user, onCompleted, onBack }: KycFlowProps) {
  const [step,   setStep]   = useState<StepId>(1);
  const [data,   setData]   = useState<KycData>({ ...INIT });
  const [errors, setErrors] = useState<Partial<Record<keyof KycData, string>>>({});

  function set<K extends keyof KycData>(key: K, val: KycData[K]) {
    setData(d => ({ ...d, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function toggleFund(val: string) {
    setData(d => ({
      ...d,
      fundSources: d.fundSources.includes(val)
        ? d.fundSources.filter(x => x !== val)
        : [...d.fundSources, val],
    }));
    setErrors(e => { const n = { ...e }; delete n.fundSources; return n; });
  }

  /* ── Validation per step ────────────────────── */
  function validate(): boolean {
    const e: Partial<Record<keyof KycData, string>> = {};

    if (step === 1) {
      if (!data.dob)         e.dob         = 'Date of birth is required';
      if (!data.nationality) e.nationality = 'Nationality is required';
      if (!data.idNumber)    e.idNumber    = 'ID number is required';
      if (!data.idExpiry)    e.idExpiry    = 'Expiry date is required';
      if (!data.idUploaded)  e.idUploaded  = 'Please upload your ID document';
    }

    if (step === 2) {
      if (!data.address)    e.address    = 'Street address is required';
      if (!data.city)       e.city       = 'City is required';
      if (!data.country)    e.country    = 'Country is required';
      if (!data.employment) e.employment = 'Employment status is required';
      if (!data.annualIncome)          e.annualIncome = 'Annual income is required';
      if (!data.fundSources.length)    e.fundSources  = 'Select at least one source';
    }

    if (step === 3) {
      if (!data.investPurpose)  e.investPurpose  = 'Required';
      if (!data.riskTolerance)  e.riskTolerance  = 'Required';
      if (!data.experience)     e.experience     = 'Required';
      if (!data.agreeTerms)     e.agreeTerms     = 'You must accept Terms & Conditions';
      if (!data.agreePrivacy)   e.agreePrivacy   = 'You must accept the Privacy Policy';
      if (!data.agreeRisk)      e.agreeRisk      = 'You must accept the Risk Disclosure';
      if (!data.eSignature.trim()) e.eSignature  = 'E-signature is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    if (step < 3) setStep(s => (s + 1) as StepId);
    else          onCompleted();
  }

  function back() {
    if (step > 1) setStep(s => (s - 1) as StepId);
    else          onBack();
  }

  const progress = Math.round(((step - 1) / 2) * 100);
  const current  = STEPS[step - 1];

  return (
    <div className="kyc-wrap">

      {/* Progress bar */}
      <div className="kyc-progress">
        <div className="kyc-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Step dots */}
      <div className="kyc-dots">
        {STEPS.map(s => (
          <div key={s.id} className={`kyc-dot${step === s.id ? ' active' : step > s.id ? ' done' : ''}`}>
            {step > s.id ? '✓' : s.id}
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="kyc-step-indicator">
        <span className="kyc-step-icon">{current.icon}</span>
        <div>
          <span className="kyc-step-count">Step {step} of 3</span>
          <strong className="kyc-step-title">{current.title}</strong>
          <span className="kyc-step-sub">{current.sub}</span>
        </div>
      </div>

      {/* Step body */}
      <div className="kyc-body">
        {step === 1 && <Step1 data={data} errors={errors} set={set} user={user} />}
        {step === 2 && <Step2 data={data} errors={errors} set={set} toggleFund={toggleFund} />}
        {step === 3 && <Step3 data={data} errors={errors} set={set} user={user} />}
      </div>

      {/* Footer */}
      <div className="kyc-footer">
        <button type="button" className="btn-back" onClick={back}>
          ← {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button type="button" className="btn-next" onClick={next}>
          {step === 3 ? 'Submit KYC ✓' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────────────── */
type SetFn = <K extends keyof KycData>(key: K, val: KycData[K]) => void;
interface SProps { data: KycData; errors: Partial<Record<keyof KycData, string>>; set: SetFn; }

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="kyc-field">
      <label className="kyc-label">{label}</label>
      {children}
      {error && <span className="kyc-field-error">{error}</span>}
    </div>
  );
}

function Input({ name, value, onChange, placeholder, type = 'text', invalid }: {
  name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; invalid?: boolean;
}) {
  return (
    <input
      className={`kyc-input${invalid ? ' invalid' : ''}`}
      type={type} name={name} value={value} placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}

function Select({ name, value, onChange, options, placeholder, invalid }: {
  name: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; invalid?: boolean;
}) {
  return (
    <select
      className={`kyc-input${invalid ? ' invalid' : ''}`}
      name={name} value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function RadioGroup({ name, value, onChange, options }: {
  name: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="kyc-radio-group">
      {options.map(o => (
        <label key={o.value} className={`radio-option${value === o.value ? ' selected' : ''}`}>
          <input type="radio" name={name} value={o.value}
            checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Step 1 — Identity Verification
───────────────────────────────────────────────── */
function Step1({ data, errors, set, user }: SProps & { user: UserCtx }) {
  const [idPreview,  setIdPreview]  = useState('');
  const [idFileName, setIdFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Pre-filled info */}
      <div className="kyc-prefill">
        <div><span>Full Name</span><strong>{user.name || '—'}</strong></div>
        <div><span>Email</span><strong>{user.email}</strong></div>
        {user.phone && <div><span>Phone</span><strong>{user.phone}</strong></div>}
      </div>

      <Field label="Date of Birth" error={errors.dob}>
        <Input name="dob" type="date" value={data.dob} onChange={v => set('dob', v)} invalid={!!errors.dob} />
      </Field>

      <Field label="Nationality" error={errors.nationality}>
        <Select name="nationality" value={data.nationality} onChange={v => set('nationality', v)}
          placeholder="Select nationality" options={NATIONALITIES} invalid={!!errors.nationality} />
      </Field>

      <Field label="ID Document Type">
        <RadioGroup name="idType" value={data.idType} onChange={v => set('idType', v)}
          options={[
            { value: 'passport', label: 'Passport' },
            { value: 'nid',      label: 'National ID Card' },
            { value: 'driving',  label: "Driver's License" },
          ]}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="ID Number" error={errors.idNumber}>
          <Input name="idNumber" value={data.idNumber} onChange={v => set('idNumber', v)}
            placeholder="e.g. MA123456" invalid={!!errors.idNumber} />
        </Field>
        <Field label="Expiry Date" error={errors.idExpiry}>
          <Input name="idExpiry" type="date" value={data.idExpiry}
            onChange={v => set('idExpiry', v)} invalid={!!errors.idExpiry} />
        </Field>
      </div>

      <Field label="Upload ID Document" error={errors.idUploaded}>
        {/* Hidden real file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,application/pdf"
          style={{ display: 'none' }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIdFileName(file.name);
            set('idUploaded', true);
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = ev => setIdPreview(ev.target?.result as string);
              reader.readAsDataURL(file);
            } else {
              setIdPreview(''); // PDF — no image preview
            }
          }}
        />

        {/* Upload tap area */}
        <div
          className={`upload-area${data.idUploaded ? ' uploaded' : ''}${errors.idUploaded ? ' invalid' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {idPreview ? (
            /* Image preview */
            <img
              src={idPreview}
              alt="ID preview"
              style={{ width: '100%', maxHeight: 140, objectFit: 'contain', borderRadius: 8 }}
            />
          ) : data.idUploaded ? (
            /* PDF or non-image uploaded */
            <><span className="upload-check">✓</span>&nbsp; {idFileName}</>
          ) : (
            <><span className="upload-icon">📷</span>&nbsp; Tap to upload (photo / scan)</>
          )}
        </div>

        {data.idUploaded && (
          <button
            type="button"
            style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
            onClick={() => { set('idUploaded', false); setIdPreview(''); setIdFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          >
            ✕ Remove & re-upload
          </button>
        )}

        <p className="kyc-note" style={{ marginTop: 6 }}>
          📌 Accepted: JPG, PNG, HEIC, PDF · Max 10MB · All 4 corners must be visible.
        </p>
      </Field>
    </>
  );
}

/* ─────────────────────────────────────────────────
   Step 2 — Address & Financial Profile
───────────────────────────────────────────────── */
function Step2({ data, errors, set, toggleFund }: SProps & { toggleFund: (v: string) => void }) {
  return (
    <>
      <Field label="Street Address" error={errors.address}>
        <Input name="address" value={data.address} onChange={v => set('address', v)}
          placeholder="House / Street / Road" invalid={!!errors.address} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="City" error={errors.city}>
          <Input name="city" value={data.city} onChange={v => set('city', v)}
            placeholder="City" invalid={!!errors.city} />
        </Field>
        <Field label="Country" error={errors.country}>
          <Select name="country" value={data.country} onChange={v => set('country', v)}
            placeholder="Country" options={COUNTRIES} invalid={!!errors.country} />
        </Field>
      </div>

      <Field label="Employment Status" error={errors.employment}>
        <Select name="employment" value={data.employment} onChange={v => set('employment', v)}
          placeholder="Select status"
          options={[
            { value: 'employed',   label: 'Employed (Full-time)' },
            { value: 'part_time',  label: 'Employed (Part-time)' },
            { value: 'self',       label: 'Self-employed / Business Owner' },
            { value: 'retired',    label: 'Retired' },
            { value: 'student',    label: 'Student' },
            { value: 'unemployed', label: 'Unemployed' },
          ]}
          invalid={!!errors.employment}
        />
      </Field>

      <Field label="Annual Income (USD)" error={errors.annualIncome}>
        <Select name="annualIncome" value={data.annualIncome} onChange={v => set('annualIncome', v)}
          placeholder="Select range"
          options={[
            { value: 'under_25k',  label: 'Under $25,000' },
            { value: '25k_50k',    label: '$25,000 – $50,000' },
            { value: '50k_100k',   label: '$50,000 – $100,000' },
            { value: '100k_250k',  label: '$100,000 – $250,000' },
            { value: 'over_250k',  label: 'Over $250,000' },
          ]}
          invalid={!!errors.annualIncome}
        />
      </Field>

      <Field label="Source of Investment Funds" error={errors.fundSources}>
        <p className="kyc-sub" style={{ marginBottom: 8 }}>Select all that apply:</p>
        <div className="kyc-check-group">
          {FUND_SOURCES.map(s => (
            <label key={s} className={`check-row${data.fundSources.includes(s) ? ' checked' : ''}`}>
              <input type="checkbox" checked={data.fundSources.includes(s)} onChange={() => toggleFund(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
        {errors.fundSources && <span className="kyc-field-error" style={{ marginTop: 4 }}>{errors.fundSources}</span>}
      </Field>

      <Field label="Politically Exposed Person (PEP)">
        <RadioGroup name="pep" value={data.pep} onChange={v => set('pep', v)}
          options={[
            { value: 'no',  label: 'No — I am not a PEP or related to one' },
            { value: 'yes', label: 'Yes — I am or was a politically exposed person' },
          ]}
        />
        {data.pep === 'yes' && (
          <div className="kyc-warning" style={{ marginTop: 8 }}>
            ⚠️ PEP status requires enhanced due diligence. Our compliance team will contact you for additional documentation before activation.
          </div>
        )}
      </Field>
    </>
  );
}

/* ─────────────────────────────────────────────────
   Step 3 — Risk Profile & Agreements
───────────────────────────────────────────────── */
function Step3({ data, errors, set, user }: SProps & { user: UserCtx }) {
  return (
    <>
      {/* Risk profile */}
      <Field label="Purpose of Investment" error={errors.investPurpose}>
        <Select name="investPurpose" value={data.investPurpose} onChange={v => set('investPurpose', v)}
          placeholder="Select purpose"
          options={[
            { value: 'wealth',    label: 'Long-term Wealth Growth' },
            { value: 'income',    label: 'Regular Passive Income' },
            { value: 'preserve',  label: 'Capital Preservation' },
            { value: 'speculate', label: 'Speculation / Active Trading' },
          ]}
          invalid={!!errors.investPurpose}
        />
      </Field>

      <Field label="Risk Tolerance" error={errors.riskTolerance}>
        <RadioGroup name="riskTolerance" value={data.riskTolerance} onChange={v => set('riskTolerance', v)}
          options={[
            { value: 'low',    label: 'Low — Preserve capital, accept minimal risk' },
            { value: 'medium', label: 'Medium — Balanced risk and return' },
            { value: 'high',   label: 'High — Accept significant volatility for higher returns' },
          ]}
        />
        {errors.riskTolerance && <span className="kyc-field-error" style={{ marginTop: 4 }}>{errors.riskTolerance}</span>}
      </Field>

      <Field label="Investment Experience" error={errors.experience}>
        <Select name="experience" value={data.experience} onChange={v => set('experience', v)}
          placeholder="Select level"
          options={[
            { value: 'none',     label: 'None — First-time investor' },
            { value: 'beginner', label: 'Beginner — 1–2 years' },
            { value: 'moderate', label: 'Moderate — 3–5 years' },
            { value: 'expert',   label: 'Expert — 5+ years' },
          ]}
          invalid={!!errors.experience}
        />
      </Field>

      <div className="kyc-divider" />

      {/* Regulatory agreements */}
      <p className="kyc-sub" style={{ marginBottom: 10, fontSize: 13 }}>
        Read and accept the following regulatory agreements:
      </p>

      <div className="kyc-agreements">
        <label className={`check-row${data.agreeTerms ? ' checked' : ''}${errors.agreeTerms ? ' error' : ''}`}>
          <input type="checkbox" checked={data.agreeTerms}
            onChange={e => set('agreeTerms', e.target.checked)} />
          <span>I have read and agree to the <u>Terms & Conditions</u> and <u>Client Agreement</u>.</span>
        </label>
        {errors.agreeTerms && <span className="kyc-field-error" style={{ marginTop: 2 }}>{errors.agreeTerms}</span>}

        <label className={`check-row${data.agreePrivacy ? ' checked' : ''}${errors.agreePrivacy ? ' error' : ''}`}
          style={{ marginTop: 8 }}>
          <input type="checkbox" checked={data.agreePrivacy}
            onChange={e => set('agreePrivacy', e.target.checked)} />
          <span>I consent to the <u>Privacy Policy</u> and processing of my personal data.</span>
        </label>
        {errors.agreePrivacy && <span className="kyc-field-error" style={{ marginTop: 2 }}>{errors.agreePrivacy}</span>}

        <label className={`check-row${data.agreeRisk ? ' checked' : ''}${errors.agreeRisk ? ' error' : ''}`}
          style={{ marginTop: 8 }}>
          <input type="checkbox" checked={data.agreeRisk}
            onChange={e => set('agreeRisk', e.target.checked)} />
          <span>I acknowledge the <u>Risk Disclosure</u>. Trading involves risk and I may lose capital.</span>
        </label>
        {errors.agreeRisk && <span className="kyc-field-error" style={{ marginTop: 2 }}>{errors.agreeRisk}</span>}
      </div>

      {/* E-Signature */}
      <Field label="Electronic Signature" error={errors.eSignature}>
        <p className="kyc-sub" style={{ marginBottom: 8 }}>
          Type your full legal name as your binding electronic signature:
        </p>
        <Input name="eSignature" value={data.eSignature} onChange={v => set('eSignature', v)}
          placeholder={user.name || 'Full legal name'} invalid={!!errors.eSignature} />
        {data.eSignature.trim() && (
          <div className="e-sig-preview">✍️ &nbsp;{data.eSignature}</div>
        )}
      </Field>

      <div className="kyc-legal">
        By submitting this application you confirm that all information provided is accurate, complete, and not misleading. False declarations may result in account suspension and referral to relevant authorities under applicable AML/CFT regulations.
      </div>
    </>
  );
}
