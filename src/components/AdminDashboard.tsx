import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { invitation, type Wish } from '../data'
import { fetchAdminDashboard, sheetsConfigured, type AttendanceRow } from '../sheets'

const TOKEN_KEY = 'dilesh-sayuri-admin-token'
const REFRESH_MS = 45_000

type Tab = 'attendance' | 'wishes'
type Filter = 'all' | 'yes' | 'no'

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function writeStoredToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore quota / private mode */
  }
}

function clearStoredToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

function csvCell(value: string | number) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function downloadAttendanceCsv(rows: AttendanceRow[]) {
  const header = ['No', 'Name', 'Attendance', 'Count', 'Note']
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        csvCell(row.no || ''),
        csvCell(row.name),
        csvCell(row.attending === 'yes' ? 'Yes' : 'No'),
        csvCell(row.attending === 'yes' ? (row.guestCount ?? 1) : 0),
        csvCell(row.message || ''),
      ].join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendance-${invitation.groomFirst}-${invitation.brideFirst}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function AdminDashboard() {
  const [token, setToken] = useState(readStoredToken)
  const [pin, setPin] = useState('')
  const [tab, setTab] = useState<Tab>('attendance')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [attendances, setAttendances] = useState<AttendanceRow[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(() => Boolean(readStoredToken()))
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const unlocked = Boolean(token)

  const load = useCallback(async (secret: string, silent = false) => {
    if (!secret.trim()) return
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)
    setAuthError(null)
    try {
      const data = await fetchAdminDashboard(secret)
      setAttendances(data.attendances)
      setWishes(data.wishes)
      setUpdatedAt(Date.now())
      writeStoredToken(secret.trim())
      setToken(secret.trim())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load dashboard'
      if (message === 'Unauthorized') {
        clearStoredToken()
        setToken('')
        setAttendances([])
        setWishes([])
        setAuthError('Wrong PIN. Please try again.')
        return
      }
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    document.title = `Admin · ${invitation.groomFirst} & ${invitation.brideFirst}`
    const html = document.documentElement
    html.style.scrollPaddingTop = '5.5rem'
    return () => {
      document.title = `${invitation.groomFirst} & ${invitation.brideFirst}`
      html.style.scrollPaddingTop = ''
    }
  }, [])

  useEffect(() => {
    const stored = readStoredToken()
    if (stored) void load(stored)
  }, [load])

  useEffect(() => {
    if (!token) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(token, true)
    }, REFRESH_MS)
    return () => window.clearInterval(id)
  }, [token, load])

  const onUnlock = (e: FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) {
      setAuthError('Enter the admin PIN.')
      return
    }
    if (!sheetsConfigured()) {
      setAuthError('Google Sheet is not configured (missing VITE_GOOGLE_SCRIPT_URL).')
      return
    }
    void load(pin.trim())
  }

  const logout = () => {
    clearStoredToken()
    setToken('')
    setPin('')
    setAttendances([])
    setWishes([])
    setError(null)
    setAuthError(null)
    setUpdatedAt(null)
  }

  const stats = useMemo(() => {
    const attending = attendances.filter((row) => row.attending === 'yes')
    const declined = attendances.filter((row) => row.attending === 'no')
    const headcount = attending.reduce((sum, row) => sum + (row.guestCount ?? 1), 0)
    return {
      rsvps: attendances.length,
      attending: attending.length,
      declined: declined.length,
      headcount,
      wishes: wishes.length,
    }
  }, [attendances, wishes.length])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return attendances
      .filter((row) => (filter === 'all' ? true : row.attending === filter))
      .filter((row) => {
        if (!q) return true
        return `${row.name} ${row.message ?? ''}`.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        const byNo = (a.no || Number.MAX_SAFE_INTEGER) - (b.no || Number.MAX_SAFE_INTEGER)
        if (byNo !== 0) return byNo
        return a.name.localeCompare(b.name)
      })
  }, [attendances, filter, query])

  const filteredWishes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return wishes
    return wishes.filter((wish) => `${wish.name} ${wish.message}`.toLowerCase().includes(q))
  }, [wishes, query])

  const summary = `${invitation.groomFirst} & ${invitation.brideFirst} — ${stats.rsvps} RSVPs · ${stats.attending} attending (${stats.headcount} guests) · ${stats.declined} declined · ${stats.wishes} wishes`

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  if (!unlocked) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center px-5 py-10"
        style={{
          backgroundColor: '#f7f5ee',
          backgroundImage: 'url(/assets/paper.webp)',
          backgroundSize: 'cover',
          color: '#00224c',
        }}
      >
        <form
          onSubmit={onUnlock}
          className="w-full max-w-sm rounded-3xl border border-[#00224c22] bg-white/70 p-8 shadow-xl backdrop-blur-sm"
        >
          <p
            className="text-center text-[11px] uppercase tracking-[0.22em] opacity-60"
            style={{ fontFamily: '"Times New Roman", serif', fontWeight: 700 }}
          >
            Private dashboard
          </p>
          <h1
            className="mt-2 text-center text-4xl"
            style={{ fontFamily: '"The Nautigal", cursive', fontWeight: 400 }}
          >
            {invitation.groomFirst} & {invitation.brideFirst}
          </h1>
          <p className="mt-2 text-center text-sm opacity-70">
            Attendance, guest counts, and wishes — for the two of you.
          </p>
          <label className="mt-6 block text-sm font-medium text-[#00224c]/80">Admin PIN</label>
          <input
            type="password"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setAuthError(null)
            }}
            placeholder="Enter PIN"
            className="mt-1.5 w-full rounded-2xl border border-[#00224c22] bg-white px-4 py-3 text-base tracking-[0.18em] outline-none ring-[#00224c] focus:ring-2"
          />
          {(authError || error) && (
            <p className="mt-3 text-center text-sm text-red-600">{authError || error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-40"
            style={{ backgroundColor: '#00224c', color: '#ece4d8' }}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: '#f7f5ee', color: '#00224c' }}>
      <header
        className="sticky top-0 z-20 border-b border-white/10"
        style={{ background: 'linear-gradient(160deg, #073268 0%, #00224c 48%, #001531 100%)' }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#ece4d8]/70">Admin dashboard</p>
            <h1
              className="text-2xl text-[#ece4d8] sm:text-3xl"
              style={{ fontFamily: '"The Nautigal", cursive' }}
            >
              {invitation.groomFirst} & {invitation.brideFirst}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void load(token, true)}
              disabled={refreshing || loading}
              className="rounded-full border border-white/25 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#ece4d8] disabled:opacity-40"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#ece4d8]"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {error && (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="RSVPs" value={stats.rsvps} />
          <StatCard label="Attending" value={stats.attending} accent="emerald" />
          <StatCard label="Guests" value={stats.headcount} accent="navy" />
          <StatCard label="Declined" value={stats.declined} accent="rose" />
          <StatCard label="Wishes" value={stats.wishes} className="col-span-2 sm:col-span-1" />
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
          <p>{updatedAt ? `Updated ${formatTime(updatedAt)}` : loading ? 'Loading…' : '—'}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copySummary()}
              className="rounded-full border border-[#00224c22] bg-white px-3 py-1.5"
            >
              {copied ? 'Copied' : 'Copy summary'}
            </button>
            <button
              type="button"
              onClick={() => downloadAttendanceCsv(attendances)}
              disabled={attendances.length === 0}
              className="rounded-full border border-[#00224c22] bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2 rounded-full bg-[#00224c]/8 p-1">
          <TabButton active={tab === 'attendance'} onClick={() => setTab('attendance')}>
            Attendance
          </TabButton>
          <TabButton active={tab === 'wishes'} onClick={() => setTab('wishes')}>
            Wishes ({wishes.length})
          </TabButton>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'attendance' ? 'Search guests or notes' : 'Search wishes'}
            className="w-full flex-1 rounded-2xl border border-[#00224c22] bg-white px-4 py-2.5 text-sm outline-none ring-[#00224c] focus:ring-2"
          />
          {tab === 'attendance' && (
            <div className="flex gap-2">
              {(['all', 'yes', 'no'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.1em] ${
                    filter === key ? 'bg-[#00224c] text-[#ece4d8]' : 'bg-white text-[#00224c]'
                  }`}
                >
                  {key === 'all' ? 'All' : key === 'yes' ? 'Attending' : 'Declined'}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && attendances.length === 0 && wishes.length === 0 ? (
          <p className="mt-8 text-center text-sm opacity-70">Loading responses…</p>
        ) : tab === 'attendance' ? (
          <AttendanceList rows={filtered} />
        ) : (
          <WishList wishes={filteredWishes} />
        )}
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  className = '',
}: {
  label: string
  value: number
  accent?: 'emerald' | 'navy' | 'rose'
  className?: string
}) {
  const color =
    accent === 'emerald' ? '#047857' : accent === 'rose' ? '#be123c' : '#00224c'
  return (
    <div className={`rounded-2xl border border-[#00224c14] bg-white/80 p-4 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.16em] opacity-55">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${
        active ? 'bg-[#00224c] text-[#ece4d8] shadow-sm' : 'text-[#00224c]/70'
      }`}
    >
      {children}
    </button>
  )
}

function AttendanceList({ rows }: { rows: AttendanceRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-8 text-center text-sm opacity-70">No matching RSVPs yet.</p>
    )
  }

  return (
    <>
      <ul className="mt-4 space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={`${row.no}-${row.name}`}
            className="rounded-2xl border border-[#00224c14] bg-white/85 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.name}</p>
                {row.message ? <p className="mt-1 text-sm opacity-70">{row.message}</p> : null}
              </div>
              <StatusPill attending={row.attending} count={row.guestCount} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#00224c14] bg-white/85 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#00224c]/6 text-[11px] uppercase tracking-[0.12em] opacity-70">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Guests</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.no}-${row.name}`} className="border-t border-[#00224c10]">
                <td className="px-4 py-3 tabular-nums opacity-60">{row.no || '—'}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">
                  <StatusPill attending={row.attending} count={row.guestCount} />
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {row.attending === 'yes' ? (row.guestCount ?? 1) : '—'}
                </td>
                <td className="px-4 py-3 opacity-75">{row.message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function WishList({ wishes }: { wishes: Wish[] }) {
  if (wishes.length === 0) {
    return <p className="mt-8 text-center text-sm opacity-70">No matching wishes yet.</p>
  }

  return (
    <ul className="mt-4 space-y-3">
      {wishes.map((wish) => (
        <li key={wish.id} className="rounded-2xl border border-[#00224c14] bg-white/85 p-4">
          <p className="text-sm font-semibold">{wish.name || 'Guest'}</p>
          <p className="mt-1 text-sm leading-relaxed opacity-80">{wish.message}</p>
        </li>
      ))}
    </ul>
  )
}

function StatusPill({ attending, count }: { attending: 'yes' | 'no'; count?: number }) {
  if (attending === 'yes') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
        Attending{typeof count === 'number' ? ` · ${count}` : ''}
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-800">
      Declined
    </span>
  )
}
