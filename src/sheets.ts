import type { Wish } from './data'
import type { RsvpPayload } from './hooks'

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined

export type AttendanceRow = {
  no: number
  name: string
  attending: 'yes' | 'no'
  guestCount?: number
  message?: string
}

export type AdminDashboardData = {
  attendances: AttendanceRow[]
  wishes: Wish[]
}

export function sheetsConfigured() {
  return Boolean(SCRIPT_URL?.trim())
}

async function postToSheet(body: Record<string, unknown>) {
  if (!SCRIPT_URL?.trim()) {
    throw new Error('Google Sheet is not configured (missing VITE_GOOGLE_SCRIPT_URL)')
  }

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    // text/plain avoids a CORS preflight against Apps Script
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow',
  })

  const text = await res.text()
  if (!text) {
    if (!res.ok) throw new Error('Sheet write failed')
    return
  }

  try {
    const data = JSON.parse(text) as { ok?: boolean; error?: string }
    if (data.ok === false) throw new Error(data.error || 'Sheet write failed')
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Non-JSON redirect body from Apps Script — treat HTTP ok as success
      if (!res.ok) throw new Error('Sheet write failed')
      return
    }
    throw err
  }
}

export async function submitAttendance(payload: RsvpPayload) {
  await postToSheet({
    type: 'attendance',
    name: payload.name,
    attending: payload.attending,
    guestCount: payload.guestCount,
    message: payload.message,
  })
}

export async function submitWish(name: string, message: string) {
  await postToSheet({
    type: 'wish',
    name,
    message,
  })
}

export async function fetchWishesFromSheet(): Promise<Wish[]> {
  if (!SCRIPT_URL?.trim()) return []

  const url = new URL(SCRIPT_URL)
  url.searchParams.set('action', 'wishes')

  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' })
  const data = (await res.json()) as { ok?: boolean; wishes?: Wish[]; error?: string }
  if (!data.ok) throw new Error(data.error || 'Failed to load wishes')
  return data.wishes ?? []
}

export async function fetchAttendance(name: string): Promise<RsvpPayload | null> {
  if (!SCRIPT_URL?.trim() || !name.trim()) return null

  const url = new URL(SCRIPT_URL)
  url.searchParams.set('action', 'attendance')
  url.searchParams.set('name', name.trim())

  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' })
  const data = (await res.json()) as {
    ok?: boolean
    attendance?: RsvpPayload | null
    error?: string
  }
  if (!data.ok) throw new Error(data.error || 'Failed to load attendance')
  return data.attendance ?? null
}

export async function fetchAdminDashboard(token: string): Promise<AdminDashboardData> {
  if (!SCRIPT_URL?.trim()) {
    throw new Error('Google Sheet is not configured (missing VITE_GOOGLE_SCRIPT_URL)')
  }

  const url = new URL(SCRIPT_URL)
  url.searchParams.set('action', 'admin')
  url.searchParams.set('token', token.trim())

  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' })
  const data = (await res.json()) as {
    ok?: boolean
    attendances?: AttendanceRow[]
    wishes?: Wish[]
    error?: string
  }

  if (data.error === 'Unauthorized') throw new Error('Unauthorized')
  if (data.error === 'Unknown action') {
    throw new Error(
      'The sheet script needs a new deploy. Paste the latest google-apps-script/Code.gs and deploy a new version.',
    )
  }
  if (!data.ok) throw new Error(data.error || 'Failed to load dashboard')

  return {
    attendances: data.attendances ?? [],
    wishes: data.wishes ?? [],
  }
}
