import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { invitation } from '../data'

type Props = {
  onOpen: () => void
  onOpenStart?: () => void
}

type Phase = 'idle' | 'opening' | 'away' | 'done'

type Particle = {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotStart: number
  rotEnd: number
  delay: number
}

const PARTICLE_COLORS = ['#0b3a72', '#3f6ea8', '#c9a24a', '#ece4d8'] as const
const GRADIENT = 'linear-gradient(160deg, #073268 0%, #00224c 48%, #001531 100%)'

function FlowerSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden>
      <g>
        <ellipse cx="12" cy="5" rx="2.2" ry="4.5" />
        <ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(120 12 12)" />
        <ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(180 12 12)" />
        <ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(240 12 12)" />
        <ellipse cx="12" cy="5" rx="2.2" ry="4.5" transform="rotate(300 12 12)" />
      </g>
      <circle cx="12" cy="12" r="1.8" fillOpacity="0.45" />
    </svg>
  )
}

function playOpenChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = now + 0.1 * i
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.035 - 0.005 * i, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8)
      osc.start(t)
      osc.stop(t + 1.8)
    })
    ;[1567.98, 2093].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = now + 0.35 + 0.1 * i
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.015, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
      osc.start(t)
      osc.stop(t + 1.2)
    })
    const bass = ctx.createOscillator()
    const bassGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    bass.connect(filter)
    filter.connect(bassGain)
    bassGain.connect(ctx.destination)
    bass.type = 'sine'
    bass.frequency.setValueAtTime(261.63, now)
    filter.type = 'lowpass'
    filter.frequency.value = 400
    bassGain.gain.setValueAtTime(0, now)
    bassGain.gain.linearRampToValueAtTime(0.025, now + 0.4)
    bassGain.gain.setValueAtTime(0.02, now + 1)
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5)
    bass.start(now)
    bass.stop(now + 2.5)
    window.setTimeout(() => {
      ;[783.99, 987.77, 1174.66, 1567.98].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        const t = ctx.currentTime + 0.06 * i
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.025, t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
        osc.start(t)
        osc.stop(t + 0.6)
      })
    }, 1200)
  } catch {
    // ignore audio errors
  }
}

function generateBurstParticles(): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < 28; i++) {
    const angle = (2 * Math.PI * i) / 28 + (Math.random() - 0.5) * 0.4
    const radius = 25 + 60 * Math.random()
    particles.push({
      id: i,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      size: 10 + 16 * Math.random(),
      rotStart: (Math.random() - 0.5) * 30,
      rotEnd: (Math.random() - 0.5) * 360,
      delay: 0.15 * Math.random(),
    })
  }
  return particles
}

function AmbientPetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const left = 8 + ((i * 17.3) % 84)
        const size = 11 + ((i * 7) % 11)
        const sway = (i % 2 === 0 ? 1 : -1) * (6 + (i % 5) * 4)
        const duration = 19 + (i % 7)
        const delay = -(i * 1.4)
        const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length]
        return { left, size, sway, duration, delay, color, key: i }
      }),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.key}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-30px',
            color: p.color,
            fontSize: `${p.size}px`,
            ['--sway' as string]: `${p.sway}px`,
            animation: `ambient-fall ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0.55,
          }}
        >
          <FlowerSvg />
        </div>
      ))}
    </div>
  )
}

export function EnvelopeCover({ onOpen, onOpenStart }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [particles, setParticles] = useState<Particle[]>([])
  const openedRef = useRef(false)
  const onOpenRef = useRef(onOpen)
  const bgVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    onOpenRef.current = onOpen
  }, [onOpen])

  const finish = useCallback(() => {
    if (openedRef.current) return
    openedRef.current = true
    setPhase('done')
    try {
      onOpenRef.current()
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'away') return
    const watchdog = window.setTimeout(() => finish(), 2600)
    return () => window.clearTimeout(watchdog)
  }, [phase, finish])

  useEffect(() => {
    if (particles.length === 0) return
    const id = window.setTimeout(() => setParticles([]), 1500)
    return () => window.clearTimeout(id)
  }, [particles])

  useEffect(() => {
    if (phase === 'done') return
    const prevHtmlBg = document.documentElement.style.background
    const prevBodyBg = document.body.style.background
    const prevOverflow = document.body.style.overflow
    document.documentElement.style.background = '#001531'
    document.body.style.background = GRADIENT
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.background = prevHtmlBg
      document.body.style.background = prevBodyBg
      document.body.style.backgroundAttachment = ''
      document.body.style.overflow = prevOverflow
    }
  }, [phase])

  useEffect(() => {
    const video = bgVideoRef.current
    if (!video) return
    video.muted = true
    video.loop = true
    video.playsInline = true
    void video.play().catch(() => {})
  }, [])

  const handleOpen = () => {
    if (phase !== 'idle') return
    onOpenStart?.()
    playOpenChime()
    setPhase('opening')
    window.setTimeout(() => {
      setParticles(generateBurstParticles())
      setPhase('away')
    }, 500)
    window.setTimeout(() => finish(), 1300)
  }

  if (phase === 'done') return null

  const animating = phase === 'opening' || phase === 'away'

  return (
    <div
      className="fixed inset-0 z-50 flex w-full items-center justify-center overflow-hidden px-5"
      style={{
        background: GRADIENT,
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div aria-hidden className="pointer-events-none absolute" style={{ inset: '-20vmax', background: GRADIENT }} />

      {/* Intro video as envelope background */}
      <div
        className="pointer-events-none absolute z-[1] overflow-hidden envelope-fade-in"
        style={{ inset: '-20vmax' }}
      >
        <video
          ref={bgVideoRef}
          className="h-full w-full object-cover"
          src="/videos/intro.webm"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      {/* Full-screen navy blue opacity wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[2] envelope-fade-in"
        style={{
          inset: '-20vmax',
          background: 'rgba(0, 34, 76, 0.72)',
          animationDelay: '0.08s',
        }}
      />

      <AmbientPetals />

      {particles.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[100]">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute top-1/2 left-1/2"
              style={{
                color: p.color,
                fontSize: `${p.size}px`,
                textShadow: `0 0 10px ${p.color}`,
                ['--dx' as string]: `${(p.x - 50) * 5}px`,
                ['--dy' as string]: `${(p.y - 50) * 5}px`,
                ['--rot-start' as string]: `${p.rotStart}deg`,
                ['--rot-end' as string]: `${p.rotEnd}deg`,
                animation: `particle-burst 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
              }}
            >
              <FlowerSvg />
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative z-10 w-full max-w-[360px] md:max-w-[420px] ${phase === 'idle' ? 'envelope-card-in' : ''}`}
        style={{
          animationDelay: phase === 'idle' ? '0.12s' : undefined,
          animation: phase === 'away' ? 'envelope-away 0.8s ease-in forwards' : undefined,
        }}
      >
        {/* Wax seal */}
        <div
          className={`absolute left-1/2 z-30 flex items-center justify-center rounded-full ${
            !animating ? 'envelope-seal-in' : ''
          }`}
          style={{
            top: -18,
            width: 52,
            height: 52,
            transform: 'translate(-50%, 0)',
            background: 'radial-gradient(circle at 30% 30%, #0a3a72, #001531)',
            boxShadow: '0 6px 22px rgba(0, 34, 76, 0.45), inset 0 2px 4px rgba(255,255,255,0.25)',
            animation: animating
              ? 'seal-break 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : undefined,
          }}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ fill: '#ece4d8' }} aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {animating && (
          <div
            className="pointer-events-none absolute left-1/2 z-[29] rounded-full"
            style={{
              top: -18,
              width: 52,
              height: 52,
              transform: 'translate(-50%, 0)',
              border: '2px solid #ece4d8',
              animation: 'seal-ring 0.6s ease-out forwards',
            }}
          />
        )}

        <div
          className="relative overflow-hidden rounded-[22px] pt-10 pb-8 text-center shadow-[0_28px_60px_-18px_rgba(0,0,0,0.55)]"
          style={{ backgroundColor: '#f7f5ee' }}
        >
          <img
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-45 mix-blend-multiply"
            src="/assets/paper.webp"
          />

          {!animating && (
            <>
              <img
                src="/assets/flower2-decoration.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -left-5 -top-3 w-[32%] max-w-[110px] envelope-flower-left-in"
              />
              <img
                src="/assets/flower5-decoration.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -bottom-3 -right-5 w-[38%] max-w-[140px] envelope-flower-right-in"
              />
            </>
          )}

          <div className="relative z-10 flex flex-col items-center px-7">
            <img
              alt=""
              aria-hidden
              className="mb-5 h-[18px] w-auto object-contain opacity-80 envelope-item-in md:h-[20px]"
              src="/assets/goldenline2-decoration.webp"
              style={{ animationDelay: '0.28s' }}
            />

            <p
              className="mb-2 text-[11px] uppercase tracking-[0.22em] envelope-item-in"
              style={{
                color: 'rgba(0, 34, 76, 0.55)',
                fontFamily: '"Times New Roman", serif',
                fontWeight: 700,
                animationDelay: '0.36s',
              }}
            >
              Wedding Invitation
            </p>

            <h1
              className="flex flex-col items-center leading-none envelope-item-in"
              style={{
                color: '#00224c',
                fontFamily: '"Viaoda Libre", "EB Garamond", serif',
                animationDelay: '0.44s',
              }}
            >
              <span className="text-[34px] md:text-[40px]">{invitation.groomFirst}</span>
              <span
                className="my-1 text-[22px] leading-none"
                style={{ fontFamily: '"Ms Madi", cursive', color: 'rgba(0, 34, 76, 0.55)' }}
              >
                &
              </span>
              <span className="text-[34px] md:text-[40px]">{invitation.brideFirst}</span>
            </h1>

            <div
              className="mt-3 mb-4 flex items-center gap-3 envelope-item-in"
              style={{ animationDelay: '0.54s' }}
            >
              <span className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, rgba(0,34,76,0.45))' }} />
              <span
                className="text-[13px] tracking-wide"
                style={{ color: 'rgba(0, 34, 76, 0.7)', fontFamily: 'Lora, "Times New Roman", serif' }}
              >
                November 2, 2026
              </span>
              <span className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, rgba(0,34,76,0.45))' }} />
            </div>

            <p
              className="mb-2 text-[15px] envelope-item-in"
              style={{
                color: 'rgba(0, 34, 76, 0.68)',
                fontFamily: 'Lora, "Times New Roman", serif',
                animationDelay: '0.62s',
              }}
            >
              {invitation.greeting}
            </p>

            <div
              className="mb-2 rounded-full px-5 py-1.5 envelope-item-in"
              style={{ backgroundColor: 'rgba(0, 34, 76, 0.08)', animationDelay: '0.7s' }}
            >
              <h2
                className="text-[17px] font-medium"
                style={{ color: '#00224c', fontFamily: 'Lora, "Times New Roman", serif' }}
              >
                {invitation.guestName}
              </h2>
            </div>

            <p
              className="mb-6 text-[14px] envelope-item-in"
              style={{
                color: 'rgba(0, 34, 76, 0.62)',
                fontFamily: 'Lora, "Times New Roman", serif',
                animationDelay: '0.78s',
              }}
            >
              {invitation.tagline}
            </p>

            <button
              type="button"
              onClick={handleOpen}
              disabled={phase !== 'idle'}
              aria-busy={phase !== 'idle'}
              className="relative mx-auto flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full px-9 py-2.5 text-[15px] uppercase tracking-[0.14em] shadow-lg transition-transform active:scale-95 envelope-item-in disabled:cursor-default disabled:active:scale-100"
              style={{
                backgroundColor: '#00224c',
                color: '#ece4d8',
                boxShadow: '0 6px 18px rgba(0, 34, 76, 0.35)',
                fontFamily: '"Times New Roman", serif',
                fontWeight: 700,
                animationDelay: '0.88s',
              }}
            >
              Open
              <div
                className="pointer-events-none absolute top-0 h-full w-8"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shine 3s ease-in-out 1.4s infinite',
                }}
              />
            </button>
          </div>
        </div>

        {animating && (
          <>
            <img
              src="/assets/flower2-decoration.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -left-3 top-8 w-[28%] max-w-[110px]"
              style={{
                ['--fly-scale-x' as string]: 1,
                animation: 'dragon-fly-forward 1.2s ease-in forwards',
              }}
            />
            <img
              src="/assets/flower5-decoration.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-3 bottom-10 w-[38%] max-w-[140px]"
              style={{
                ['--fly-scale-x' as string]: -1,
                animation: 'dragon-fly-forward 1.2s ease-in forwards',
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
