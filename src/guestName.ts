import { isAdminPath } from './adminPath'

/** Read personalized guest name from the URL.
 *  Examples: `?to=Hubby`  ·  `?to=Mr.%20%26%20Mrs.%20Silva`  ·  `/hubby`
 */
export function guestNameFromUrl(fallback: string): string {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('to') ?? params.get('guest') ?? params.get('name')
  if (fromQuery?.trim()) {
    return decodeURIComponent(fromQuery.trim().replace(/\+/g, ' ')).trim() || fallback
  }

  if (isAdminPath()) return fallback

  const segment = window.location.pathname.split('/').filter(Boolean).pop()
  if (!segment || segment === 'index.html') return fallback

  try {
    const name = decodeURIComponent(segment)
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!name) return fallback
    // Title-case slug paths like "aunt-nimal" → "Aunt Nimal"
    return name.replace(/\b\w/g, (c) => c.toUpperCase())
  } catch {
    return fallback
  }
}
