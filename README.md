# Find My School Mongolia

A guide to schools in Ulaanbaatar for parents and students: search and filter schools, answer five questions to get a ranked match, compare up to three schools side by side, see them on a map, and read reviews that an admin approves before they go public. In Mongolian and English.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma + PostgreSQL (Supabase), Supabase Auth (email code), Leaflet and next-intl.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values (see "Project setup notes")
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build, then serve it |
| `npm test` | Unit tests for the matching, fees, distance, ratings and CSV import logic |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:seed` | Demo schools and reviews for local testing |
| `npm run db:import-csv -- <file>` | Add or update schools from a CSV |

## Where things are

- `app/` — pages: home, `/search`, `/match`, `/compare`, `/map`, `/school/[id]` (overview, facilities, dormitory, admissions, reviews), account pages and `/admin`.
- `components/` — UI, grouped by feature. `lib/` — data access and plain logic (`match.ts`, `labels.ts`, `geo.ts`, …).
- `messages/en.json`, `messages/mn.json` — every piece of interface text. Add a key to both files.
- `docs/DESIGN.md` — the design system (colours, type, components, rules). Read it before adding UI.
- `tests/` — unit tests (`npm test`).

## Project setup notes

### Sign-in by email code (Supabase)

Sign-in is passwordless: people enter their email, receive a one-time code, and type it in. Two Supabase dashboard settings are required:

1. **Show the code in the emails.** Authentication → Email Templates → edit both **Magic Link** and **Confirm signup** so the body includes `{{ .Token }}` (e.g. `Your code: {{ .Token }}`). Without it, the email only contains a link — that still works (it goes through `/auth/callback`), but the code box on the site can't be used.
2. **Allow the redirect.** Authentication → URL Configuration → add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback`) to Redirect URLs.

For real traffic, set up custom SMTP (Authentication → SMTP Settings): Supabase's built-in sender only allows a few emails per hour.

### Who can write reviews

Anyone who is signed in can review any school. Every review waits for an admin (`/admin/reviews`) before it's public.

A review gets the **Verified** badge only when the writer signed in with a code sent to an email on one of the school's domains (`School.emailDomains`, subdomains included — `student.asu.edu.mn` counts for `asu.edu.mn`). Other reviews show as "Not verified". Domains live in `prisma/data/schools.ts`; edit and run `npm run db:import`.

### Adding many schools at once (CSV)

1. Copy `prisma/data/schools-template.csv` into Google Sheets (or open it in Excel). `schools-example.csv` shows two filled-in rows.
2. One row per school. Required: `nameEn`, `type` (PUBLIC / PRIVATE / INTERNATIONAL), `level` (ELEMENTARY / MIDDLE / HIGH / K12).
3. Lists use `|`: `MONGOLIAN_NATIONAL|CAMBRIDGE`, `mn|en`. Fees can be written as `12M`. Districts can be in English or Mongolian (`Хан-Уул` → `Khan-Uul`).
4. Fill `source` with where each fact comes from. Leave a cell empty rather than guess — empty cells never erase existing data.
5. Download as CSV, then check it: `npm run db:import-csv -- path/to/file.csv`. Fix every error it lists (with row numbers).
6. Save it: `npm run db:import-csv -- path/to/file.csv --write`. Nothing is saved unless every row is valid. A row updates the school with the same English name, or creates a new one.

### School data sources (Nov 2026 import)

`prisma/data/ub-schools-2026-11.csv` added 120 Ulaanbaatar schools and filled fees for existing ones. Already loaded into the live database.

- Locations and districts: © OpenStreetMap contributors (ODbL). Credit OpenStreetMap on the site (map or About page).
- Fees: ISU 2026–27 and ASU 2024–25 from the schools' own fee PDFs (ISU converted at Mongolbank ₮3,600.44/$, 8 Nov 2026); others from dated news reports (ergelt.mn, time.mn). The `source` column says which one.
- Guesses are not hidden: most schools show grades 1–12 (K12) because that's the usual case, not because it was checked.

`prisma/data/schools-to-complete.csv` is the to-find list: one row per school, with what's missing and a priority. Fill the empty cells in Google Sheets, download as CSV, then run `npm run db:import-csv -- file.csv` to check and `--write` to save. The `priority` and `whatToFind` columns are ignored by the importer.

### Our schools map (reuse it on any website)

**Embed the map** — paste this into any web page:

```html
<iframe src="https://find-my-school-rho.vercel.app/embed/map.html"
        width="100%" height="520" style="border:0;border-radius:12px"
        loading="lazy" title="Schools of Ulaanbaatar"></iframe>
```

Options (add to the URL): `?lang=mn` (Mongolian) · `?type=PUBLIC` or `?type=PRIVATE,INTERNATIONAL` · `?school=<school id>` (opens one school) · `?lat=47.92&lng=106.91&zoom=14`.

**Use the data in your own map** — `GET https://find-my-school-rho.vercel.app/api/map/schools` returns every pinned school as GeoJSON (open CORS, cached 1 hour). Add `?type=PUBLIC` to filter. MapLibre, Leaflet, Mapbox and Google Maps can all load GeoJSON directly.

The page is one file, `public/embed/map.html` (MapLibre GL + the free [OpenFreeMap](https://openfreemap.org) "positron" base map, no API key). Buildings, shops and other places are hidden so only schools stand out. You can copy the file to another site; it keeps reading data from our API.

**Photos** come only from Wikimedia Commons, under free licenses, and each one shows its author and license. They're listed in `lib/school-photos.ts`. Don't add photos copied from school websites, Facebook or Google: those are copyrighted. To add one, upload it to Commons first (or get the school's written permission).

### Map locations

Pins come from `latitude`/`longitude` in `prisma/data/schools.ts`. Schools without coordinates are listed under "Not on the map yet" on `/map`. To add one: right-click the building in Google Maps or openstreetmap.org, copy the coordinates into the data file, run `npm run db:import`. Set `locationApproximate: true` if the pin isn't on the school's own building.

### Database changes

This database also holds tables that aren't in `prisma/schema.prisma` (e.g. `comment`). **Don't run `prisma db push` or `prisma migrate dev` against it** — they try to drop unknown tables. Apply schema changes as plain additive SQL (`prisma db execute`) instead, and deploy the code that uses new columns only after the columns exist.

### Admins and review approval

Every new review starts as **awaiting approval**: it isn't shown on the site and doesn't count toward the school's rating until an admin approves it. Admins work at `/admin/reviews` (a 404 for everyone else; the account menu shows a "Moderation" link with a count of what's waiting):

- **Awaiting approval:** approve or reject new reviews. Each shows the author's email and whether it's on the school's domain.
- **Published / Rejected:** unpublish a live review, or publish a rejected one.
- **Reports:** reviews people flagged; hide the review or dismiss the report.

Someone whose review was rejected can write a new one; it replaces the rejected one.

To make someone an admin, list their email in the `ADMIN_EMAILS` environment variable (comma-separated, set it in Vercel → Settings → Environment Variables and redeploy):

```
ADMIN_EMAILS=owner@example.com,second.admin@example.com
```

Or set the role in the database (they must have signed in once, so their `User` row exists):

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'person@example.com';
```

Admin rights (and the school-email check for reviews) only apply to a session signed in with an emailed code. Supabase's "Confirm email" setting is off, so anyone could register any address with a password through Supabase's API; requiring the code means they still can't act as that address here. Turning "Confirm email" on in Supabase (Authentication → Sign In / Providers → Email) is a good extra safeguard.

### Demo data

`npm run db:seed` adds placeholder schools marked "(Demo)" for local development. Don't run it against the production database. Real school data lives in `prisma/data/schools.ts` (`npm run db:import`).
