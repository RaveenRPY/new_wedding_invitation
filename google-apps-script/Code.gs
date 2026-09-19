/**
 * Paste this into: Google Sheet → Extensions → Apps Script
 * Then: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into Vercel as VITE_GOOGLE_SCRIPT_URL
 *
 * Spreadsheet tabs expected:
 *   Attendances — No | Name | Attendance | Count | Note
 *   Wishes      — Name | Wish
 */

const SPREADSHEET_ID = '1Rb9J09PSdAUX-Fl7nj0oXOYFqYZuWIAWGGQikFchUQQ'
const ATTENDANCES_SHEET = 'Attendances'
const WISHES_SHEET = 'Wishes'

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'wishes'
  try {
    if (action === 'wishes') {
      return json_({ ok: true, wishes: readWishes_() })
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
      appendAttendance_(data)
      return json_({ ok: true })
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

function appendAttendance_(data) {
  const sheet = getSheet_(ATTENDANCES_SHEET)
  const lastRow = Math.max(1, sheet.getLastRow())
  const nextNo = lastRow // header is row 1, so next No ≈ lastRow
  const attendance = data.attending === 'yes' ? 'Attending' : 'Not Attending'
  const count = data.attending === 'yes' ? Number(data.guestCount) || 1 : 0
  const note = data.message || ''
  sheet.appendRow([nextNo, data.name || '', attendance, count, note])
}

function appendWish_(data) {
  const sheet = getSheet_(WISHES_SHEET)
  sheet.appendRow([data.name || '', data.message || ''])
}

function readWishes_() {
  const sheet = getSheet_(WISHES_SHEET)
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const values = sheet.getRange(2, 1, lastRow, 2).getValues()
  return values
    .filter((row) => String(row[0]).trim() || String(row[1]).trim())
    .map((row, i) => ({
      id: `sheet-${i}-${String(row[0]).slice(0, 24)}`,
      name: String(row[0] || ''),
      message: String(row[1] || ''),
      createdAt: 0,
    }))
    .reverse()
}

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(name)
  if (!sheet) throw new Error('Missing sheet: ' + name)
  return sheet
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
