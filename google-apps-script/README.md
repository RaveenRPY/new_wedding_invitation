# Deploy steps for Google Sheet storage
#
# 1. Open your spreadsheet
# 2. Extensions → Apps Script
# 3. Delete old code and paste the FULL contents of Code.gs → Save
# 4. Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy
#    (First time: Deploy → New deployment → Web app
#       Execute as: Me | Who has access: Anyone)
# 5. Copy the Web app URL into Vercel as VITE_GOOGLE_SCRIPT_URL and redeploy
#
# Attendances sheet columns: No | Name | Attendance (Yes/No) | Count | Note
# Wishes sheet columns:      Name | Wish
#
# Re-RSVP for the same guest Name UPDATES that row (does not add a new one).
# If duplicate rows already exist for a name, the next update keeps one and removes the extras.
