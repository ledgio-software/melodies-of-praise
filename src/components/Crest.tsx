/** Placeholder crest (lyre in a laurel ring) until the choir sends its logo. */
export function Crest({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" />
      <circle cx="32" cy="32" r="26.5" strokeWidth="0.8" />
      {/* lyre */}
      <path d="M22 18c-3 6-1 14 4 18v8h12v-8c5-4 7-12 4-18" />
      <path d="M24 22c2 1 3 3 3 5M40 22c-2 1-3 3-3 5" />
      <path d="M26 44h12M29 30v14M32 28v16M35 30v14" strokeWidth="0.9" />
      <path d="M24 20c2-2 14-2 16 0" />
      {/* laurel */}
      <path d="M14 40c2 4 5 7 9 9M50 40c-2 4-5 7-9 9" strokeWidth="1" />
      <path d="M15 43l3-1M17 46l3-.5M48 43l-3-1M46 46l-3-.5" strokeWidth="1" />
    </svg>
  );
}
