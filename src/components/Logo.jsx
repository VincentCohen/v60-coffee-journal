export default function Logo({ size = 28, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Main cone body — wide rim, tapers to rounded bottom opening */}
      <path
        d="M4 9 Q4 7 16 7 Q28 7 28 9 L21 25 Q19.5 28 16 28 Q12.5 28 11 25 Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M4 9 Q4 7 16 7 Q28 7 28 9 L21 25 Q19.5 28 16 28 Q12.5 28 11 25 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Top rim — ellipse to show the opening depth */}
      <ellipse cx="16" cy="9" rx="12" ry="2.2" stroke="currentColor" strokeWidth="1.4" />

      {/* Single D-shaped handle on right */}
      <path
        d="M23 14 C28 14 28.5 16 28.5 18 C28.5 20 28 22 23 22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Interior centre rib — the V60's characteristic spiral */}
      <line x1="16" y1="9.5" x2="16" y2="27" stroke="currentColor" strokeWidth="1" opacity="0.35" strokeLinecap="round"/>

      {/* Two flanking ribs */}
      <line x1="13" y1="10" x2="12.5" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeLinecap="round"/>
      <line x1="19" y1="10" x2="19.5" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeLinecap="round"/>

      {/* Base plate */}
      <ellipse cx="16" cy="29" rx="6" ry="1.4" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    </svg>
  )
}
