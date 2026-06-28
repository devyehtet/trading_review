'use client';

import Title from '../ui/Title';

export default function Kyc() {
  return (
    <>
      <Title title="KYC & Compliance" sub="Verification checklist" />
      <div className="row"><b>Identity Document</b><span className="green">Done</span></div>
      <div className="row"><b>Proof of Address</b><span className="gold">Pending</span></div>
      <div className="row"><b>Risk Agreement</b><span className="green">Done</span></div>
      <p className="risk">
        Before real launch, review licensing, KYC/AML, privacy policy, and financial rules
        in your operating country.
      </p>
    </>
  );
}
