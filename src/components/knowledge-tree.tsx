// A single abstract branching tree — knowledge "growing" outward from one
// trunk into forking paths, each ending in a small node. Decorative only.
export function KnowledgeTree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 500" fill="none" className={className} aria-hidden>
      <path
        d="M120 500 C118 440 122 400 120 360 C122 320 118 290 121 250 C123 220 119 195 120 165"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M120 360 C95 330 70 310 40 270"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M120 360 C145 330 170 310 200 270"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M40 270 C25 240 15 215 5 180" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 270 C55 235 60 205 55 165" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M200 270 C215 240 225 215 235 180" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M200 270 C185 235 180 205 185 165" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="5" cy="180" r="6" fill="currentColor" />
      <circle cx="55" cy="165" r="6" fill="currentColor" />
      <circle cx="120" cy="165" r="7" fill="currentColor" />
      <circle cx="185" cy="165" r="6" fill="currentColor" />
      <circle cx="235" cy="180" r="6" fill="currentColor" />
    </svg>
  );
}
