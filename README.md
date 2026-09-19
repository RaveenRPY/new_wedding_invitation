# Dilesh & Sayuri Wedding Invitation

A faithful clone of the [Chung Đôi invitation](https://chungdoi.com/i/lakruwandilesh-sayurisilva/hubby) (minimalism dark-blue theme).

## Features

- Envelope cover with personalized guest name (**Hubby**)
- Floating polaroid envelope hero with couple photos
- Ceremony & reception info cards
- Live countdown + November 2026 calendar (heart on the 2nd)
- RSVP form (saved in `localStorage`)
- Venue map + directions
- Wedding day schedule timeline
- Guestbook with sample-wish helper
- Background music (*Beautiful in White*) with animated player button

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173/

Admin dashboard (groom & bride): http://127.0.0.1:5173/admin  
PIN is `ADMIN_TOKEN` in `google-apps-script/Code.gs`. After changing the script, deploy a new Apps Script version.

## Customize

Edit invitation copy, dates, venue, and asset paths in `src/data.ts`.

Theme images live in `public/assets/`, couple photos in `public/uploads/`, and music in `public/music/`.
