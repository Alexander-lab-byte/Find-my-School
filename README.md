This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project setup notes

### Sign-in by email code (Supabase)

Sign-in is passwordless: people enter their email, receive a one-time code, and type it in. Two Supabase dashboard settings are required:

1. **Show the code in the emails.** Authentication → Email Templates → edit both **Magic Link** and **Confirm signup** so the body includes `{{ .Token }}` (e.g. `Your code: {{ .Token }}`). Without it, the email only contains a link — that still works (it goes through `/auth/callback`), but the code box on the site can't be used.
2. **Allow the redirect.** Authentication → URL Configuration → add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback`) to Redirect URLs.

For real traffic, set up custom SMTP (Authentication → SMTP Settings): Supabase's built-in sender only allows a few emails per hour.

### Who can write reviews

Only people who verified an email on one of a school's domains can review it (`School.emailDomains`, subdomains included — `student.asu.edu.mn` counts for `asu.edu.mn`). A school with no domains can't receive reviews. Domains live in `prisma/data/schools.ts`; edit and run `npm run db:import`.

### Map locations

Pins come from `latitude`/`longitude` in `prisma/data/schools.ts`. Schools without coordinates are listed under "Not on the map yet" on `/map`. To add one: right-click the building in Google Maps or openstreetmap.org, copy the coordinates into the data file, run `npm run db:import`. Set `locationApproximate: true` if the pin isn't on the school's own building.

### Database changes

This database also holds tables that aren't in `prisma/schema.prisma` (e.g. `comment`). **Don't run `prisma db push` or `prisma migrate dev` against it** — they try to drop unknown tables. Apply schema changes as plain additive SQL (`prisma db execute`) instead, and deploy the code that uses new columns only after the columns exist.
