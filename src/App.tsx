import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  const [guestName] = useState(() => guestNameFromUrl(invitation.guestName))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const musicStartedRef = useRef(false)

  const opened = stage === 'invite'
  const showCover = stage === 'cover'
  const showVideo = stage === 'video'
  const inviteReady = opened && inviteVisible && !showVideo

  useEffect(() => {
    audioRef.current = new Audio(invitation.music)
    audioRef.current.loop = true
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 1
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

  useEffect(() => {
    if (!ambienceReady || musicStartedRef.current) return
    musicStartedRef.current = true
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.readyState < 2) audio.load()
      audio.volume = 0
      void audio
        .play()
        .then(() => {
          setPlaying(true)
          fadeAudio(audio, 0, 1, INTRO_CROSSFADE_MS)
        })
        .catch(() => setPlaying(false))
    } catch {
      setPlaying(false)
    }
  }, [ambienceReady])

  useAutoScroll({
    enabled: ambienceReady,
    scrollSpeed: 50,
    startDelay: 0,
  })

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

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.volume = 1
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
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

      {showCover && <EnvelopeCover onOpen={onEnvelopeOpened} guestName={guestName} />}
      {showVideo && <IntroVideo onRevealStart={onVideoRevealStart} onComplete={onVideoComplete} />}
      {inviteVisible && !showCover && <MusicButton playing={playing} onToggle={toggleMusic} />}
    </div>
  )
}
