import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { EnvelopeCover } from './components/EnvelopeCover'
import { INTRO_CROSSFADE_MS, IntroVideo } from './components/IntroVideo'
import { Invitation } from './components/Invitation'
import { MusicButton } from './components/MusicButton'
import { invitation } from './data'
import { guestNameFromUrl } from './guestName'
import { useAutoScroll } from './hooks/useAutoScroll'

type Stage = 'cover' | 'video' | 'invite'

/** Shared delay after invitation is ready before music + auto-scroll begin together */
const AMBIENCE_START_DELAY_MS = 1400

function fadeAudio(el: HTMLAudioElement, from: number, to: number, ms: number) {
  const start = performance.now()
  el.volume = Math.min(1, Math.max(0, from))
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    const eased = 1 - (1 - t) * (1 - t)
    el.volume = Math.min(1, Math.max(0, from + (to - from) * eased))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function createBgAudio() {
  const audio = new Audio(invitation.music)
  audio.loop = true
  audio.preload = 'auto'
  audio.crossOrigin = 'anonymous'
  audio.setAttribute('playsinline', 'true')
  audio.setAttribute('webkit-playsinline', 'true')
  // iOS Safari treats this like video inline playback rules
  ;(audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true
  audio.volume = 0
  return audio
}

/** Must run inside a user-gesture call stack (click/tap) for browsers to allow sound. */
async function playFromGesture(audio: HTMLAudioElement) {
  audio.muted = false
  audio.volume = 0
  try {
    if (audio.readyState < 2) audio.load()
    await audio.play()
    return true
  } catch {
    try {
      // Some mobile browsers only unlock after a muted play first
      audio.muted = true
      await audio.play()
      audio.muted = false
      audio.volume = 0
      return !audio.paused
    } catch {
      return false
    }
  }
}

export default function App() {
  const [stage, setStage] = useState<Stage>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('open') === '1' ? 'invite' : 'cover'
  })
  const [playing, setPlaying] = useState(false)
  const [inviteVisible, setInviteVisible] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('open') === '1'
  })
  const [ambienceReady, setAmbienceReady] = useState(false)
  const [needsTapForMusic, setNeedsTapForMusic] = useState(false)
  const [guestName] = useState(() => guestNameFromUrl(invitation.guestName))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const musicPrimedRef = useRef(false)
  const musicFadedInRef = useRef(false)

  const opened = stage === 'invite'
  const showCover = stage === 'cover'
  const showVideo = stage === 'video'
  const inviteReady = opened && inviteVisible && !showVideo

  useEffect(() => {
    audioRef.current = createBgAudio()
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useLayoutEffect(() => {
    if (!inviteVisible) return
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [inviteVisible])

  const primeMusic = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return false
    const ok = await playFromGesture(audio)
    if (ok) {
      musicPrimedRef.current = true
      setNeedsTapForMusic(false)
    }
    return ok
  }, [])

  const fadeMusicIn = useCallback(() => {
    const audio = audioRef.current
    if (!audio || musicFadedInRef.current) return
    if (audio.paused) return
    musicFadedInRef.current = true
    setPlaying(true)
    fadeAudio(audio, audio.volume, 1, INTRO_CROSSFADE_MS)
  }, [])

  // Start music + auto-scroll together after a shared delay
  useEffect(() => {
    if (!inviteReady) {
      setAmbienceReady(false)
      return
    }
    const id = window.setTimeout(() => {
      setAmbienceReady(true)
    }, AMBIENCE_START_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [inviteReady])

  // Fade up once ambience is ready — playback must already be primed from a gesture
  useEffect(() => {
    if (!ambienceReady) return
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused && musicPrimedRef.current) {
      fadeMusicIn()
      return
    }

    // Deep-link / blocked autoplay: try once, then ask for a tap
    void playFromGesture(audio).then((ok) => {
      if (ok) {
        musicPrimedRef.current = true
        fadeMusicIn()
      } else {
        setNeedsTapForMusic(true)
      }
    })
  }, [ambienceReady, fadeMusicIn])

  // Catch the next tap anywhere if autoplay was blocked (common on iOS / Chrome)
  useEffect(() => {
    if (!needsTapForMusic) return

    const onGesture = () => {
      void primeMusic().then((ok) => {
        if (!ok) return
        if (ambienceReady) fadeMusicIn()
      })
    }

    window.addEventListener('pointerdown', onGesture, { once: true, capture: true })
    window.addEventListener('touchend', onGesture, { once: true, capture: true })
    window.addEventListener('keydown', onGesture, { once: true, capture: true })

    return () => {
      window.removeEventListener('pointerdown', onGesture, true)
      window.removeEventListener('touchend', onGesture, true)
      window.removeEventListener('keydown', onGesture, true)
    }
  }, [needsTapForMusic, ambienceReady, primeMusic, fadeMusicIn])

  useAutoScroll({
    enabled: ambienceReady,
    scrollSpeed: 50,
    startDelay: 0,
  })

  const onEnvelopeOpenStart = () => {
    // Critical: start (silent) playback inside the Open tap gesture
    void primeMusic()
  }

  const onEnvelopeOpened = () => {
    setStage('video')
  }

  const onVideoRevealStart = () => {
    setInviteVisible(true)
  }

  const onVideoComplete = () => {
    setStage('invite')
    const url = new URL(window.location.href)
    url.searchParams.set('open', '1')
    window.history.replaceState({}, '', url)
  }

  const onVideoSkip = () => {
    // Skip is also a user gesture — re-prime if Open priming failed
    void primeMusic()
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing && !audio.paused) {
      audio.pause()
      setPlaying(false)
      return
    }
    void playFromGesture(audio).then((ok) => {
      if (!ok) {
        setNeedsTapForMusic(true)
        setPlaying(false)
        return
      }
      musicPrimedRef.current = true
      musicFadedInRef.current = true
      audio.volume = 1
      setPlaying(true)
      setNeedsTapForMusic(false)
    })
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <main
        className={`min-h-screen w-full transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showCover || showVideo ? 'pointer-events-none' : ''
        }`}
        style={{
          opacity: inviteVisible ? 1 : 0,
          transitionDuration: `${INTRO_CROSSFADE_MS}ms`,
        }}
      >
        <Invitation introActive={inviteVisible} guestName={guestName} />
      </main>

      {showCover && (
        <EnvelopeCover
          onOpen={onEnvelopeOpened}
          onOpenStart={onEnvelopeOpenStart}
          guestName={guestName}
        />
      )}
      {showVideo && (
        <IntroVideo
          onRevealStart={onVideoRevealStart}
          onComplete={onVideoComplete}
          onUserGesture={onVideoSkip}
        />
      )}
      {inviteVisible && !showCover && <MusicButton playing={playing} onToggle={toggleMusic} />}

      {needsTapForMusic && inviteVisible && !showCover && (
        <button
          type="button"
          onClick={() => {
            void primeMusic().then((ok) => {
              if (!ok) return
              const audio = audioRef.current
              if (!audio) return
              musicFadedInRef.current = true
              audio.volume = 1
              setPlaying(true)
            })
          }}
          className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full px-5 py-2.5 text-[12px] uppercase tracking-[0.14em] shadow-lg transition-transform active:scale-95"
          style={{
            backgroundColor: '#00224c',
            color: '#ece4d8',
            fontFamily: '"Times New Roman", serif',
            fontWeight: 700,
          }}
        >
          Tap for music
        </button>
      )}
    </div>
  )
}
