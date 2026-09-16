import { useEffect, useState } from 'react'
import type { Wish } from './data'

export function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const diff = Math.max(0, target.getTime() - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

const WISHES_KEY = 'dilesh-sayuri-wishes'
const RSVP_KEY = 'dilesh-sayuri-rsvp'

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHES_KEY) || '[]') as Wish[]
    } catch {
      return []
    }
  })

  const addWish = (name: string, message: string) => {
    const next: Wish[] = [
      {
        id: crypto.randomUUID(),
        name,
        message,
        createdAt: Date.now(),
      },
      ...wishes,
    ]
    setWishes(next)
    localStorage.setItem(WISHES_KEY, JSON.stringify(next))
  }

  return { wishes, addWish }
}

export type RsvpPayload = {
  name: string
  attending: 'yes' | 'no'
  guestCount?: number
  message?: string
}

export function useRsvp() {
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(RSVP_KEY) === '1')

  const submit = (payload: RsvpPayload) => {
    localStorage.setItem(
      `${RSVP_KEY}-data`,
      JSON.stringify({ ...payload, at: Date.now() }),
    )
    localStorage.setItem(RSVP_KEY, '1')
    setSubmitted(true)
  }

  return { submitted, submit }
}
