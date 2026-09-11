# CMS Headset Update Tour

A small site for coordinating the 7–8 person team updating headsets across
Charlotte-Mecklenburg Schools on **Tuesday Sept 22 – Wednesday Sept 23,
2026**. Each team member sees their own route and what's next; a team board
gives a live view of everyone at once; and every campus has a shared notes
thread.

## Views

- **My Route** — pick your name, see today's and tomorrow's stops in order,
  with a banner showing your current/next campus. Mark a stop
  Not started / In progress / Done / Needs follow-up, and leave notes for
  a campus (missing headsets, access issues, contact changed, etc.).
- **Team Board** — one table with every team member's Day 1 / Day 2 route
  and live status, so a coordinator can see the whole operation at a
  glance and know who needs help.
- **Campus Notes** — searchable feed of every note left on any campus,
  across the whole team.

## Setup (live sync via Supabase)

Status updates and notes are stored in [Supabase](https://supabase.com) so
they sync across every device in real time. Until it's configured, the
site still works, but status/notes only save to the browser you're using
(useful for a quick local preview).

1. Create a free Supabase project.
2. Open the SQL editor and run everything in [`schema.sql`](schema.sql).
3. In **Project Settings → API**, copy the **Project URL** and **anon
   public** key.
4. Paste them into `js/supabase-config.js`:
   ```js
   const SUPABASE_URL = "https://xxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJ...";
   ```
5. Commit/deploy. Any static host works (GitHub Pages, Netlify, etc.) —
   there's no build step, `index.html` just needs to be served.

Note: this uses Supabase's public `anon` key with open read/write
policies, intended for a short internal event with no login. Don't reuse
this schema for anything sensitive.

## Editing the schedule

Everything lives in [`js/data.js`](js/data.js):

- `TEAM` — the roster (id + display name). Rename `tm7` / `tm8` once those
  two spots are filled.
- `STOPS` — one object per campus visit: which team member, which day,
  start/end time, school, and contact. Reassign a visit by changing its
  `member`, or edit the time window directly.

The current schedule is a **first-pass draft**, grouped by rough
Charlotte-Mecklenburg region to keep drive time reasonable and sequenced
to fit inside each campus's reported hours (pulled from the school contact
list). It wasn't built from real drive-time data, so treat it as a
starting point to adjust once the team reviews it — Day 2 is intentionally
lighter for a few routes to leave room for follow-ups.
