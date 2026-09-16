import { useEffect, useRef, useState, type TouchEvent } from 'react'

export type MemoryPhoto = {
  src: string
  caption?: string
}

type Props = {
  photos: readonly MemoryPhoto[]
  autoPlayMs?: number
}

export function MemoryCarousel({ photos, autoPlayMs = 3800 }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = photos.length

  useEffect(() => {
    if (count <= 1 || paused) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), autoPlayMs)
    return () => window.clearInterval(id)
  }, [autoPlayMs, count, paused])

  if (count === 0) return null

  const go = (next: number) => setIndex(((next % count) + count) % count)

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null
    setPaused(true)
  }

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current
    touchX.current = null
    setPaused(false)
    if (start == null) return
    const end = e.changedTouches[0]?.clientX ?? start
    const delta = end - start
    if (Math.abs(delta) < 36) return
    go(delta < 0 ? index + 1 : index - 1)
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative overflow-hidden rounded-[18px]">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((photo, i) => (
            <div key={`${photo.src}-${i}`} className="w-full shrink-0">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[18px]">
                <img
                  src={photo.src}
                  alt={photo.caption || `Memory ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-1.5">
        {photos.map((photo, i) => (
          <button
            key={`${photo.src}-dot-${i}`}
            type="button"
            aria-label={`Memory ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className="h-1.5 rounded-full transition-all duration-300 active:scale-90"
            style={{
              width: i === index ? 16 : 6,
              backgroundColor: i === index ? '#00224c' : 'rgba(0, 34, 76, 0.22)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
