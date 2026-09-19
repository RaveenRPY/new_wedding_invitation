export function isAdminPath(pathname = window.location.pathname) {
  const first = pathname.split('/').filter(Boolean)[0]
  return (first || '').toLowerCase() === 'admin'
}
