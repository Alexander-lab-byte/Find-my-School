# Find My School Mongolia — Technical Specification

> Security note: a GitHub PAT was shared in the chat that produced this doc. Revoke it in GitHub → Settings → Developer settings → Personal access tokens before continuing. Store new tokens in `.env.local` (already gitignored).

---

## 1. Information Architecture & Routes

Using Next.js App Router with route groups to separate marketing, core app, auth, and dashboard concerns. `next-intl` recommended for `mn`/`en` locale routing.

```
app/
├── [locale]/
│   ├── (marketing)/
│   │   ├── page.tsx                     # Homepage: hero search, filters, top-rated carousel, map toggle
│   │   └── about/page.tsx
│   ├── (main)/
│   │   ├── search/page.tsx              # Grid/List + Map split view, filters in URL query params
│   │   ├── school/[id]/page.tsx         # School profile (overview tab)
│   │   ├── school/[id]/facilities/page.tsx
│   │   ├── school/[id]/dorm/page.tsx
│   │   ├── school/[id]/admissions/page.tsx
│   │   ├── school/[id]/reviews/page.tsx
│   │   ├── compare/page.tsx             # ?ids=1,2,3
│   │   └── map/page.tsx                 # Full-screen national map
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── profile/page.tsx
│       ├── my-reviews/page.tsx
│       └── saved-schools/page.tsx
├── api/
│   ├── schools/route.ts                 # GET (list+filter), POST (admin)
│   ├── schools/[id]/route.ts            # GET, PATCH
│   ├── search/route.ts                  # Autocomplete endpoint
│   ├── reviews/route.ts                 # POST review, GET by school
│   ├── reviews/[id]/flag/route.ts       # Report/moderation
│   └── compare/route.ts
└── middleware.ts                        # locale detection + auth guards
```

**Search/filter state** lives in the URL (`?level=middle&type=private&curriculum=ib&dorm=true`) so results are shareable and bookmarkable — important for parents comparing options over days, not one session.

---

## 2. Database Schema (Prisma / PostgreSQL)

Design principles:
- Bilingual content stored as paired columns (`nameEn`/`nameMn`) rather than a separate translations table — this is a read-heavy app, and inline pairs avoid extra joins on every list/search query.
- Ratings are stored as individual submitted rows (`Rating`) *and* denormalized as cached averages on `School` (`avgAcademics`, `avgFacilities`, etc.) updated via a DB trigger or a background job, so the search page never has to aggregate on every request.
- Reviews and category ratings are separate models: a user can rate without writing a review, and a review can carry multiple tags.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SchoolType {
  PUBLIC
  PRIVATE
  INTERNATIONAL
}

enum SchoolLevel {
  ELEMENTARY
  MIDDLE
  HIGH
  K12
}

enum Curriculum {
  MONGOLIAN_NATIONAL
  CAMBRIDGE
  IB
  AP
  DUAL_LANGUAGE
}

enum UserRole {
  PARENT
  STUDENT
  ALUMNI
  EDUCATOR
  ADMIN
}

enum ReviewTag {
  DORMITORY
  LIBRARY
  FOOD_CANTEEN
  EXTRACURRICULARS
  ACADEMICS
  FACILITIES
  TEACHERS
  ENVIRONMENT
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  role          UserRole @default(PARENT)
  isVerified    Boolean  @default(false)   // e.g. verified current student/parent
  avatarUrl     String?
  createdAt     DateTime @default(now())

  reviews       Review[]
  ratings       Rating[]
  savedSchools  SavedSchool[]
  reportsFiled  Report[]      @relation("ReporterUser")
  compareLists  CompareList[]
}

model School {
  id                String       @id @default(cuid())
  schoolNumber      String?      // e.g. "School #1"
  nameEn            String
  nameMn            String
  logoUrl           String?
  coverImageUrl     String?

  type              SchoolType
  level             SchoolLevel
  curriculum        Curriculum[]
  teachingLanguages String[]     // ["mn", "en", "ru"]

  aimagCity         String       // Ulaanbaatar or aimag name
  district          String?      // duureg
  khoroo            String?
  address           String?
  latitude          Float
  longitude         Float

  phone             String?
  website           String?
  email             String?

  studentTeacherRatio String?
  accreditation       String?
  tuitionMinAnnual    Int?       // in MNT, null if public/free
  tuitionMaxAnnual    Int?
  applicationDeadline DateTime?
  entranceExamInfo    String?    @db.Text
  catchmentAreaInfo   String?    @db.Text

  // Cached aggregates, refreshed on new rating/review
  avgOverall        Float?       @default(0)
  avgAcademics      Float?       @default(0)
  avgFacilities     Float?       @default(0)
  avgDorms          Float?       @default(0)
  avgLibrary        Float?       @default(0)
  avgTeachers       Float?       @default(0)
  avgEnvironment    Float?       @default(0)
  reviewCount       Int          @default(0)

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  facilities        Facility[]
  dormitory         Dormitory?
  images            SchoolImage[]
  reviews           Review[]
  ratings           Rating[]
  savedBy           SavedSchool[]
  compareEntries    CompareListSchool[]
  tags              SchoolTagOnSchool[]

  @@index([aimagCity, district])
  @@index([level, type])
}

model Facility {
  id          String  @id @default(cuid())
  schoolId    String
  school      School  @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  nameEn      String
  nameMn      String
  category    String  // "library" | "lab" | "gym" | "cafeteria" | "heating" | etc.
  description String? @db.Text
  imageUrl    String?
}

model Dormitory {
  id                String  @id @default(cuid())
  schoolId          String  @unique
  school            School  @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  roomCapacity      Int?
  livingConditions  String? @db.Text
  boardingRules     String? @db.Text
  monthlyFeeAmount  Int?
  safetyInfo        String? @db.Text
  imageUrls         String[]
}

model SchoolImage {
  id        String   @id @default(cuid())
  schoolId  String
  school    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  url       String
  caption   String?
  order     Int      @default(0)
}

model SchoolTag {
  id      String @id @default(cuid())
  labelEn String @unique
  labelMn String

  schools SchoolTagOnSchool[]
}

model SchoolTagOnSchool {
  schoolId String
  tagId    String
  school   School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  tag      SchoolTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([schoolId, tagId])
}

model Review {
  id          String       @id @default(cuid())
  schoolId    String
  userId      String
  school      School       @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  bodyText    String       @db.Text
  tags        ReviewTag[]
  isVerified  Boolean      @default(false)  // ties to User.isVerified at time of posting
  status      String       @default("PUBLISHED") // PUBLISHED | FLAGGED | REMOVED

  createdAt   DateTime     @default(now())

  rating      Rating?
  reports     Report[]

  @@index([schoolId, status])
}

model Rating {
  id            String   @id @default(cuid())
  schoolId      String
  userId        String
  reviewId      String?  @unique
  school        School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  review        Review?  @relation(fields: [reviewId], references: [id])

  academics     Int      // 1-5
  facilities    Int
  dorms         Int?
  library       Int?
  teachers      Int
  environment   Int

  createdAt     DateTime @default(now())

  @@unique([schoolId, userId])  // one rating per user per school
}

model Report {
  id          String   @id @default(cuid())
  reviewId    String
  reporterId  String
  review      Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reporter    User     @relation("ReporterUser", fields: [reporterId], references: [id])

  reason      String
  status      String   @default("PENDING") // PENDING | RESOLVED | DISMISSED
  createdAt   DateTime @default(now())
}

model SavedSchool {
  userId    String
  schoolId  String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  school    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@id([userId, schoolId])
}

model CompareList {
  id        String              @id @default(cuid())
  userId    String
  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime            @default(now())
  schools   CompareListSchool[]
}

model CompareListSchool {
  compareListId String
  schoolId      String
  compareList   CompareList @relation(fields: [compareListId], references: [id], onDelete: Cascade)
  school        School      @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@id([compareListId, schoolId])
}
```

**ERD relationship summary:**
- `User 1—N Review`, `User 1—N Rating` (one rating per school per user, enforced by unique constraint)
- `School 1—N Review, Rating, Facility, SchoolImage`; `School 1—1 Dormitory`
- `Review 1—1 Rating` (optional — a rating can exist without a written review)
- `Review N—N ReviewTag` (enum array, not a join table — simpler since tags are a fixed vocabulary)
- `School N—N SchoolTag` via `SchoolTagOnSchool` (free-form tags like "STEM-Focused", "Special Needs Friendly" — these grow over time, so a real join table)
- `CompareList` decouples "add to compare" from session storage so a logged-in user's comparison persists across devices; anonymous users can do this in localStorage/URL state instead.

---

## 3. UI/UX Component Hierarchy

```
components/
├── layout/
│   ├── Header.tsx                # logo, nav, locale switcher, auth state
│   ├── Footer.tsx
│   └── MobileNav.tsx
├── search/
│   ├── HeroSearchBar.tsx         # autocomplete, debounced
│   ├── FilterBar.tsx             # level, type, curriculum, features — syncs to URL
│   ├── SchoolCard.tsx            # thumbnail, rating, tags, tuition indicator
│   ├── SchoolGrid.tsx
│   ├── SchoolListItem.tsx        # denser row variant for list view
│   └── SortDropdown.tsx
├── map/
│   ├── SchoolMap.tsx             # wraps Mapbox/Leaflet, clusters pins by district
│   ├── MapPin.tsx
│   └── MapSchoolPreviewCard.tsx  # popover on pin click
├── school-profile/
│   ├── SchoolHeader.tsx          # name, logo, rating, quick facts
│   ├── SchoolTabs.tsx            # Overview / Facilities / Dorm / Admissions / Reviews
│   ├── CurriculumBlock.tsx
│   ├── FacilitiesGrid.tsx
│   ├── DormitoryInfo.tsx
│   ├── AdmissionsInfo.tsx
│   └── CompareButton.tsx         # adds to CompareList / localStorage
├── reviews/
│   ├── ReviewForm.tsx            # category star inputs + tag picker + text
│   ├── CategoryStarInput.tsx     # reusable per-category rating widget
│   ├── ReviewCard.tsx            # shows reviewer badge, tags, text, report action
│   ├── ReviewList.tsx
│   ├── RatingSummary.tsx         # aggregate bars per category
│   └── ReportModal.tsx
├── compare/
│   ├── CompareTable.tsx          # side-by-side, up to 3 columns
│   └── CompareSlotPicker.tsx
├── common/
│   ├── StarRating.tsx
│   ├── Badge.tsx                 # role badges: Student / Parent / Alumni / Verified
│   ├── LocaleSwitcher.tsx
│   └── TuitionIndicator.tsx      # "Free" or fee range chip
└── home/
    ├── TopRatedCarousel.tsx
    └── MapToggle.tsx
```

**State/data notes:**
- Filters and search live in URL search params (via `useSearchParams` + `router.replace`), not client state — makes results shareable and back-button friendly.
- Use React Query (or Next's built-in fetch caching) for school list/detail data; keep review submission as a server action for simpler validation and revalidation of the school's cached rating averages.
- `CategoryStarInput` is the one component to get right early — it's reused in both the review form and the aggregate summary display (read vs. write mode via a prop).

---

## 4. Implementation Roadmap

**Phase 0 — Setup (few days)**
- Provision PostgreSQL (Supabase recommended — gives you Postgres + Auth + Storage in one), wire Prisma, set up `next-intl`.
- Set up CI: lint + typecheck on PR (you already have ESLint 9 + flat config from `create-next-app`).
- **Revoke and replace the exposed GitHub token before any pushes.**

**Phase 1 — Core data + read paths (1–2 weeks)**
- Seed script for a realistic subset of UB schools (name, district, level, type) to develop against.
- `School` list/detail API routes, basic search page with filters (no map yet).
- School profile page: overview, curriculum, facilities tabs (static data first).

**Phase 2 — Map + search polish (1 week)**
- Integrate Mapbox GL or Leaflet; district-level clustering for the homepage toggle.
- Autocomplete search (school name, number, district) — debounce + a simple `pg_trgm` index or Postgres full-text search, no need for Elasticsearch at this scale.

**Phase 3 — Auth + reviews (1–2 weeks)**
- Supabase Auth (email + Google), role assignment on signup.
- Review submission flow: category ratings + tags + text, server action updates cached averages.
- Reviewer badges, "verified" flag (manual or lightweight domain/document check for parents/students).

**Phase 4 — Moderation + compare (1 week)**
- Report/flag flow, a minimal admin queue (can be a protected `/dashboard/admin/reports` page — no need for a separate admin app yet).
- Compare feature: add up to 3, `CompareTable` component, persisted via `CompareList` for logged-in users, localStorage for anonymous.

**Phase 5 — Localization + polish (1 week)**
- Full `mn`/`en` string coverage, RTL-safe... actually not needed for Mongolian (Cyrillic is LTR), but double-check font rendering (Cyrillic glyph support in your chosen webfont).
- Mobile pass: this audience will be majority mobile, so treat the search + profile pages' mobile layout as primary, desktop as the enhancement.

**Phase 6 — Launch prep**
- Seed real school data (this will likely be your biggest bottleneck — plan for manual data entry or a partnership with an education ministry/NGO dataset if one exists).
- Basic analytics (page views per school, search terms with no results — tells you what's missing from your catalog).

**Suggested build order rationale:** read paths before write paths (a search engine with no data is useless, but reviews need schools to review), and map before reviews because the map is your visual hook for the homepage and doesn't depend on user-generated content being seeded yet.
