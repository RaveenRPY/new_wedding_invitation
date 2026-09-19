/**
 * Paste this ENTIRE file into: Google Sheet → Extensions → Apps Script
 * Then: Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy
 *
 * Attendance rows are UPDATED by Name when the guest RSVPs again (not duplicated).
 *
 * Tabs expected:
 *   Attendances — No | Name | Attendance | Count | Note
 *   Wishes      — Name | Wish
 *
 * Admin dashboard: /admin  (PIN must match ADMIN_TOKEN below)
 *
 * Note: getRange(row, column, numRows, numColumns) uses SIZE, not end row/column.
 */

const SPREADSHEET_ID = '1Rb9J09PSdAUX-Fl7nj0oXOYFqYZuWIAWGGQikFchUQQ'
const ATTENDANCES_SHEET = 'Attendances'
const WISHES_SHEET = 'Wishes'
/** PIN for /admin — change this, then redeploy the web app. */
const ADMIN_TOKEN = 'DS021126'

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'wishes'
  try {
    if (action === 'wishes') {
      return json_({ ok: true, wishes: readWishes_() })
    }
    if (action === 'attendance') {
      const name = (e.parameter && e.parameter.name) || ''
      return json_({ ok: true, attendance: findAttendance_(name) })
    }
    if (action === 'admin') {
      if (!adminAuthorized_(e)) {
        return json_({ ok: false, error: 'Unauthorized' })
      }
      return json_({
        ok: true,
        attendances: readAllAttendances_(),
        wishes: readWishes_(),
      })
    }
    return json_({ ok: false, error: 'Unknown action' })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    if (data.type === 'attendance') {
      const result = upsertAttendance_(data)
      return json_({ ok: true, action: result.action })
    }
    if (data.type === 'wish') {
      appendWish_(data)
      return json_({ ok: true })
    }
    return json_({ ok: false, error: 'Unknown type' })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function normalizeName_(name) {
  return String(name || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function adminAuthorized_(e) {
  const token = String((e && e.parameter && e.parameter.token) || '').trim()
  return Boolean(token) && token === String(ADMIN_TOKEN).trim()
}

function attendanceFromRow_(row) {
  const attendanceRaw = String(row[2] || '')
    .trim()
    .toLowerCase()
  const attending =
    attendanceRaw === 'yes' || attendanceRaw === 'attending' ? 'yes' : 'no'
  const count = Number(row[3]) || 0
  return {
    no: Number(row[0]) || 0,
    name: String(row[1] || ''),
    attending: attending,
    guestCount: attending === 'yes' ? Math.max(1, count || 1) : undefined,
    message: String(row[4] || ''),
  }
}

function readAllAttendances_() {
  const sheet = getSheet_(ATTENDANCES_SHEET)
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const values = sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues()
  return values
    .filter(function (row) {
      return String(row[1] || '').trim()
    })
    .map(attendanceFromRow_)
}

/** Returns all matching row numbers (1-based), oldest first. */
function findAttendanceRowNumbers_(name) {
  const sheet = getSheet_(ATTENDANCES_SHEET)
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const target = normalizeName_(name)
  if (!target) return []

  const numRows = lastRow - 1
  const names = sheet.getRange(2, 2, numRows, 1).getDisplayValues()
  const rows = []
  for (var i = 0; i < names.length; i++) {
    if (normalizeName_(names[i][0]) === target) {
      rows.push(i + 2)
    }
  }
  return rows
}

function findAttendance_(name) {
  const rows = findAttendanceRowNumbers_(name)
  if (!rows.length) return null
  const sheet = getSheet_(ATTENDANCES_SHEET)
  const row = rows[rows.length - 1]
  const values = sheet.getRange(row, 1, 1, 5).getDisplayValues()[0]
  return attendanceFromRow_(values)
}

function nextAttendanceNo_(sheet) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return 1
  const numRows = lastRow - 1
  const nos = sheet.getRange(2, 1, numRows, 1).getValues()
  var max = 0
  for (var i = 0; i < nos.length; i++) {
    var n = Number(nos[i][0])
    if (!isNaN(n) && n > max) max = n
  }
  return max + 1
}

function upsertAttendance_(data) {
  const lock = LockService.getScriptLock()
  lock.waitLock(15000)

  try {
    const sheet = getSheet_(ATTENDANCES_SHEET)
    const attendance = data.attending === 'yes' ? 'Yes' : 'No'
    const count = data.attending === 'yes' ? Number(data.guestCount) || 1 : 0
    const note = data.message || ''
    const name = String(data.name || '').trim()
    const rows = findAttendanceRowNumbers_(name)

    if (rows.length > 0) {
      const keepRow = rows[0]
      // 1 row × 4 columns (Name, Attendance, Count, Note)
      sheet.getRange(keepRow, 2, 1, 4).setValues([[name, attendance, count, note]])
      SpreadsheetApp.flush()

      for (var i = rows.length - 1; i >= 1; i--) {
        sheet.deleteRow(rows[i])
      }
      return { action: 'updated' }
    }

    const nextNo = nextAttendanceNo_(sheet)
    sheet.appendRow([nextNo, name, attendance, count, note])
    SpreadsheetApp.flush()
    return { action: 'created' }
  } finally {
    lock.releaseLock()
  }
}

function appendWish_(data) {
  const sheet = getSheet_(WISHES_SHEET)
  sheet.appendRow([data.name || '', data.message || ''])
}

function readWishes_() {
  const sheet = getSheet_(WISHES_SHEET)
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const numRows = lastRow - 1
  const values = sheet.getRange(2, 1, numRows, 2).getDisplayValues()
  return values
    .filter(function (row) {
      return String(row[0]).trim() || String(row[1]).trim()
    })
    .map(function (row, i) {
      return {
        id: 'sheet-' + i + '-' + String(row[0]).slice(0, 24),
        name: String(row[0] || ''),
        message: String(row[1] || ''),
        createdAt: 0,
      }
    })
    .reverse()
}

function getSpreadsheet_() {
  var active = SpreadsheetApp.getActiveSpreadsheet()
  if (active) return active
  return SpreadsheetApp.openById(SPREADSHEET_ID)
}

function getSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name)
  if (!sheet) throw new Error('Missing sheet: ' + name)
  return sheet
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
