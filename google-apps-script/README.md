# Deploy steps for Google Sheet storage
#
# 1. Open your spreadsheet
# 2. Extensions → Apps Script
# 3. Paste contents of google-apps-script/Code.gs and Save
# 4. Deploy → New deployment → Type: Web app
#      Execute as: Me
#      Who has access: Anyone
# 5. Copy the Web app URL
# 6. Local: put it in .env as VITE_GOOGLE_SCRIPT_URL=...
#    Vercel: Project → Settings → Environment Variables → same name
# 7. Redeploy the site
#
# Attendances sheet columns: No | Name | Attendance (Yes/No) | Count | Note
# Wishes sheet columns:      Name | Wish
#
# Attendance is looked up / updated by guest Name (case-insensitive).
# Redeploy the Apps Script web app after changing Code.gs.
