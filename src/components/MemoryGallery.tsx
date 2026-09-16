import { useCallback, useEffect, useRef, useState } from 'react'

type GalleryItem = {
  src: string
  caption: string
  position?: string
}

type Props = {
  items: readonly GalleryItem[]
}

export function MemoryGallery({ items }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dir, setDir] = useState<1 | -1>(1)
  const touchX = useRef<number | null>(null)
  const count = items.length

  const goTo = useCallback(
    (next: number, direction: 1 | -1 = 1) => {
      if (count === 0) return
      setDir(direction)
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index])
  const next = useCallback(() => goTo(index + 1, 1), [goTo, index])

  useEffect(() => {
    if (paused || count <= 1) return
    const id = window.setInterval(() => goTo(index + 1, 1), 4800)
    return () => window.clearInterval(id)
  }, [paused, count, goTo, index])

  if (count === 0) return null

  const current = items[index]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      className="relative overflow-hidden rounded-[18px] px-4 pb-7 pt-8 shadow-[4px_4px_10px_rgba(0,0,0,0.18)] sm:px-6"
      style={{ backgroundColor: '#f7f5ee' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null
        setPaused(true)
      }}
      onTouchEnd={(e) => {
        const start = touchX.current
        touchX.current = null
        setPaused(false)
        if (start == null) return
        const dx = (e.changedTouches[0]?.clientX ?? start) - start
        if (Math.abs(dx) < 40) return
        if (dx > 0) prev()
        else next()
      }}
    >
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-35 mix-blend-multiply"
        src="/assets/paper.webp"
      />

      <div className="relative z-10 flex flex-col items-center">
        <h2
          className="text-center text-[20px] uppercase tracking-[0.03em] md:text-[22px]"
          style={{ color: '#00224c', fontFamily: '"Times New Roman", serif', fontWeight: 700 }}
        >
          Our Memories
        </h2>
        <p
          className="mt-1.5 text-center text-[12px] md:text-[13px]"
          style={{ color: 'rgba(1, 47, 83, 0.65)', fontFamily: 'Baskerville, "Times New Roman", serif' }}
        >
          A few moments from our story
        </p>

        {/* Album frame */}
        <div className="relative mt-6 w-full max-w-[300px] md:max-w-[340px]">
          {/* Back plate / stack hint */}
          <div
            aria-hidden
            className="absolute inset-x-3 -bottom-2 top-3 rounded-[10px]"
            style={{
              backgroundColor: '#ece4d8',
              boxShadow: '0 2px 8px rgba(0,34,76,0.1)',
              transform: 'rotate(1.5deg)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-2 -bottom-1 top-1.5 rounded-[10px]"
            style={{
              backgroundColor: '#f3efe6',
              boxShadow: '0 2px 8px rgba(0,34,76,0.08)',
              transform: 'rotate(-1deg)',
            }}
          />

          <div
            className="relative overflow-hidden rounded-[8px] bg-white px-3 pb-10 pt-3"
            style={{ boxShadow: '0 8px 24px rgba(0, 34, 76, 0.16)' }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e2d6]">
              {items.map((item, i) => (
                <img
                  key={`${item.src}-${item.caption}-${i}`}
                  src={item.src}
                  alt={item.caption}
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out ${
                    i === index
                      ? 'translate-x-0 opacity-100'
                      : dir === 1
                        ? '-translate-x-4 opacity-0'
                        : 'translate-x-4 opacity-0'
                  }`}
                  style={{
                    objectPosition: item.position ?? 'center',
                    transitionDelay: i === index ? '40ms' : '0ms',
                  }}
                />
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-center px-3">
              <p
                key={current.caption}
                className="animate-[hero-fade-up_0.4s_ease-out] text-center text-[15px] leading-none"
                style={{ color: '#00224c', fontFamily: '"Ms Madi", cursive' }}
              >
                {current.caption}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-7 flex w-full max-w-[300px] items-center justify-between md:max-w-[340px]">
          <button
            type="button"
            aria-label="Previous memory"
            onClick={prev}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-opacity hover:opacity-70 active:scale-95"
            style={{ color: '#00224c', fontFamily: '"Times New Roman", serif', fontWeight: 700 }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <span
              className="tabular-nums text-[12px] tracking-[0.12em]"
              style={{ color: 'rgba(0, 34, 76, 0.7)', fontFamily: 'Baskerville, "Times New Roman", serif' }}
            >
              {pad(index + 1)}
              <span style={{ opacity: 0.4 }}> / </span>
              {pad(count)}
            </span>
            <div className="flex h-[2px] w-16 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0,34,76,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((index + 1) / count) * 100}%`,
                  backgroundColor: '#00224c',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            aria-label="Next memory"
            onClick={next}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-opacity hover:opacity-70 active:scale-95"
            style={{ color: '#00224c', fontFamily: '"Times New Roman", serif', fontWeight: 700 }}
          >
            Next
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
