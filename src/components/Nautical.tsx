import type { ReactNode } from 'react'

const NAVY = '#00224c'
const GOLD = '#c9a24a'
const CREAM = '#ece4d8'
const SEA = '#3f6ea8'

type FloatProps = {
  className: string
  delay?: string
  duration?: string
  flip?: boolean
  children: ReactNode
}

export function FloatingNautical({
  className,
  delay = '0s',
  duration = '6s',
  flip,
  children,
}: FloatProps) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-20 block ${className}`}>
      <span className="block" style={{ animation: `dbFloat ${duration} ease-in-out ${delay} infinite` }}>
        <span
          className={`block w-full max-w-none drop-shadow-[3px_4px_3px_rgba(0,0,0,0.28)] ${
            flip ? 'rotate-180 -scale-y-100' : ''
          }`}
        >
          {children}
        </span>
      </span>
    </span>
  )
}

export function AnchorIcon({ className = '', color = NAVY }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={className} fill="none" aria-hidden>
      <path
        d="M32 8a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"
        stroke={color}
        strokeWidth="3.2"
      />
      <path d="M32 22v42" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M22 34h20" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M12 52c2 14 12 20 20 20s18-6 20-20"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M12 52l-5-3M52 52l5-3" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M38 48c6 2 10 8 8 16"
        stroke={GOLD}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}

export function CompassRose({ className = '', color = NAVY }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="1.4" opacity="0.35" />
      <circle cx="60" cy="60" r="44" fill="none" stroke={color} strokeWidth="1.2" opacity="0.5" />
      <circle cx="60" cy="60" r="28" fill="none" stroke={GOLD} strokeWidth="1.1" opacity="0.85" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="10"
          x2="60"
          y2="22"
          stroke={color}
          strokeWidth="1.4"
          transform={`rotate(${deg} 60 60)`}
          opacity="0.55"
        />
      ))}
      <polygon points="60,16 66,60 60,52 54,60" fill={color} />
      <polygon points="60,104 54,60 60,68 66,60" fill={color} opacity="0.55" />
      <polygon points="104,60 60,54 68,60 60,66" fill={SEA} opacity="0.85" />
      <polygon points="16,60 60,66 52,60 60,54" fill={SEA} opacity="0.55" />
      <polygon points="92,28 62,58 60,54 58,58" fill={GOLD} />
      <polygon points="28,92 58,62 60,66 62,62" fill={GOLD} opacity="0.7" />
      <polygon points="92,92 58,62 60,66 62,58" fill={color} opacity="0.4" />
      <polygon points="28,28 62,58 60,54 58,62" fill={color} opacity="0.4" />
      <circle cx="60" cy="60" r="5" fill={CREAM} stroke={GOLD} strokeWidth="1.6" />
      <text
        x="60"
        y="14"
        textAnchor="middle"
        fill={color}
        fontSize="9"
        fontFamily="Times New Roman, serif"
        fontWeight="700"
      >
        N
      </text>
    </svg>
  )
}

export function HelmWheel({ className = '', color = NAVY }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="22" fill="none" stroke={color} strokeWidth="4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <circle cx="50" cy="50" r="4.5" fill={GOLD} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (Math.PI / 4) * i - Math.PI / 2
        const x1 = 50 + Math.cos(a) * 12
        const y1 = 50 + Math.sin(a) * 12
        const x2 = 50 + Math.cos(a) * 38
        const y2 = 50 + Math.sin(a) * 38
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3.4" strokeLinecap="round" />
            <circle cx={x2} cy={y2} r="4.2" fill={CREAM} stroke={color} strokeWidth="2.2" />
          </g>
        )
      })}
    </svg>
  )
}

export function NauticalStar({ className = '', color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color} aria-hidden>
      <path d="M12 1.6l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.2 5.7 20.4 8 13.2 2 8.8h7.6L12 1.6z" />
    </svg>
  )
}

export function RopeDivider({ className = '', light = false }: { className?: string; light?: boolean }) {
  const stroke = light ? CREAM : NAVY
  const gold = GOLD
  return (
    <svg viewBox="0 0 280 36" className={className} fill="none" aria-hidden>
      <path
        d="M8 18c12-10 18 10 30 0s18 10 30 0 18 10 30 0"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M8 18c12 10 18-10 30 0s18-10 30 0 18-10 30 0"
        stroke={gold}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M182 18c12-10 18 10 30 0s18 10 30 0 18 10 30 0"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M182 18c12 10 18-10 30 0s18-10 30 0 18-10 30 0"
        stroke={gold}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <g transform="translate(128 4)">
        <circle cx="12" cy="6" r="4" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M12 10v14M7 16h10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 24c1.2 6 5.2 8.5 8 8.5S18.8 30 20 24" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 24l-2.4-1.4M20 24l2.4-1.4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function WaveBand({ className = '', color = CREAM }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        className="nautical-wave"
        d="M0 24c20-12 40 12 60 0s40 12 60 0 40 12 60 0 40 12 60 0 40 12 60 0 40 12 60 0 40 12 40 0v16H0z"
        fill={color}
        opacity="0.18"
      />
      <path
        className="nautical-wave-delay"
        d="M0 28c16-8 32 8 48 0s32 8 48 0 32 8 48 0 32 8 48 0 32 8 48 0 32 8 48 0 32 8 48 0 32 8 64 0v12H0z"
        fill={color}
        opacity="0.12"
      />
    </svg>
  )
}

export function OfficerStripes({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="h-[3px] w-full" style={{ backgroundColor: NAVY }} />
      <div className="h-[2px] w-full" style={{ backgroundColor: GOLD }} />
      <div className="h-[3px] w-full" style={{ backgroundColor: NAVY }} />
      <div className="h-[2px] w-full" style={{ backgroundColor: GOLD }} />
      <div className="h-[3px] w-full" style={{ backgroundColor: NAVY }} />
    </div>
  )
}

export function ShipHorizon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 520" className={className} aria-hidden fill="none">
      <ellipse cx="720" cy="168" rx="52" ry="52" fill={GOLD} opacity="0.28" />
      <ellipse cx="720" cy="168" rx="28" ry="28" fill={CREAM} opacity="0.35" />
      <path d="M40 300c80-18 140-8 220 6 90 16 150-22 250-10 110 14 180 8 350-18" stroke={NAVY} strokeWidth="2" opacity="0.35" />
      <path d="M0 340c90-30 170 10 280-8 130-20 200 18 340 4 150-16 200 8 280-12v196H0z" fill={NAVY} opacity="0.12" />
      <path d="M0 380c70-22 150 8 240-6 120-18 190 14 310 2 140-14 190 10 270-8v154H0z" fill={NAVY} opacity="0.16" />
      <path d="M0 430c80-16 160 10 250-4 110-16 200 10 320 0 140-12 180 8 250-6v100H0z" fill={NAVY} opacity="0.2" />

      <g transform="translate(118 168)" opacity="0.85">
        <rect x="18" y="78" width="16" height="118" fill={NAVY} />
        <polygon points="14,78 38,78 36,54 16,54" fill={NAVY} />
        <rect x="20" y="44" width="12" height="12" fill={GOLD} opacity="0.95" />
        <path d="M26 20l28 18H26z" fill={GOLD} opacity="0.35" />
        <path d="M26 20l-28 18H26z" fill={CREAM} opacity="0.4" />
        <rect x="8" y="196" width="36" height="10" fill={NAVY} />
      </g>

      <g transform="translate(280 210)" stroke={NAVY} fill={NAVY}>
        <path d="M40 118h240c18 0 34-8 42-22H28c6 12 16 22 12 22z" opacity="0.92" />
        <path d="M62 96h196l-8 22H72z" fill={CREAM} stroke="none" opacity="0.35" />
        <rect x="118" y="8" width="3.2" height="90" />
        <rect x="168" y="0" width="3.4" height="98" />
        <rect x="218" y="14" width="3" height="84" />
        <path d="M121 14l42 28H121z" fill={CREAM} stroke="none" opacity="0.7" />
        <path d="M121 48l38 22H121z" fill={CREAM} stroke="none" opacity="0.55" />
        <path d="M171 6l52 32H171z" fill={CREAM} stroke="none" opacity="0.75" />
        <path d="M171 44l48 24H171z" fill={CREAM} stroke="none" opacity="0.55" />
        <path d="M221 20l36 24H221z" fill={CREAM} stroke="none" opacity="0.65" />
        <path d="M221 52l32 18H221z" fill={CREAM} stroke="none" opacity="0.5" />
        <line x1="120" y1="10" x2="90" y2="96" strokeWidth="1.1" opacity="0.55" />
        <line x1="171" y1="2" x2="250" y2="96" strokeWidth="1.1" opacity="0.45" />
        <line x1="221" y1="16" x2="258" y2="96" strokeWidth="1" opacity="0.45" />
        <path d="M168 0l8-14 3 14" fill="none" strokeWidth="1.4" />
      </g>

      <g fill={NAVY} opacity="0.4">
        <path d="M610 248c8-2 14 6 22 2 6-18-10-16-22-2z" />
        <path d="M662 262c7-2 12 5 18 1 5-14-8-13-18-1z" />
        <path d="M780 238c7-2 12 6 18 2 5-16-9-14-18-2z" />
      </g>

      <g transform="translate(748 188)" opacity="0.9">
        <path className="lighthouse-beam" d="M26 22L62 6v28L26 22z" fill={GOLD} opacity="0.35" />
        <rect x="16" y="14" width="20" height="12" fill={NAVY} />
        <rect x="19" y="17" width="14" height="6" fill={GOLD} />
        <path d="M14 26h24l-3 6H17z" fill={NAVY} />
        <path d="M16 32h20l-4 58H20z" fill={CREAM} />
        <path d="M16 42h20l-1 10H17z" fill={NAVY} />
        <path d="M17.5 64h17l-1.2 10H18.7z" fill={NAVY} />
        <path d="M19 86h14l-1 10H20z" fill={NAVY} />
        <rect x="12" y="96" width="28" height="6" fill={NAVY} />
      </g>

      <g fill="none" stroke={NAVY} strokeWidth="1.6" opacity="0.45" strokeLinecap="round">
        <path d="M560 150c6-6 10-6 16 0c6-6 10-6 16 0" />
        <path d="M620 132c5-5 8-5 13 0c5-5 8-5 13 0" />
        <path d="M500 168c4-4 7-4 11 0c4-4 7-4 11 0" />
      </g>
    </svg>
  )
}

export function NauticalSpray({
  variant = 'anchor',
}: {
  variant?: 'anchor' | 'compass' | 'helm' | 'stars' | 'lighthouse' | 'lifering' | 'flags'
}) {
  if (variant === 'compass') {
    return (
      <div className="relative flex w-full flex-col items-center">
        <CompassRose className="w-[88%] max-w-none" />
        <AnchorIcon className="-mt-[8%] w-[38%] max-w-none" />
      </div>
    )
  }
  if (variant === 'helm') {
    return (
      <div className="relative flex w-full flex-col items-center">
        <HelmWheel className="w-[78%] max-w-none" />
        <AnchorIcon className="-mt-[4%] w-[42%] max-w-none" />
        <div className="mt-1 flex w-full justify-between px-[8%]">
          <NauticalStar className="h-5 w-5" />
          <NauticalStar className="h-4 w-4 opacity-80" />
        </div>
      </div>
    )
  }
  if (variant === 'stars') {
    return (
      <div className="relative flex w-full flex-col items-center">
        <AnchorIcon className="w-[48%] max-w-none" />
        <div className="mt-1 flex w-full items-end justify-center gap-1">
          <HelmWheel className="w-[46%] max-w-none" color={SEA} />
          <CompassRose className="mb-1 w-[36%] max-w-none" />
        </div>
        <NauticalStar className="mt-1 h-5 w-5" />
      </div>
    )
  }
  if (variant === 'lighthouse') {
    return (
      <div className="relative flex w-full flex-col items-center">
        <Lighthouse className="w-[72%] max-w-none" />
        <Seagull className="-mt-2 w-[48%] max-w-none opacity-70" />
      </div>
    )
  }
  if (variant === 'lifering') {
    return (
      <div className="relative flex w-full flex-col items-center">
        <LifeRing className="w-[82%] max-w-none" />
        <SailorKnot className="-mt-[8%] w-[36%] max-w-none" />
      </div>
    )
  }
  if (variant === 'flags') {
    return (
      <div className="relative flex w-full flex-col items-center">
        <SignalBunting compact className="w-full max-w-none" />
        <Sextant className="mt-1 w-[42%] max-w-none" />
      </div>
    )
  }
  return (
    <div className="relative flex w-full flex-col items-center">
      <NauticalStar className="mb-1 h-5 w-5" />
      <AnchorIcon className="w-[62%] max-w-none" />
      <CompassRose className="-mt-[6%] ml-[18%] w-[52%] max-w-none" />
    </div>
  )
}

export function CardRopeInset() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-[7px] z-[6] rounded-[6px]"
      style={{
        boxShadow:
          'inset 0 0 0 1px rgba(201,162,74,0.38), inset 0 0 0 4px rgba(236,228,216,0.08), inset 0 0 0 5px rgba(201,162,74,0.22)',
      }}
    />
  )
}

export function ChartGrid({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 900" preserveAspectRatio="none" className={className} aria-hidden fill="none">
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={40 + i * 48}
          x2="400"
          y2={40 + i * 48}
          stroke={NAVY}
          strokeWidth="0.6"
          opacity="0.09"
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={20 + i * 40}
          y1="0"
          x2={20 + i * 40}
          y2="900"
          stroke={NAVY}
          strokeWidth="0.6"
          opacity="0.09"
        />
      ))}
      <line x1="0" y1="80" x2="400" y2="820" stroke={GOLD} strokeWidth="0.5" opacity="0.12" />
      <line x1="400" y1="60" x2="0" y2="780" stroke={GOLD} strokeWidth="0.5" opacity="0.1" />
      <circle cx="200" cy="420" r="90" stroke={NAVY} strokeWidth="0.5" opacity="0.08" />
      <circle cx="200" cy="420" r="150" stroke={NAVY} strokeWidth="0.5" opacity="0.06" />
    </svg>
  )
}

export function LifeRing({ className = '', labeled = false }: { className?: string; labeled?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="38" fill="none" stroke={CREAM} strokeWidth="16" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={NAVY} strokeWidth="16" strokeDasharray="30 30" />
      <circle cx="50" cy="50" r="46" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={GOLD} strokeWidth="2.2" />
      {[0, 90, 180, 270].map((deg) => (
        <rect
          key={deg}
          x="46"
          y="6"
          width="8"
          height="10"
          rx="1.5"
          fill={GOLD}
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      {labeled && (
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill={NAVY}
          fontSize="9"
          fontFamily="Times New Roman, serif"
          fontWeight="700"
        >
          D&S
        </text>
      )}
    </svg>
  )
}

export function Lighthouse({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 140" className={className} aria-hidden fill="none">
      <path className="lighthouse-beam" d="M40 28L78 8v28L40 28z" fill={GOLD} opacity="0.28" />
      <path className="lighthouse-beam" d="M40 28L2 8v28L40 28z" fill={GOLD} opacity="0.18" />
      <rect x="28" y="18" width="24" height="14" fill={NAVY} />
      <rect x="32" y="22" width="16" height="8" fill={GOLD} opacity="0.9" />
      <path d="M24 32h32l-4 8H28z" fill={NAVY} />
      <path d="M27 40h26l-6 72H33z" fill={CREAM} />
      <path d="M27 52h26l-1.2 14H28.2z" fill={NAVY} />
      <path d="M28.6 80h22.8L50 94H30z" fill={NAVY} />
      <path d="M30.2 108h19.6l-1.4 12H31.6z" fill={NAVY} />
      <rect x="22" y="120" width="36" height="8" fill={NAVY} />
      <path d="M16 128h48l-4 8H20z" fill={NAVY} opacity="0.85" />
      <circle cx="40" cy="26" r="2.2" fill={CREAM} />
    </svg>
  )
}

export function Seagull({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 18" className={className} fill="none" aria-hidden>
      <path
        d="M2 12C10 4 16 4 24 11C32 4 38 4 46 12"
        stroke={NAVY}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FlyingGulls({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <span className="absolute left-[8%] top-0 w-[42px] opacity-45" style={{ animation: 'seagull-glide 7s ease-in-out infinite' }}>
        <Seagull className="w-full" />
      </span>
      <span
        className="absolute left-[28%] top-[18px] w-[28px] opacity-30"
        style={{ animation: 'seagull-glide 8.5s ease-in-out 0.8s infinite' }}
      >
        <Seagull className="w-full" />
      </span>
      <span
        className="absolute right-[12%] top-[6px] w-[36px] opacity-35"
        style={{ animation: 'seagull-glide 6.5s ease-in-out 1.2s infinite reverse' }}
      >
        <Seagull className="w-full" />
      </span>
    </div>
  )
}

function FlagBody({
  children,
  x,
  rotate = 0,
}: {
  children: ReactNode
  x: number
  rotate?: number
}) {
  return (
    <g transform={`translate(${x} 10) rotate(${rotate} 12 0)`} className="signal-flag">
      <line x1="12" y1="-8" x2="12" y2="0" stroke={NAVY} strokeWidth="1.2" />
      {children}
    </g>
  )
}

export function SignalBunting({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <svg viewBox={compact ? '0 0 280 46' : '0 0 480 52'} className={className} aria-hidden fill="none">
      <path
        d={compact ? 'M4 10c40 8 80-8 136 0s92-8 136 0' : 'M8 12c50 10 110-10 180 0s130-10 180 0 70-6 104 0'}
        stroke={NAVY}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d={compact ? 'M4 10c40 8 80-8 136 0s92-8 136 0' : 'M8 12c50 10 110-10 180 0s130-10 180 0 70-6 104 0'}
        stroke={GOLD}
        strokeWidth="0.8"
        opacity="0.7"
      />
      {compact ? (
        <>
          <FlagBody x={28} rotate={-4}>
            <rect width="24" height="30" fill={NAVY} />
            <rect x="6" y="8" width="12" height="12" fill={CREAM} />
          </FlagBody>
          <FlagBody x={78} rotate={3}>
            <rect width="24" height="30" fill={GOLD} />
            <rect y="11" width="24" height="8" fill={NAVY} />
          </FlagBody>
          <FlagBody x={128} rotate={-2}>
            <rect width="24" height="30" fill={CREAM} />
            <rect x="6" y="8" width="12" height="12" fill={NAVY} />
          </FlagBody>
          <FlagBody x={178} rotate={4}>
            <path d="M0 0h18l6 8-6 7 6 8-6 7H0z" fill={NAVY} />
            <path d="M0 0h10v30H0z" fill={CREAM} />
          </FlagBody>
          <FlagBody x={228} rotate={-3}>
            <rect width="24" height="30" fill={GOLD} />
          </FlagBody>
        </>
      ) : (
        <>
          <FlagBody x={22} rotate={-5}>
            <rect width="24" height="32" fill={NAVY} />
            <rect x="6" y="8" width="12" height="12" fill={CREAM} />
          </FlagBody>
          <FlagBody x={76} rotate={3}>
            <rect width="24" height="32" fill={GOLD} />
            <rect y="12" width="24" height="8" fill={NAVY} />
          </FlagBody>
          <FlagBody x={130} rotate={-2}>
            <rect width="24" height="32" fill={CREAM} />
            <rect x="6" y="9" width="12" height="12" fill={NAVY} />
          </FlagBody>
          <FlagBody x={184} rotate={4}>
            <rect width="24" height="16" fill={NAVY} />
            <rect y="16" width="24" height="16" fill={GOLD} />
          </FlagBody>
          <FlagBody x={238} rotate={-3}>
            <rect width="24" height="32" fill={NAVY} />
            <path d="M0 0l24 32M24 0L0 32" stroke={CREAM} strokeWidth="3" />
          </FlagBody>
          <FlagBody x={292} rotate={2}>
            <rect width="24" height="32" fill={GOLD} />
          </FlagBody>
          <FlagBody x={346} rotate={-4}>
            <rect width="24" height="32" fill={CREAM} />
            <rect width="12" height="16" fill={NAVY} />
            <rect x="12" y="16" width="12" height="16" fill={NAVY} />
          </FlagBody>
          <FlagBody x={400} rotate={3}>
            <path d="M0 0h16l8 8-8 8 8 8-8 8H0z" fill={NAVY} />
            <path d="M0 0h9v32H0z" fill={CREAM} />
          </FlagBody>
          <FlagBody x={448} rotate={-2}>
            <rect width="24" height="32" fill={NAVY} />
            <rect x="6" y="8" width="12" height="12" fill={GOLD} />
          </FlagBody>
        </>
      )}
    </svg>
  )
}

export function SailorKnot({ className = '', color = NAVY }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path
        d="M18 32c0-10 8-16 14-16 10 0 14 8 14 16 0 10-8 16-14 16-10 0-14-8-14-16Z"
        stroke={color}
        strokeWidth="3.2"
      />
      <path
        d="M32 12c12 4 18 12 18 20s-6 16-18 20"
        stroke={GOLD}
        strokeWidth="1.8"
        opacity="0.9"
      />
      <path d="M12 20c8-8 16-6 20 0M52 44c-8 8-16 6-20 0" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 44c8 8 16 6 20 0M52 20c-8-8-16-6-20 0" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4" fill={GOLD} />
    </svg>
  )
}

export function RankChevrons({ className = '', light = false }: { className?: string; light?: boolean }) {
  const stroke = light ? GOLD : NAVY
  return (
    <svg viewBox="0 0 72 18" className={className} fill="none" aria-hidden>
      <path d="M8 5l28 8 28-8" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 10l24 7 24-7" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M16 14.5l20 5.5 20-5.5" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function KnotCorners({ className = '', light = false }: { className?: string; light?: boolean }) {
  const color = light ? CREAM : NAVY
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 z-[7] ${className}`}>
      <SailorKnot className="absolute left-1 top-1 h-7 w-7 opacity-70" color={color} />
      <SailorKnot className="absolute right-1 top-1 h-7 w-7 rotate-90 opacity-70" color={color} />
      <SailorKnot className="absolute bottom-1 left-1 h-7 w-7 -rotate-90 opacity-70" color={color} />
      <SailorKnot className="absolute bottom-1 right-1 h-7 w-7 rotate-180 opacity-70" color={color} />
    </div>
  )
}

export function BretonStripes({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[5px] w-full"
          style={{ backgroundColor: i % 2 === 0 ? NAVY : CREAM }}
        />
      ))}
      <div className="h-[2px] w-full" style={{ backgroundColor: GOLD }} />
    </div>
  )
}

export function Sextant({ className = '', color = NAVY }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden>
      <path d="M16 58a34 34 0 0 1 48 0" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M22 58a28 28 0 0 1 36 0" stroke={GOLD} strokeWidth="1.6" />
      <path d="M40 14v44" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="14" r="5" stroke={GOLD} strokeWidth="2" />
      <path d="M40 14l22 44" stroke={color} strokeWidth="2.4" />
      <rect x="34" y="54" width="12" height="8" rx="1" fill={GOLD} />
    </svg>
  )
}
