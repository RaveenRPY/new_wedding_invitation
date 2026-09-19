import { useEffect, useState } from 'react'
import type { Wish } from './data'
import {
  fetchWishesFromSheet,
  sheetsConfigured,
  submitAttendance,
  submitWish,
} from './sheets'

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

function readLocalWishes(): Wish[] {
  try {
    return JSON.parse(localStorage.getItem(WISHES_KEY) || '[]') as Wish[]
  } catch {
    return []
  }
}

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>(readLocalWishes)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sheetsConfigured()) return
    let cancelled = false
    void fetchWishesFromSheet()
      .then((remote) => {
        if (cancelled || remote.length === 0) return
        setWishes(remote)
        localStorage.setItem(WISHES_KEY, JSON.stringify(remote))
      })
      .catch(() => {
        /* keep local cache if sheet load fails */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addWish = async (name: string, message: string) => {
    setError(null)
    setSubmitting(true)
    try {
      if (sheetsConfigured()) {
        await submitWish(name, message)
      }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send wish')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return { wishes, addWish, submitting, error }
}

export type RsvpPayload = {
  name: string
  attending: 'yes' | 'no'
  guestCount?: number
  message?: string
}

export function useRsvp() {
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(RSVP_KEY) === '1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (payload: RsvpPayload) => {
    setError(null)
    setSubmitting(true)
    try {
      if (sheetsConfigured()) {
        await submitAttendance(payload)
      }
      localStorage.setItem(`${RSVP_KEY}-data`, JSON.stringify({ ...payload, at: Date.now() }))
      localStorage.setItem(RSVP_KEY, '1')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save RSVP')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return { submitted, submit, submitting, error }
}
