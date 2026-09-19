import { useEffect, useRef, useState } from 'react'

export const INTRO_CROSSFADE_MS = 800

type Props = {
  onRevealStart?: () => void
  onComplete: () => void
  onUserGesture?: () => void
}

function fadeMediaVolume(
  el: HTMLMediaElement,
  from: number,
  to: number,
  ms: number,
  onDone?: () => void,
) {
  const start = performance.now()
  el.volume = Math.min(1, Math.max(0, from))
  let raf = 0

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    const eased = 1 - (1 - t) * (1 - t)
    el.volume = Math.min(1, Math.max(0, from + (to - from) * eased))
    if (t < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      onDone?.()
    }
  }

  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export function IntroVideo({ onRevealStart, onComplete, onUserGesture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)
  const cancelFadeRef = useRef<(() => void) | null>(null)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true

    const video = videoRef.current
    onRevealStart?.()
    setExiting(true)

    if (video) {
      cancelFadeRef.current?.()
      cancelFadeRef.current = fadeMediaVolume(video, video.volume, 0, INTRO_CROSSFADE_MS, () => {
        video.pause()
      })
    }

    window.setTimeout(() => onComplete(), INTRO_CROSSFADE_MS + 80)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = 0
    video.muted = false

    const startFadeIn = () => {
      if (doneRef.current) return
      cancelFadeRef.current?.()
      cancelFadeRef.current = fadeMediaVolume(video, 0, 1, INTRO_CROSSFADE_MS)
    }

    void video.play()
      .then(() => {
        startFadeIn()
      })
      .catch(() => {
        video.muted = true
        void video.play().catch(() => {})
      })

    const onTimeUpdate = () => {
      if (doneRef.current || !video.duration || !Number.isFinite(video.duration)) return
      const remainingMs = (video.duration - video.currentTime) * 1000
      if (remainingMs <= INTRO_CROSSFADE_MS) {
        finish()
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.background = '#001531'
    document.body.style.background = '#001531'

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      cancelFadeRef.current?.()
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      style={{
        background: '#001531',
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        opacity: exiting ? 0 : 1,
        transition: `opacity ${INTRO_CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/intro new.webm"
        playsInline
        preload="auto"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,21,49,0.35) 0%, transparent 30%, transparent 70%, rgba(0,21,49,0.55) 100%)',
        }}
      />

      <button
        type="button"
        onClick={() => {
          onUserGesture?.()
          finish()
        }}
        disabled={exiting}
        className="btn-press absolute top-5 right-5 z-10 rounded-full px-5 py-2 text-[12px] uppercase tracking-[0.16em] transition-all active:scale-95 disabled:opacity-50 md:top-8 md:right-8"
        style={{
          backgroundColor: 'rgba(247, 245, 238, 0.14)',
          color: '#ece4d8',
          fontFamily: '"Times New Roman", serif',
          fontWeight: 700,
          boxShadow: 'inset 0 0 0 1px rgba(236, 228, 216, 0.35)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Skip
      </button>
    </div>
  )
}
