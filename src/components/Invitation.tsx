import { useEffect, useState, type FormEvent } from 'react'
import { invitation } from '../data'
import { useCountdown, useRsvp, useWishes } from '../hooks'
import { MemoryCarousel } from './MemoryCarousel'
import { Reveal } from './Reveal'

const SAMPLE_WISHES = [
  'Wishing you a lifetime of love and happiness together!',
  'May your marriage be filled with joy, laughter, and endless love.',
  'Congratulations! So happy for you both on this special day.',
  "Here's to love, laughter, and happily ever after!",
]

function FloatingFlower({
  src,
  className,
  delay = '0s',
  duration = '6s',
  flip,
}: {
  src: string
  className: string
  delay?: string
  duration?: string
  flip?: boolean
}) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-20 block ${className}`}>
      <span
        className="block"
        style={{
          animation: `dbFloat ${duration} ease-in-out ${delay} infinite`,
        }}
      >
        <img
          alt=""
          className={`block w-full max-w-none object-contain drop-shadow-[3px_4px_3px_rgba(0,0,0,0.3)] ${
            flip ? 'rotate-180 -scale-y-100' : ''
          }`}
          src={src}
        />
      </span>
    </span>
  )
}

function Calendar() {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  // Nov 2026 starts on Sunday => 6 empty cells for Mon-start grid
  const blanks = 6
  const totalDays = 30

  return (
    <div
      className="mx-auto mt-3 w-fit max-w-full overflow-hidden rounded-[18px] px-4 pb-4 pt-2"
      style={{ backgroundColor: '#ece4d8' }}
    >
      <div className="mx-auto w-[280px] md:w-[330px]" style={{ color: '#00224c' }}>
        <div
          className="border-b py-2.5 text-center text-[25px] font-normal tracking-wide"
          style={{
            borderColor: 'color-mix(in srgb, #00224c 27%, transparent)',
            fontFamily: '"The Nautigal", cursive',
          }}
        >
          November 2026
        </div>
        <div className="grid grid-cols-7 border-b-2" style={{ borderColor: '#00224c' }}>
          {days.map((d) => (
            <div key={d} className="py-1.5 text-center text-[10px] font-medium opacity-60 md:text-[11px]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 px-1 py-2">
          {Array.from({ length: blanks }).map((_, i) => (
            <div key={`b-${i}`} className="flex h-[30px] items-center justify-center md:h-[34px]" />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1
            const isWedding = day === 2
            return (
              <div key={day} className="flex h-[30px] items-center justify-center md:h-[34px]">
                {isWedding ? (
                  <div className="relative flex h-[24px] w-[26px] items-center justify-center md:h-[28px] md:w-[30px]">
                    <svg viewBox="0 0 24 22" className="absolute inset-0 h-full w-full drop-shadow-sm" fill="#00224c">
                      <path d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z" />
                    </svg>
                    <span className="relative z-10 text-[11px] font-bold text-white md:text-[12px]">{day}</span>
                  </div>
                ) : (
                  <span className="text-[12px] md:text-[13px]">{day}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function Invitation({
  introActive = false,
  guestName = invitation.guestName,
}: {
  introActive?: boolean
  guestName?: string
}) {
  const countdown = useCountdown(invitation.weddingDate)
  const { wishes, addWish, submitting: wishSubmitting, error: wishError } = useWishes()
  const { submitted, submit, submitting: rsvpSubmitting, error: rsvpError } = useRsvp()
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null)
  const [guestCount, setGuestCount] = useState(1)
  const [rsvpMessage, setRsvpMessage] = useState('')
  const [wishName, setWishName] = useState(guestName)
  const [wishMessage, setWishMessage] = useState('')
  const [heroSettled, setHeroSettled] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true
    }
    return false
  })

  useEffect(() => {
    if (!introActive) {
      setHeroSettled(false)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHeroSettled(true)
      return
    }
    // Enable float only after the zoom intro finishes — avoids transform conflicts/jank
    const id = window.setTimeout(() => setHeroSettled(true), 1300)
    return () => window.clearTimeout(id)
  }, [introActive])

  const onRsvp = async (e: FormEvent) => {
    e.preventDefault()
    if (!attending || submitted || rsvpSubmitting) return
    try {
      await submit({
        name: guestName,
        attending,
        guestCount: attending === 'yes' ? guestCount : undefined,
        message: rsvpMessage.trim() || undefined,
      })
    } catch {
      /* error surfaced via rsvpError */
    }
  }

  const onWish = async (e: FormEvent) => {
    e.preventDefault()
    if (!wishName.trim() || !wishMessage.trim() || wishSubmitting) return
    try {
      await addWish(wishName.trim(), wishMessage.trim())
      setWishMessage('')
    } catch {
      /* error surfaced via wishError */
    }
  }

  const fillSampleWish = () => {
    setWishMessage(SAMPLE_WISHES[Math.floor(Math.random() * SAMPLE_WISHES.length)])
  }

  return (
    <div className="flex w-full justify-center overflow-x-clip bg-white">
      <div
        className="relative isolate w-full max-w-[480px] overflow-hidden md:mx-auto md:max-w-[900px] md:border md:border-[#00224c22]"
        style={{
          backgroundColor: '#f7f5ee',
          color: '#00224c',
          fontFamily:
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          fontWeight: 500,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/paper.webp)',
            backgroundSize: '666px 1000px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'left top',
            mixBlendMode: 'multiply',
            opacity: 0.5,
          }}
        />

        {/* Header / envelope */}
        <header className="relative z-10 flex flex-col items-center overflow-x-clip px-6 pb-14 pt-10 text-center">
          <img
            alt=""
            aria-hidden
            className={`pointer-events-none absolute -left-[61%] top-0 w-[212%] max-w-none -scale-x-100 object-contain ${introActive ? 'hero-bg-intro' : ''}`}
            src="/assets/castle-background.webp"
            style={{ opacity: 0.2, animationDelay: introActive ? '0.05s' : undefined }}
          />
          <img
            alt=""
            aria-hidden
            className={`relative z-10 mb-3 block w-[82px] max-w-none object-contain md:w-[104px] ${introActive ? 'hero-fade-up' : ''}`}
            src="/assets/goldenline2-decoration.webp"
            style={{ animationDelay: introActive ? '0.12s' : undefined }}
          />
          <p
            className={`relative z-10 whitespace-pre-line text-[15px] uppercase md:text-[18px] ${introActive ? 'hero-fade-up' : ''}`}
            style={{
              fontFamily: '"Playfair Display", "Times New Roman", serif',
              letterSpacing: '0.14em',
              fontWeight: 600,
              animationDelay: introActive ? '0.18s' : undefined,
            }}
          >
            Save The Date
          </p>

          <div
            className={`hero-gpu relative z-10 mt-[30.6%] w-[64.2%] max-w-[300px] md:max-w-[380px] ${introActive ? 'hero-zoom-in' : ''}`}
            style={{ animationDelay: introActive ? '0.08s' : undefined }}
          >
            <div className="relative aspect-[283/328]">
              <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute -left-[32.9%] top-0 z-[15] w-[57.6%] max-w-none object-contain"
                src="/assets/flower-background.webp"
                style={{ filter: 'drop-shadow(3px 4px 3px rgba(0,0,0,0.25))' }}
              />
              <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 w-full max-w-none"
                src="/assets/envelope-background.webp"
              />

              <div
                className={`hero-gpu absolute left-[0.9%] top-[-15.7%] z-20 w-[67.4%] ${
                  introActive && !heroSettled ? 'hero-photo-in' : ''
                } ${heroSettled ? 'hero-float' : ''}`}
                style={{
                  animationDelay: introActive && !heroSettled ? '0.28s' : heroSettled ? '0s' : undefined,
                  animationDuration: heroSettled ? '6.5s' : undefined,
                }}
              >
                <div className="aspect-[191/255] rotate-[-9.93deg] border-[6px] border-white bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.25)] md:border-8">
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={invitation.photos.couple1}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>

              <div
                className={`hero-gpu absolute left-[31%] top-[8.8%] z-[21] w-[59.2%] ${
                  introActive && !heroSettled ? 'hero-photo-in' : ''
                } ${heroSettled ? 'hero-float' : ''}`}
                style={{
                  animationDelay: introActive && !heroSettled ? '0.4s' : heroSettled ? '0.35s' : undefined,
                  animationDuration: heroSettled ? '7s' : undefined,
                }}
              >
                <div className="aspect-[167/219] rotate-[17.26deg] border-[6px] border-white bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.25)] md:border-8">
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={invitation.photos.couple2}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>

              <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-0 top-[42.7%] z-30 w-full max-w-none"
                src="/assets/envelope-cover.webp"
              />

              <span
                aria-hidden
                className={`hero-gpu pointer-events-none absolute left-[75.3%] top-[33.8%] z-[35] block w-[50.5%] ${
                  heroSettled ? 'hero-float' : ''
                }`}
                style={{
                  animationDelay: heroSettled ? '0.15s' : undefined,
                  animationDuration: heroSettled ? '5s' : undefined,
                }}
              >
                <img
                  alt=""
                  className="block w-full max-w-none object-contain"
                  src="/assets/flower2-decoration.webp"
                  style={{ filter: 'drop-shadow(3px 4px 3px rgba(0,0,0,0.25))' }}
                  decoding="async"
                  draggable={false}
                />
              </span>
            </div>
          </div>

          <div
            className={`relative z-10 mt-[24%] flex flex-col items-center gap-[19px] ${introActive ? 'hero-fade-up' : ''}`}
            style={{ animationDelay: introActive ? '0.55s' : undefined }}
          >
            <p
              className="text-[clamp(36px,10.5vw,45px)] uppercase leading-none md:text-[56px]"
              style={{ fontFamily: '"Viaoda Libre", "The Nautigal", cursive' }}
            >
              {invitation.groomFirst}
            </p>
            <span
              aria-hidden
              className="pointer-events-none absolute top-[37%] -translate-y-1/2 text-[100px] leading-none md:text-[128px]"
              style={{ fontFamily: '"The Nautigal", cursive', color: 'rgba(0, 34, 76, 0.15)' }}
            >
              &
            </span>
            <p
              className="text-[clamp(36px,10.5vw,45px)] uppercase leading-none md:text-[56px]"
              style={{ fontFamily: '"Viaoda Libre", "The Nautigal", cursive' }}
            >
              {invitation.brideFirst}
            </p>
          </div>
        </header>

        {/* Ceremony */}
        <Reveal as="section" className="relative z-10 mx-auto mb-10 w-[88%] max-w-[420px] md:mb-16 md:max-w-[560px]" delay={120}>
          <FloatingFlower
            src="/assets/flower3-decoration.webp"
            className="-left-[30%] top-[47.7%] w-[41.7%]"
            delay="0.4s"
            duration="6s"
          />
          <FloatingFlower
            src="/assets/flower2-decoration.webp"
            className="left-[85%] top-[30.7%] w-[37%]"
            delay="0.6s"
            duration="5.5s"
          />
          <div className="relative overflow-hidden rounded-[20px] px-5 pb-10 pt-9 text-center shadow-[4px_4px_10px_rgba(0,0,0,0.25)]">
            <div aria-hidden className="absolute inset-0 rounded-[20px]" style={{ backgroundColor: '#00224c' }} />
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[20px] object-cover opacity-40 mix-blend-multiply"
              src="/assets/paper.webp"
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2
                className="relative z-10 text-center text-[20px] uppercase"
                style={{ color: '#ece4d8', fontFamily: '"Times New Roman", serif', fontWeight: 700, letterSpacing: '0.03em' }}
              >
                CEREMONY INFO
              </h2>

              <div
                className="relative grid grid-cols-[1fr_auto_1fr] justify-center gap-x-8 gap-y-[3px] text-center"
                style={{ color: '#ece4d8', fontFamily: 'Baskerville, "Times New Roman", serif' }}
              >
                <div className="flex min-w-0 flex-col items-center gap-[3px]">
                  <span className="text-[12px]" style={{ color: 'rgba(236, 228, 216, 0.7)' }}>
                    {invitation.groomParents.label}
                  </span>
                  {invitation.groomParents.names.map((n) => (
                    <span key={n} className="text-[12px] font-semibold">
                      {n}
                    </span>
                  ))}
                </div>
                <div className="h-[50px] w-px self-center" style={{ backgroundColor: 'rgba(236, 228, 216, 0.4)' }} />
                <div className="flex min-w-0 flex-col items-center gap-[3px]">
                  <span className="text-[12px]" style={{ color: 'rgba(236, 228, 216, 0.7)' }}>
                    {invitation.brideParents.label}
                  </span>
                  {invitation.brideParents.names.map((n) => (
                    <span key={n} className="text-[12px] font-semibold">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="mx-auto flex flex-col gap-1 text-center text-[12px] md:max-w-[560px] md:text-[13px]"
                style={{ whiteSpace: 'pre-line', fontFamily: 'Baskerville, "Times New Roman", serif', color: '#ece4d8' }}
              >
                {invitation.announcement}
              </div>

              <div className="relative flex w-full min-w-0 flex-col items-center gap-3 text-center md:gap-4">
                <h3
                  className="flex min-h-[80px] w-[80%] items-center justify-center whitespace-nowrap leading-[52px] md:leading-[60px]"
                  style={{ fontSize: 40, fontFamily: '"Viaoda Libre", "The Nautigal", cursive', color: '#ece4d8' }}
                >
                  {invitation.groomFull}
                </h3>
                <div
                  className="text-[10px] uppercase"
                  style={{ color: 'rgba(236, 228, 216, 0.7)', fontFamily: 'Uchen, Baskerville, serif', letterSpacing: '0.14em' }}
                >
                  {invitation.groomRelation}
                </div>
                <div className="text-[35px]" style={{ color: '#ece4d8', fontFamily: '"Ms Madi", cursive' }}>
                  &
                </div>
                <h3
                  className="flex min-h-[80px] w-[80%] items-center justify-center whitespace-nowrap leading-[52px] md:leading-[60px]"
                  style={{ fontSize: 40, fontFamily: '"Viaoda Libre", "The Nautigal", cursive', color: '#ece4d8' }}
                >
                  {invitation.brideFull}
                </h3>
                <div
                  className="text-[10px] uppercase"
                  style={{ color: 'rgba(236, 228, 216, 0.7)', fontFamily: 'Uchen, Baskerville, serif', letterSpacing: '0.14em' }}
                >
                  {invitation.brideRelation}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Reception */}
        <Reveal as="section" className="relative z-10 mx-auto mb-4 w-[88%] max-w-[420px] md:max-w-[560px]" delay={80}>
          <FloatingFlower
            src="/assets/flower4-decoration.webp"
            className="-left-[43.9%] top-[32.8%] w-[54.2%]"
            delay="0.3s"
            duration="6s"
          />
          <FloatingFlower
            src="/assets/flower5-decoration.webp"
            className="bottom-[1%] left-[82.7%] w-[37.6%]"
            delay="0.9s"
            duration="5.4s"
          />
          <div className="relative overflow-hidden rounded-[18px] px-5 py-9 text-center shadow-[4px_4px_10px_rgba(0,0,0,0.25)]">
            <div aria-hidden className="absolute inset-0 rounded-[18px]" style={{ backgroundColor: '#00224c' }} />
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[18px] object-cover opacity-40 mix-blend-multiply"
              src="/assets/paper.webp"
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2
                className="text-center text-[20px] uppercase"
                style={{ color: '#ece4d8', fontFamily: '"Times New Roman", serif', fontWeight: 700, letterSpacing: '0.03em' }}
              >
                RECEPTION INFO
              </h2>

              <div
                className="flex flex-col items-center gap-4 text-center md:gap-5"
                style={{ fontFamily: 'Baskerville, "Times New Roman", serif', color: '#ece4d8' }}
              >
                <h3 className="flex flex-col items-center text-[20px] font-normal uppercase md:text-[26px]">
                  The reception will take place at:
                </h3>
                <div
                  className="flex w-full max-w-[150px] items-center justify-between px-0 text-[13px] uppercase md:text-[15px]"
                  style={{ color: 'rgba(236, 228, 216, 0.7)' }}
                >
                  <span>{invitation.dayLabel}</span>
                  <span>{invitation.timeLabel}</span>
                </div>
                <div className="flex items-center justify-center gap-4" style={{ fontFamily: '"Times New Roman", serif' }}>
                  <span className="text-[46px] leading-none md:text-[52px]" style={{ fontFamily: 'Baskerville, "Times New Roman", serif' }}>
                    {invitation.dayNumber}
                  </span>
                  <div className="h-[46px] w-px" style={{ backgroundColor: 'rgba(236, 228, 216, 0.45)' }} />
                  <div className="flex flex-col items-start justify-center gap-1 text-left">
                    <span className="text-[12px] uppercase md:text-[16px]">{invitation.monthLabel}</span>
                    <span className="text-[18px] md:text-[24px]">{invitation.yearLabel}</span>
                  </div>
                </div>

                <div className="mt-5 flex w-full flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, rgba(236,228,216,0.55))' }} />
                    <h2
                      className="text-[11px] uppercase tracking-[0.22em] md:text-[12px]"
                      style={{ color: 'rgba(236, 228, 216, 0.75)', fontFamily: '"Times New Roman", serif', fontWeight: 700 }}
                    >
                      Countdown
                    </h2>
                    <span className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, rgba(236,228,216,0.55))' }} />
                  </div>

                  <div className="grid w-full max-w-[320px] grid-cols-4 gap-2 md:max-w-[380px] md:gap-2.5">
                    {(
                      [
                        [countdown.days, 'Days'],
                        [countdown.hours, 'Hours'],
                        [countdown.minutes, 'Mins'],
                        [countdown.seconds, 'Secs'],
                      ] as const
                    ).map(([value, label]) => (
                      <div
                        key={label}
                        className="flex flex-col items-center justify-center rounded-[18px] px-1.5 py-2.5 md:py-3"
                        style={{
                          backgroundColor: 'rgba(236, 228, 216, 0.12)',
                          boxShadow: 'inset 0 0 0 1px rgba(236, 228, 216, 0.22)',
                        }}
                      >
                        <span
                          className="tabular-nums text-[22px] leading-none md:text-[26px]"
                          style={{ color: '#ece4d8', fontFamily: 'Baskerville, "Times New Roman", serif', fontWeight: 700 }}
                        >
                          {String(value).padStart(2, '0')}
                        </span>
                        <span
                          className="mt-1.5 text-[9px] uppercase tracking-[0.14em] md:text-[10px]"
                          style={{ color: 'rgba(236, 228, 216, 0.65)', fontFamily: '"Times New Roman", serif' }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Calendar />

                <a
                  href={invitation.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press mt-3 inline-flex items-center justify-center text-sm underline underline-offset-4 active:scale-95"
                  style={{ color: '#ece4d8', fontFamily: '"Times New Roman", serif' }}
                >
                  Add to Calendar
                </a>
              </div>
            </div>
          </div>

          {/* RSVP nested under reception like original */}
          <section className="relative z-10 w-full px-4 py-8 md:py-12">
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-3xl border border-white/50 bg-white/55 p-6 shadow-xl backdrop-blur-sm backdrop-saturate-150 sm:p-8">
                <h2
                  className="mb-1 text-xl font-semibold text-gray-900"
                  style={{ fontFamily: 'Gotham, Montserrat, Roboto, sans-serif', fontWeight: 600 }}
                >
                  Confirm your attendance
                </h2>
                <div className="mb-6 text-sm text-gray-500">
                  Your presence would be an honor. Please RSVP so we can prepare the warmest welcome for you.
                </div>
                {submitted ? (
                  <p className="rounded-2xl bg-[#00224c]/5 px-4 py-6 text-center text-sm text-[#00224c]">
                    Thank you! Your RSVP has been recorded.
                  </p>
                ) : (
                  <form className="space-y-4" onSubmit={onRsvp}>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Your name</label>
                      <input
                        disabled
                        readOnly
                        placeholder="Enter your name"
                        value={guestName}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 placeholder:text-gray-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Will you attend?</label>
                      <div className="space-y-2">
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 py-2.5 transition-all duration-200 ${
                            attending === 'yes'
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="attending"
                            value="yes"
                            checked={attending === 'yes'}
                            onChange={() => setAttending('yes')}
                          />
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                              attending === 'yes' ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}
                          >
                            <svg
                              className={`h-4 w-4 ${attending === 'yes' ? 'text-white' : 'text-gray-500'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              attending === 'yes' ? 'text-emerald-700' : 'text-gray-700'
                            }`}
                          >
                            I will attend
                          </span>
                        </label>

                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 py-2.5 transition-all duration-200 ${
                            attending === 'no'
                              ? 'border-red-400 bg-red-50/50'
                              : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="attending"
                            value="no"
                            checked={attending === 'no'}
                            onChange={() => setAttending('no')}
                          />
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                              attending === 'no' ? 'bg-red-400' : 'bg-gray-200'
                            }`}
                          >
                            <svg
                              className={`h-4 w-4 ${attending === 'no' ? 'text-white' : 'text-gray-500'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              attending === 'no' ? 'text-red-600' : 'text-gray-700'
                            }`}
                          >
                            Sorry, I can&apos;t make it
                          </span>
                        </label>
                      </div>
                    </div>

                    {attending === 'yes' && (
                      <div className="animate-[hero-fade-up_0.2s_ease-out]">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                          <label className="min-w-0 flex-1 basis-28 text-sm font-medium text-gray-700">
                            Number of guests (including you)
                          </label>
                          <div className="ms-auto flex shrink-0 items-center gap-2.5">
                            <button
                              type="button"
                              aria-label="Decrease guests"
                              onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 active:scale-90"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-lg font-semibold text-gray-900">{guestCount}</span>
                            <button
                              type="button"
                              aria-label="Increase guests"
                              disabled={guestCount >= 20}
                              onClick={() => setGuestCount((n) => Math.min(20, n + 1))}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:active:scale-100"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {attending && (
                      <div className="animate-[hero-fade-up_0.2s_ease-out] space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Message to the couple</label>
                        <textarea
                          value={rsvpMessage}
                          onChange={(e) => setRsvpMessage(e.target.value)}
                          placeholder="Leave a note (optional)"
                          rows={3}
                          maxLength={1000}
                          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 sm:text-sm"
                        />
                      </div>
                    )}

                    {rsvpError && (
                      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{rsvpError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={!attending || rsvpSubmitting}
                      className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none disabled:active:scale-100"
                      style={{
                        backgroundColor: '#00224c',
                        color: '#ded9d7',
                        boxShadow: 'rgba(0,0,0,0.2) 0 4px 12px -2px',
                      }}
                    >
                      {rsvpSubmitting ? 'Saving…' : 'Confirm'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Venue */}
        <Reveal as="section" className="relative z-10 flex w-full flex-col items-center px-6 pb-8 pt-8" delay={60}>
          <div className="relative text-center">
            <h3
              className="text-center uppercase"
              style={{ color: '#00224c', fontFamily: '"Times New Roman", serif', fontWeight: 700, letterSpacing: '0.03em' }}
            >
              Wedding Reception Venue
            </h3>
            <div
              className="mx-auto mt-2 max-w-[250px] whitespace-pre-line text-center text-[12px] leading-relaxed md:max-w-[440px] md:text-[14px]"
              style={{ color: 'rgba(1, 47, 83, 0.72)', fontFamily: 'Baskerville, "Times New Roman", serif' }}
            >
              {invitation.venue}
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center gap-4 md:gap-5">
            <iframe
              className="mt-3 h-[268px] w-full max-w-[338px] overflow-hidden rounded-[22px] shadow-[0_4px_14px_rgba(0,34,76,0.12)] md:h-[380px] md:max-w-[560px]"
              src={invitation.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Wedding venue map"
              style={{ border: 0 }}
            />
            <a
              href={invitation.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press group mt-1 inline-flex items-center gap-2.5 rounded-full px-6 py-2.5 text-[13px] uppercase tracking-[0.12em] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,34,76,0.28)] active:translate-y-0 active:scale-95 md:text-[14px]"
              style={{
                backgroundColor: '#00224c',
                color: '#ece4d8',
                fontFamily: '"Times New Roman", serif',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 34, 76, 0.18)',
              }}
            >
              <svg
                className="h-[15px] w-[15px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Get directions
            </a>
          </div>
        </Reveal>

        {/* Our Memories */}
        <Reveal as="section" className="relative z-10 mx-auto my-10 w-[88%] max-w-[420px] md:my-14 md:max-w-[560px]" delay={60}>
          <FloatingFlower
            src="/assets/flower3-decoration.webp"
            className="-left-[24%] top-[22%] w-[34%]"
            delay="0.4s"
            duration="6.2s"
          />
          <div className="relative overflow-hidden rounded-[18px] bg-white px-4 py-7 shadow-[4px_4px_10px_rgba(0,0,0,0.18)] md:px-6 md:py-8">
            <div className="mb-5 text-center">
              <h2
                className="text-[20px] uppercase"
                style={{ color: '#00224c', fontFamily: '"Times New Roman", serif', fontWeight: 700, letterSpacing: '0.03em' }}
              >
                Our Memories
              </h2>
              <p
                className="mt-1.5 text-[12px] md:text-[13px]"
                style={{ color: 'rgba(1, 47, 83, 0.65)', fontFamily: 'Baskerville, "Times New Roman", serif' }}
              >
                Moments we hold close
              </p>
            </div>
            <MemoryCarousel photos={invitation.gallery} />
          </div>
        </Reveal>

        {/* Schedule */}
        <Reveal as="section" className="relative z-10 mx-auto my-10 w-[88%] max-w-[420px] md:my-14 md:max-w-[560px]" delay={60}>
          <FloatingFlower
            src="/assets/flower6-decoration.webp"
            className="left-[82.9%] top-[30%] w-[40.8%]"
            delay="0.9s"
            duration="5.2s"
          />
          <div className="relative overflow-hidden rounded-[18px] px-6 py-9 shadow-[4px_4px_10px_rgba(0,0,0,0.25)]">
            <div aria-hidden className="absolute inset-0 rounded-[18px]" style={{ backgroundColor: '#00224c' }} />
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[18px] object-cover opacity-40 mix-blend-multiply"
              src="/assets/paper.webp"
            />
            <div className="relative z-10 flex flex-col gap-4 px-2">
              <h2
                className="text-center text-[20px] uppercase"
                style={{ color: '#ece4d8', fontFamily: '"Times New Roman", serif', fontWeight: 700, letterSpacing: '0.03em' }}
              >
                WEDDING DAY SCHEDULE
              </h2>
              <ol
                className="relative mx-auto grid w-full max-w-[460px] grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-x-6 gap-y-8 py-3 md:gap-x-8 md:gap-y-10"
                style={{ fontFamily: '"Times New Roman", serif' }}
              >
                {invitation.schedule.map((item, index) => {
                  const isFirst = index === 0
                  const isLast = index === invitation.schedule.length - 1
                  return (
                    <li key={item.time} className="contents">
                      <span
                        className="pt-0.5 text-right text-[16px] tabular-nums leading-snug tracking-wide md:text-[17px]"
                        style={{ color: '#ece4d8' }}
                      >
                        <span className="relative inline-block">
                          {item.icon && (
                            <span
                              aria-hidden
                              className="absolute top-1/2 right-full flex translate-y-[calc(-50%_+_27px)] items-center justify-center md:translate-y-[calc(-50%_+_32px)]"
                              style={{ marginRight: 30 }}
                            >
                              <img alt="" className={`block shrink-0 object-contain ${item.iconClass}`} src={item.icon} />
                            </span>
                          )}
                          {item.time}
                        </span>
                      </span>
                      <span aria-hidden className="relative flex items-center justify-center self-stretch">
                        <span
                          className={`absolute left-1/2 w-px -translate-x-1/2 ${
                            isFirst
                              ? 'top-1/2 -bottom-8 md:-bottom-10'
                              : isLast
                                ? '-top-8 bottom-1/2 md:-top-10'
                                : '-top-8 -bottom-8 md:-top-10 md:-bottom-10'
                          }`}
                          style={{ backgroundColor: 'color-mix(in srgb, #ece4d8 40%, transparent)' }}
                        />
                        <span
                          className="relative block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: '#ece4d8',
                            boxShadow: 'color-mix(in srgb, #ece4d8 13%, transparent) 0 0 0 2px',
                          }}
                        />
                      </span>
                      <span className="text-[13px] md:text-[15px]" style={{ color: 'rgba(236, 228, 216, 0.7)' }}>
                        {item.title}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </Reveal>

        {/* Guestbook */}
        <Reveal as="section" className="relative z-10 mx-auto my-10 w-[88%] max-w-[420px] md:my-14 md:max-w-[560px]" delay={60}>
          <FloatingFlower
            src="/assets/flower4-decoration.webp"
            className="-left-[6.4%] top-[68.3%] w-[32.1%]"
            delay="0.5s"
            duration="5.8s"
            flip
          />
          <div className="relative overflow-hidden rounded-[18px] bg-white px-4 py-8 shadow-[4px_4px_10px_rgba(0,0,0,0.25)]">
            <div className="text-center">
              <h2
                className="text-[20px] font-bold uppercase md:text-[24px]"
                style={{ color: '#00224c', fontFamily: '"Times New Roman", serif', letterSpacing: '0.03em' }}
              >
                Guestbook
              </h2>
            </div>
            <form className="mx-auto mt-6 w-full max-w-full md:max-w-[600px]" onSubmit={onWish}>
              <div className="mb-4">
                <input
                  placeholder="Enter your name*"
                  className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                  maxLength={500}
                  required
                  value={wishName}
                  onChange={(e) => setWishName(e.target.value)}
                  style={{ borderColor: '#00224c', color: '#00224c' }}
                />
              </div>
              <textarea
                placeholder="Enter your wishes*"
                className="h-[70px] w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-sm focus:outline-none md:h-[110px]"
                maxLength={10000}
                required
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                style={{ borderColor: '#00224c', color: '#00224c' }}
              />
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  title="Generate wish"
                  className="rounded-xl p-2 text-base leading-none transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{ backgroundColor: 'rgba(0, 34, 76, 0.1)', color: '#00224c' }}
                  onClick={fillSampleWish}
                >
                  🪄
                </button>
                <button
                  type="submit"
                  disabled={wishSubmitting}
                  className="rounded-full px-6 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: '#00224c', fontFamily: '"Times New Roman", serif' }}
                >
                  {wishSubmitting ? 'SENDING…' : 'SEND WISHES'}
                </button>
              </div>
              {wishError && (
                <p className="mt-2 text-center text-xs text-red-600">{wishError}</p>
              )}
            </form>
            <div className="mx-auto mt-8 max-h-[500px] w-full max-w-full space-y-3 overflow-y-auto pr-2 md:max-w-[600px]">
              {wishes.length === 0 ? (
                <p className="flex flex-col items-center text-center text-sm opacity-70">No wishes yet. Be the first!</p>
              ) : (
                wishes.map((w) => (
                  <div key={w.id} className="rounded-xl border border-[#00224c]/15 px-4 py-3 text-left">
                    <p className="text-sm font-semibold text-[#00224c]">{w.name}</p>
                    <p className="mt-1 text-sm text-[#00224c]/80">{w.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Reveal>

        <Reveal as="footer" className="relative z-10 flex flex-col items-center px-6 pb-6 text-center" delay={40} offset={20}>
          <span
            className="mx-auto flex flex-col items-center gap-1 whitespace-pre-line text-[11px] md:max-w-[560px] md:text-[13px]"
            style={{ color: '#00224c', fontFamily: '"Times New Roman", serif' }}
          >
            Your presence would be the greatest gift we could receive!
          </span>
        </Reveal>
        <div className="relative z-10 flex items-center justify-center pb-2">
          <img alt="" aria-hidden className="block w-[45px] max-w-none object-contain" src="/assets/goldenline3-decoration.webp" />
        </div>
        <div className="relative z-20 flex items-center justify-center pb-3">
          <span className="text-xs opacity-50" style={{ color: '#00224c' }}>
            Dilesh & Sayuri · November 2, 2026
          </span>
        </div>
      </div>
    </div>
  )
}
