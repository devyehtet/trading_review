'use client';

import { useId } from 'react';

interface LogoIconProps {
  size?: number;
}

export default function LogoIcon({ size = 42 }: LogoIconProps) {
  const uid = useId().replace(/:/g, '');
  const blueId  = `nb_${uid}`;
  const tealId  = `nt_${uid}`;
  const shineId = `ns_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NexoraCapi logo"
    >
      <defs>
        <linearGradient id={blueId} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="45%"  stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        <linearGradient id={tealId} x1="0" y1="56" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#065f46" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

       
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>


      <rect x="4"  y="8" width="10" height="40" rx="3" fill={`url(#${blueId})`} />

      <path
        d="M14 8 L23 8 L42 38 L42 48 L33 48 L14 18 Z"
        fill={`url(#${blueId})`}
      />

      <rect x="42" y="8" width="10" height="40" rx="3" fill={`url(#${blueId})`} />

      <path
        d="M14 8 L23 8 L42 38 L42 48 L33 48 L14 18 Z"
        fill={`url(#${shineId})`}
      />

      <rect x="38" y="26" width="4" height="14" rx="1.5" fill={`url(#${tealId})`} />
      <rect x="43" y="19" width="4" height="21" rx="1.5" fill={`url(#${tealId})`} />
      <rect x="48" y="12" width="4" height="28" rx="1.5" fill={`url(#${tealId})`} />

      <circle cx="2"  cy="42" r="2" fill={`url(#${blueId})`} opacity="0.7" />
      <circle cx="2"  cy="50" r="2" fill={`url(#${blueId})`} opacity="0.5" />
      <line x1="4"  y1="42" x2="10" y2="42" stroke={`url(#${blueId})`} strokeWidth="1.5" opacity="0.6" />
      <line x1="4"  y1="50" x2="10" y2="50" stroke={`url(#${blueId})`} strokeWidth="1.5" opacity="0.4" />
      <line x1="10" y1="42" x2="10" y2="50" stroke={`url(#${blueId})`} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}
