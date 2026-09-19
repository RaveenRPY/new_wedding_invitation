import { useEffect, useState } from 'react'
import type { Wish } from './data'
import {
  fetchAttendance,
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

function rsvpStorageKey(guestName: string) {
  return `${RSVP_KEY}:${guestName.trim().toLowerCase()}`
}

function readLocalRsvp(guestName: string): RsvpPayload | null {
  try {
    const raw = localStorage.getItem(rsvpStorageKey(guestName))
    if (!raw) {
      // Migrate legacy single-guest cache if name matches current guest
      const legacyFlag = localStorage.getItem(RSVP_KEY)
      const legacyData = localStorage.getItem(`${RSVP_KEY}-data`)
      if (legacyFlag === '1' && legacyData) {
        const parsed = JSON.parse(legacyData) as RsvpPayload & { name?: string }
        if (
          !parsed.name ||
          parsed.name.trim().toLowerCase() === guestName.trim().toLowerCase()
        ) {
          return {
            name: guestName,
            attending: parsed.attending,
            guestCount: parsed.guestCount,
            message: parsed.message,
          }
        }
      }
      return null
    }
    return JSON.parse(raw) as RsvpPayload
  } catch {
    return null
  }
}

function writeLocalRsvp(payload: RsvpPayload) {
  localStorage.setItem(rsvpStorageKey(payload.name), JSON.stringify(payload))
  localStorage.setItem(RSVP_KEY, '1')
  localStorage.setItem(`${RSVP_KEY}-data`, JSON.stringify({ ...payload, at: Date.now() }))
}

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

export function useRsvp(guestName: string) {
  const [existing, setExisting] = useState<RsvpPayload | null>(() => readLocalRsvp(guestName))
  const [loading, setLoading] = useState(() => sheetsConfigured())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setJustSaved(false)

    async function load() {
      setLoading(true)
      try {
        if (sheetsConfigured()) {
          const remote = await fetchAttendance(guestName)
          if (cancelled) return
          if (remote) {
            const normalized: RsvpPayload = {
              name: guestName,
              attending: remote.attending,
              guestCount: remote.guestCount,
              message: remote.message,
            }
            setExisting(normalized)
            writeLocalRsvp(normalized)
            return
          }
        }
        if (!cancelled) {
          setExisting(readLocalRsvp(guestName))
        }
      } catch {
        if (!cancelled) setExisting(readLocalRsvp(guestName))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [guestName])

  const submit = async (payload: RsvpPayload) => {
    setError(null)
    setSubmitting(true)
    setJustSaved(false)
    try {
      if (sheetsConfigured()) {
        await submitAttendance(payload)
      }
      writeLocalRsvp(payload)
      setExisting(payload)
      setJustSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save RSVP')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return {
    existing,
    hasRsvp: Boolean(existing),
    loading,
    submit,
    submitting,
    error,
    justSaved,
  }
}
