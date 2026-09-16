import { useEffect, useRef } from 'react'

type Options = {
  enabled?: boolean
  /** pixels per second */
  scrollSpeed?: number
  /** delay before scrolling starts (ms) */
  startDelay?: number
}

/**
 * Matches Chung Đôi invitation auto-scroll:
 * scrollY = elapsedSeconds * scrollSpeed (default 50px/s), starts after 2s,
 * stops at bottom or on user interaction.
 */
export function useAutoScroll({
  enabled = true,
  scrollSpeed = 50,
  startDelay = 2000,
}: Options = {}) {
  const pausedRef = useRef(false)
  const stoppedRef = useRef(false)
  const startTimeRef = useRef<number | undefined>(undefined)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    stoppedRef.current = false
    pausedRef.current = false
    startTimeRef.current = undefined

    const stop = () => {
      if (stoppedRef.current) return
      stoppedRef.current = true
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = undefined
      }
    }

    const pause = () => {
      if (pausedRef.current || stoppedRef.current) return
      pausedRef.current = true
    }

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) pause()
    }

    const tick = (now: number) => {
      if (stoppedRef.current) return
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (startTimeRef.current === undefined) startTimeRef.current = now
      const y = ((now - startTimeRef.current) / 1000) * scrollSpeed
      window.scrollTo(0, y)
      if (Math.abs(window.scrollY - y) > 2) {
        document.documentElement.scrollTop = y
        document.body.scrollTop = y
      }
      const viewH = window.innerHeight
      const fullH = document.documentElement.scrollHeight
      const current = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
      if (current + viewH >= fullH - 10) {
        stop()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const delayId = window.setTimeout(() => {
      if (stoppedRef.current) return
      window.addEventListener('wheel', onWheel, { passive: true })
      window.addEventListener('touchstart', pause, { passive: true })
      window.addEventListener('mousedown', pause)
      window.addEventListener('keydown', pause)
      rafRef.current = requestAnimationFrame(tick)
    }, startDelay)

    return () => {
      window.clearTimeout(delayId)
      stop()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', pause)
      window.removeEventListener('mousedown', pause)
      window.removeEventListener('keydown', pause)
    }
  }, [enabled, scrollSpeed, startDelay])
}
