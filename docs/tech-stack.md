**Nevermist**

Tech Stack Document

Complete build reference --- setup, structure, code, and rationale

  ------------------------ ------------------------
  **Stack** Next.js 15 +   **Database** Supabase
  TypeScript + Tailwind +  (Postgres) + Prisma
  Zustand                  

  **AI** Anthropic Claude  **Hosting** Vercel free
  Sonnet API               tier

  **Monthly cost** \~₹1--5 **Version** 1.0 --- V1
  (Anthropic API only ---  Build Reference
  everything else free)    
  ------------------------ ------------------------

**1. Full Stack at a Glance**

  ------------------ ---------------------------- -------------------------------
  **Layer**          **Technology**               **Why this choice**

  Framework          Next.js 15 (App Router)      React meta-framework --- API
                                                  routes, SSR, PWA, largest
                                                  ecosystem, Vercel-native

  Language           TypeScript                   Type safety for AI JSON
                                                  responses and Notion API ---
                                                  catches errors before runtime

  Styling            Tailwind CSS v4              Utility-first, fast to build,
                                                  AI coding assistant friendly,
                                                  dark mode built-in

  Animation          Framer Motion                AnimatePresence for preview
                                                  card mount/unmount, layout
                                                  animations, gesture support

  State              Zustand                      1KB, no boilerplate, 4 clean
                                                  slices, works anywhere without
                                                  prop drilling

  Database           Supabase (free tier)         Hosted Postgres, dashboard,
                                                  stable, free forever at
                                                  personal scale

  ORM                Prisma                       Schema-first, visual Studio, no
                                                  SQL needed, best docs, most AI
                                                  assistant support

  Offline queue      idb (IndexedDB wrapper)      Only viable offline storage for
                                                  PWA --- async, large capacity,
                                                  all devices

  PWA                \@serwist/next               Maintained next-pwa
                                                  replacement, works with App
                                                  Router, generates service
                                                  worker

  AI                 Anthropic SDK                Single call returns structured
                     (claude-sonnet-4-20250514)   JSON, vision-capable for
                                                  photos, reliable

  Push notif         web-push (VAPID keys)        Self-hosted, free, no Firebase,
                                                  works with Web Push API
                                                  standard

  Auth / OAuth       Notion OAuth 2.0             Official Notion integration
                                                  flow --- user connects their
                                                  own workspace

  Hosting            Vercel (free Hobby tier)     Made for Next.js, zero config,
                                                  HTTPS, env vars UI, free
                                                  forever for personal use

  Cron (nudge)       Vercel Cron Jobs             Free on Hobby tier --- triggers
                                                  daily push notification at
                                                  user\'s chosen time
  ------------------ ---------------------------- -------------------------------

+-----------------------------------------------------------------------+
| Total monthly cost: \~₹1--5                                           |
|                                                                       |
| The ONLY paid service is the Anthropic API --- and only for usage.    |
|                                                                       |
| Supabase free: 500MB, 2 projects. Vercel free: unlimited personal     |
| projects.                                                             |
|                                                                       |
| All other tools are either free tiers, self-generated keys, or open   |
| source.                                                               |
+-----------------------------------------------------------------------+

**2. All Dependencies**

**2.1 package.json --- complete**

This is your complete package.json. Copy this exactly --- it includes
every dependency for V1.

+-----------------------------------------------------------------------+
| {                                                                     |
|                                                                       |
| \"name\": \"nevermist\",                                              |
|                                                                       |
| \"version\": \"0.1.0\",                                               |
|                                                                       |
| \"private\": true,                                                    |
|                                                                       |
| \"scripts\": {                                                        |
|                                                                       |
| \"dev\": \"next dev\",                                                |
|                                                                       |
| \"build\": \"next build\",                                            |
|                                                                       |
| \"start\": \"next start\",                                            |
|                                                                       |
| \"lint\": \"next lint\",                                              |
|                                                                       |
| \"db:push\": \"prisma db push\",                                      |
|                                                                       |
| \"db:studio\": \"prisma studio\",                                     |
|                                                                       |
| \"db:generate\": \"prisma generate\"                                  |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"dependencies\": {                                                   |
|                                                                       |
| \"next\": \"\^15.0.0\",                                               |
|                                                                       |
| \"react\": \"\^19.0.0\",                                              |
|                                                                       |
| \"react-dom\": \"\^19.0.0\",                                          |
|                                                                       |
| \"@anthropic-ai/sdk\": \"\^0.32.0\",                                  |
|                                                                       |
| \"@notionhq/client\": \"\^2.3.0\",                                    |
|                                                                       |
| \"@prisma/client\": \"\^6.0.0\",                                      |
|                                                                       |
| \"@radix-ui/react-dialog\": \"\^1.1.0\",                              |
|                                                                       |
| \"@serwist/next\": \"\^9.0.0\",                                       |
|                                                                       |
| \"framer-motion\": \"\^11.0.0\",                                      |
|                                                                       |
| \"idb\": \"\^8.0.0\",                                                 |
|                                                                       |
| \"iron-session\": \"\^8.0.0\",                                        |
|                                                                       |
| \"web-push\": \"\^3.6.7\",                                            |
|                                                                       |
| \"zustand\": \"\^5.0.0\"                                              |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"devDependencies\": {                                                |
|                                                                       |
| \"@types/node\": \"\^22.0.0\",                                        |
|                                                                       |
| \"@types/react\": \"\^19.0.0\",                                       |
|                                                                       |
| \"@types/react-dom\": \"\^19.0.0\",                                   |
|                                                                       |
| \"@types/web-push\": \"\^3.6.3\",                                     |
|                                                                       |
| \"prisma\": \"\^6.0.0\",                                              |
|                                                                       |
| \"tailwindcss\": \"\^4.0.0\",                                         |
|                                                                       |
| \"@tailwindcss/postcss\": \"\^4.0.0\",                                |
|                                                                       |
| \"typescript\": \"\^5.0.0\",                                          |
|                                                                       |
| \"eslint\": \"\^9.0.0\",                                              |
|                                                                       |
| \"eslint-config-next\": \"\^15.0.0\"                                  |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**2.2 What Each Dependency Does**

  ------------------------- --------------- -------------------------------------
  **Package**               **Category**    **Purpose**

  next                      Framework       The app itself --- routing, API
                                            routes, server components, build

  react + react-dom         Framework       UI components --- same React you
                                            already know

  \@anthropic-ai/sdk        AI              Official Anthropic client --- call
                                            Claude API server-side

  \@notionhq/client         Integration     Official Notion API client --- create
                                            pages, fetch databases

  \@prisma/client           Database        Generated database client --- runs
                                            your queries

  prisma (dev)              Database        CLI tool --- prisma generate, prisma
                                            studio, prisma db push

  \@radix-ui/react-dialog   UI              Accessible bottom sheet / page picker
                                            --- headless, unstyled

  \@serwist/next            PWA             Service worker generation --- makes
                                            app installable

  framer-motion             Animation       Preview card slide-up,
                                            AnimatePresence, all transitions

  idb                       Offline         IndexedDB wrapper --- offline queue
                                            storage

  iron-session              Auth            Encrypted session cookies --- stores
                                            user auth state

  web-push                  Notifications   Push notification sender --- daily
                                            nudge

  zustand                   State           Global state --- capture, preview,
                                            queue, user slices

  tailwindcss v4            Styling         Utility CSS --- all your component
                                            styling
  ------------------------- --------------- -------------------------------------

**3. Environment Variables**

**3.1 .env.local template**

Create this file at the root of your project. Never commit it to git ---
it\'s already in .gitignore by default.

+------------------------------------------------------------------------+
| \# ─────────────────────────────────────────────                       |
|                                                                        |
| \# NEVERMIST --- .env.local                                            |
|                                                                        |
| \# Copy this file, fill in your values.                                |
|                                                                        |
| \# NEVER prefix any of these with NEXT_PUBLIC\_                        |
|                                                                        |
| \# ─────────────────────────────────────────────                       |
|                                                                        |
| \# Anthropic (get from console.anthropic.com)                          |
|                                                                        |
| ANTHROPIC_API_KEY=sk-ant-\...                                          |
|                                                                        |
| \# Notion OAuth (from notion.so/my-integrations)                       |
|                                                                        |
| NOTION_CLIENT_ID=your-notion-client-id                                 |
|                                                                        |
| NOTION_CLIENT_SECRET=your-notion-client-secret                         |
|                                                                        |
| NOTION_REDIRECT_URI=http://localhost:3000/api/auth/callback            |
|                                                                        |
| \# Database (from supabase.com → Settings → Database)                  |
|                                                                        |
| DATABASE_URL=postgresql://postgres:\[password\]@\[host\]:5432/postgres |
|                                                                        |
| \# Session encryption (generate with command below)                    |
|                                                                        |
| \# node -e                                                             |
| \"console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))\" |
|                                                                        |
| SESSION_SECRET=your-64-char-hex-string                                 |
|                                                                        |
| \# Notion token encryption (generate same way)                         |
|                                                                        |
| ENCRYPTION_KEY=your-64-char-hex-string                                 |
|                                                                        |
| \# VAPID keys for push notifications                                   |
|                                                                        |
| \# Generate with: npx web-push generate-vapid-keys                     |
|                                                                        |
| VAPID_PUBLIC_KEY=your-vapid-public-key                                 |
|                                                                        |
| VAPID_PRIVATE_KEY=your-vapid-private-key                               |
|                                                                        |
| VAPID_SUBJECT=mailto:you@youremail.com                                 |
|                                                                        |
| \# App URL (change to production URL when deploying)                   |
|                                                                        |
| NEXT_PUBLIC_APP_URL=http://localhost:3000                              |
|                                                                        |
| \# Note: NEXT_PUBLIC\_ prefix is ONLY safe here because                |
|                                                                        |
| \# it is just your own app URL --- not a secret.                       |
+------------------------------------------------------------------------+

**3.2 How to Get Each Value**

  ----------------------------------- ------------------------------------------------------------------------
  **Variable**                        **How to get it**

  ANTHROPIC_API_KEY                   console.anthropic.com → API Keys → Create Key. Add \$5--10 credit in
                                      Billing.

  NOTION_CLIENT_ID/SECRET             notion.so/my-integrations → New Integration → OAuth 2.0 → copy ID and
                                      secret

  NOTION_REDIRECT_URI                 localhost:3000/api/auth/callback in dev. Change to your Vercel URL in
                                      production.

  DATABASE_URL                        supabase.com → new project → Settings → Database → Connection string
                                      (URI tab)

  SESSION_SECRET                      Run: node -e
                                      \"console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))\"

  ENCRYPTION_KEY                      Run same command again --- generate a different 64-char hex string

  VAPID keys                          Run: npx web-push generate-vapid-keys --- copy both keys

  VAPID_SUBJECT                       Your email address --- required by Web Push spec
  ----------------------------------- ------------------------------------------------------------------------

**4. Project File Structure**

**4.1 Complete folder structure**

This is the exact structure you should build toward. Every file and
folder has a purpose.

+-----------------------------------------------------------------------+
| nevermist/                                                            |
|                                                                       |
| ├── prisma/                                                           |
|                                                                       |
| │ └── schema.prisma \# Database models                                |
|                                                                       |
| │                                                                     |
|                                                                       |
| ├── public/                                                           |
|                                                                       |
| │ ├── manifest.json \# PWA manifest                                   |
|                                                                       |
| │ ├── sw.js \# Service worker (auto-generated)                        |
|                                                                       |
| │ └── icons/                                                          |
|                                                                       |
| │ ├── icon-192.png                                                    |
|                                                                       |
| │ └── icon-512.png                                                    |
|                                                                       |
| │                                                                     |
|                                                                       |
| ├── src/                                                              |
|                                                                       |
| │ ├── app/                                                            |
|                                                                       |
| │ │ ├── layout.tsx \# Root layout --- fonts, meta, PWA tags           |
|                                                                       |
| │ │ ├── page.tsx \# Capture screen (the one main screen)              |
|                                                                       |
| │ │ ├── globals.css \# Tailwind base + CSS variables                  |
|                                                                       |
| │ │ │                                                                 |
|                                                                       |
| │ │ ├── onboarding/                                                   |
|                                                                       |
| │ │ │ └── page.tsx \# Multi-step onboarding flow                      |
|                                                                       |
| │ │ │                                                                 |
|                                                                       |
| │ │ ├── settings/                                                     |
|                                                                       |
| │ │ │ └── page.tsx \# Settings overlay                                |
|                                                                       |
| │ │ │                                                                 |
|                                                                       |
| │ │ └── api/                                                          |
|                                                                       |
| │ │ ├── auth/                                                         |
|                                                                       |
| │ │ │ ├── notion/route.ts \# Initiate OAuth redirect                  |
|                                                                       |
| │ │ │ ├── callback/route.ts \# Handle OAuth callback                  |
|                                                                       |
| │ │ │ └── session/route.ts \# Check session / get user                |
|                                                                       |
| │ │ ├── capture/route.ts \# Main AI processing endpoint               |
|                                                                       |
| │ │ ├── notion/                                                       |
|                                                                       |
| │ │ │ ├── pages/route.ts \# Fetch user Notion pages                   |
|                                                                       |
| │ │ │ └── send/route.ts \# Send task to Notion                        |
|                                                                       |
| │ │ ├── user/                                                         |
|                                                                       |
| │ │ │ └── config/route.ts \# Get/update page configs                  |
|                                                                       |
| │ │ ├── queue/                                                        |
|                                                                       |
| │ │ │ └── sync/route.ts \# Process offline queue                      |
|                                                                       |
| │ │ └── push/                                                         |
|                                                                       |
| │ │ ├── subscribe/route.ts \# Save push subscription                  |
|                                                                       |
| │ │ └── send/route.ts \# Send push notification                       |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| │ ├── components/                                                     |
|                                                                       |
| │ │ ├── CaptureInput.tsx                                              |
|                                                                       |
| │ │ ├── VoiceButton.tsx                                               |
|                                                                       |
| │ │ ├── CameraButton.tsx                                              |
|                                                                       |
| │ │ ├── SendButton.tsx                                                |
|                                                                       |
| │ │ ├── QuickChips.tsx                                                |
|                                                                       |
| │ │ ├── PreviewCard.tsx                                               |
|                                                                       |
| │ │ ├── TaskChip.tsx                                                  |
|                                                                       |
| │ │ ├── PagePickerSheet.tsx                                           |
|                                                                       |
| │ │ ├── ConfirmationToast.tsx                                         |
|                                                                       |
| │ │ ├── StatusPill.tsx                                                |
|                                                                       |
| │ │ ├── OfflineBanner.tsx                                             |
|                                                                       |
| │ │ └── onboarding/                                                   |
|                                                                       |
| │ │ ├── ConnectStep.tsx                                               |
|                                                                       |
| │ │ ├── PagesStep.tsx                                                 |
|                                                                       |
| │ │ ├── DescribeStep.tsx                                              |
|                                                                       |
| │ │ └── NudgeStep.tsx                                                 |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| │ ├── lib/                                                            |
|                                                                       |
| │ │ ├── ai.ts \# Claude API call + system prompt builder              |
|                                                                       |
| │ │ ├── notion.ts \# Notion API wrapper                               |
|                                                                       |
| │ │ ├── prisma.ts \# Prisma client singleton                          |
|                                                                       |
| │ │ ├── session.ts \# iron-session config                             |
|                                                                       |
| │ │ ├── encrypt.ts \# AES-256 token encryption                        |
|                                                                       |
| │ │ ├── offline-queue.ts \# IndexedDB operations                      |
|                                                                       |
| │ │ ├── speech.ts \# Web Speech API wrapper                           |
|                                                                       |
| │ │ └── camera.ts \# Camera + image compression                       |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| │ ├── hooks/                                                          |
|                                                                       |
| │ │ ├── useCapture.ts \# Orchestrates full capture flow               |
|                                                                       |
| │ │ ├── useVoice.ts \# Voice recording state                          |
|                                                                       |
| │ │ ├── useCamera.ts \# Camera state + compression                    |
|                                                                       |
| │ │ ├── useOffline.ts \# Online/offline + queue sync                  |
|                                                                       |
| │ │ └── useAuth.ts \# Session + auth state                            |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| │ ├── store/                                                          |
|                                                                       |
| │ │ ├── capture.ts \# Zustand capture slice                           |
|                                                                       |
| │ │ ├── preview.ts \# Zustand preview slice                           |
|                                                                       |
| │ │ ├── queue.ts \# Zustand queue slice                               |
|                                                                       |
| │ │ └── user.ts \# Zustand user slice                                 |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| │ └── types/                                                          |
|                                                                       |
| │ ├── capture.ts \# CaptureResult, InputMode types                    |
|                                                                       |
| │ ├── notion.ts \# PageConfig, NotionPage types                       |
|                                                                       |
| │ └── queue.ts \# QueueItem, FailedItem types                         |
|                                                                       |
| │                                                                     |
|                                                                       |
| ├── .env.local \# Your secrets (never commit)                         |
|                                                                       |
| ├── .env.example \# Template with empty values (commit this)          |
|                                                                       |
| ├── .gitignore                                                        |
|                                                                       |
| ├── next.config.ts                                                    |
|                                                                       |
| ├── tailwind.config.ts                                                |
|                                                                       |
| ├── postcss.config.mjs                                                |
|                                                                       |
| └── tsconfig.json                                                     |
+-----------------------------------------------------------------------+

**5. Database Schema**

**5.1 Prisma schema --- prisma/schema.prisma**

This is your complete database schema. Run prisma db push after setting
DATABASE_URL to create the tables in Supabase.

+-----------------------------------------------------------------------+
| generator client {                                                    |
|                                                                       |
| provider = \"prisma-client-js\"                                       |
|                                                                       |
| }                                                                     |
|                                                                       |
| datasource db {                                                       |
|                                                                       |
| provider = \"postgresql\"                                             |
|                                                                       |
| url = env(\"DATABASE_URL\")                                           |
|                                                                       |
| }                                                                     |
|                                                                       |
| // One row per user who has connected their Notion                    |
|                                                                       |
| model User {                                                          |
|                                                                       |
| id String \@id \@default(cuid())                                      |
|                                                                       |
| notionToken String // AES-256 encrypted Notion access token           |
|                                                                       |
| notionWorkspaceId String                                              |
|                                                                       |
| notionWorkspaceName String                                            |
|                                                                       |
| textPolish Boolean \@default(true)                                    |
|                                                                       |
| nudgeTime String? // \"21:00\" or null if disabled                    |
|                                                                       |
| pushSubscription String? // JSON string of push subscription object   |
|                                                                       |
| createdAt DateTime \@default(now())                                   |
|                                                                       |
| updatedAt DateTime \@updatedAt                                        |
|                                                                       |
| pages PageConfig\[\]                                                  |
|                                                                       |
| }                                                                     |
|                                                                       |
| // One row per Notion page the user has configured as a destination   |
|                                                                       |
| model PageConfig {                                                    |
|                                                                       |
| id String \@id \@default(cuid())                                      |
|                                                                       |
| userId String                                                         |
|                                                                       |
| notionPageId String // The actual Notion page/database ID             |
|                                                                       |
| name String // \"Work tasks\"                                         |
|                                                                       |
| description String // \"Sprints and deliverables\" --- used for AI    |
| routing                                                               |
|                                                                       |
| isDatabase Boolean \@default(false)                                   |
|                                                                       |
| databaseProps String? // JSON: which Notion property = priority, due  |
| date                                                                  |
|                                                                       |
| sortOrder Int \@default(0)                                            |
|                                                                       |
| createdAt DateTime \@default(now())                                   |
|                                                                       |
| user User \@relation(fields: \[userId\], references: \[id\],          |
| onDelete: Cascade)                                                    |
|                                                                       |
| @@index(\[userId\])                                                   |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**5.2 Database commands**

  ----------------------------------- -----------------------------------
  **Command**                         **When to run it**

  npx prisma db push                  First time --- creates tables in
                                      Supabase from your schema

  npx prisma generate                 After changing schema.prisma ---
                                      regenerates the TypeScript client

  npx prisma studio                   Opens visual browser of your
                                      database --- like MongoDB Compass

  npx prisma db push \--force-reset   Wipes and recreates all tables ---
                                      only in development
  ----------------------------------- -----------------------------------

**6. Key Starter Code**

**6.1 Prisma client singleton --- src/lib/prisma.ts**

This prevents creating multiple database connections in development.
Always import prisma from this file.

+-----------------------------------------------------------------------+
| import { PrismaClient } from \'@prisma/client\'                       |
|                                                                       |
| const globalForPrisma = globalThis as unknown as {                    |
|                                                                       |
| prisma: PrismaClient \| undefined                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| export const prisma =                                                 |
|                                                                       |
| globalForPrisma.prisma ??                                             |
|                                                                       |
| new PrismaClient({                                                    |
|                                                                       |
| log: process.env.NODE_ENV === \'development\' ? \[\'query\'\] : \[\], |
|                                                                       |
| })                                                                    |
|                                                                       |
| if (process.env.NODE_ENV !== \'production\')                          |
|                                                                       |
| globalForPrisma.prisma = prisma                                       |
+-----------------------------------------------------------------------+

**6.2 Session config --- src/lib/session.ts**

iron-session handles encrypted session cookies. Your user\'s auth state
lives in the session.

+-----------------------------------------------------------------------+
| import { getIronSession, SessionOptions } from \'iron-session\'       |
|                                                                       |
| import { cookies } from \'next/headers\'                              |
|                                                                       |
| export interface SessionData {                                        |
|                                                                       |
| userId?: string                                                       |
|                                                                       |
| isAuthenticated: boolean                                              |
|                                                                       |
| }                                                                     |
|                                                                       |
| export const sessionOptions: SessionOptions = {                       |
|                                                                       |
| password: process.env.SESSION_SECRET as string,                       |
|                                                                       |
| cookieName: \'nevermist-session\',                                    |
|                                                                       |
| cookieOptions: {                                                      |
|                                                                       |
| secure: process.env.NODE_ENV === \'production\',                      |
|                                                                       |
| httpOnly: true,                                                       |
|                                                                       |
| sameSite: \'strict\',                                                 |
|                                                                       |
| maxAge: 60 \* 60 \* 24 \* 30, // 30 days                              |
|                                                                       |
| },                                                                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| export async function getSession() {                                  |
|                                                                       |
| return getIronSession\<SessionData\>(await cookies(), sessionOptions) |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**6.3 The AI capture endpoint --- src/app/api/capture/route.ts**

This is the most important file in the entire app. It receives raw input
and returns structured JSON.

+-----------------------------------------------------------------------+
| import { NextRequest, NextResponse } from \'next/server\'             |
|                                                                       |
| import Anthropic from \'@anthropic-ai/sdk\'                           |
|                                                                       |
| import { getSession } from \'@/lib/session\'                          |
|                                                                       |
| import { prisma } from \'@/lib/prisma\'                               |
|                                                                       |
| const client = new Anthropic()                                        |
|                                                                       |
| export async function POST(req: NextRequest) {                        |
|                                                                       |
| // 1. Auth check                                                      |
|                                                                       |
| const session = await getSession()                                    |
|                                                                       |
| if (!session.isAuthenticated) {                                       |
|                                                                       |
| return NextResponse.json({ error: \'Unauthorized\' }, { status: 401   |
| })                                                                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| // 2. Parse request                                                   |
|                                                                       |
| const { inputValue, inputMode, imageData } = await req.json()         |
|                                                                       |
| // 3. Get user\'s page configs for routing                            |
|                                                                       |
| const pages = await prisma.pageConfig.findMany({                      |
|                                                                       |
| where: { userId: session.userId },                                    |
|                                                                       |
| orderBy: { sortOrder: \'asc\' },                                      |
|                                                                       |
| })                                                                    |
|                                                                       |
| // 4. Build dynamic system prompt with user\'s pages                  |
|                                                                       |
| const pageList = pages.map((p, i) =\>                                 |
|                                                                       |
| \`\${i + 1}. \"\${p.name}\" (ID: \${p.notionPageId}) ---              |
| \${p.description}\`                                                   |
|                                                                       |
| ).join(\'\\n\')                                                       |
|                                                                       |
| const systemPrompt = \`You are a task capture assistant.              |
|                                                                       |
| Given raw user input, produce structured JSON only. No explanation.   |
|                                                                       |
| User\'s Notion destinations:                                          |
|                                                                       |
| \${pageList}                                                          |
|                                                                       |
| Today is: \${new Date().toISOString()}                                |
|                                                                       |
| Output JSON with these fields:                                        |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"cleanedTask\": string,                                              |
|                                                                       |
| \"destinationPageId\": string,                                        |
|                                                                       |
| \"destinationName\": string,                                          |
|                                                                       |
| \"priority\": \"P1\" \| \"P2\" \| \"P3\",                             |
|                                                                       |
| \"dueDate\": string \| null,                                          |
|                                                                       |
| \"isRecurring\": boolean,                                             |
|                                                                       |
| \"recurringPattern\": string \| null,                                 |
|                                                                       |
| \"isUrl\": boolean,                                                   |
|                                                                       |
| \"sourceUrl\": string \| null                                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| For photo inputs return an array of these objects --- one per task.   |
|                                                                       |
| P1 = urgent/ASAP, P2 = important/this week, P3 = someday/no rush.     |
|                                                                       |
| dueDate must be ISO 8601 format or null.\`                            |
|                                                                       |
| // 5. Build message (text or vision)                                  |
|                                                                       |
| const messages: Anthropic.MessageParam\[\] = imageData                |
|                                                                       |
| ? \[{ role: \'user\', content: \[                                     |
|                                                                       |
| { type: \'image\', source: { type: \'base64\',                        |
|                                                                       |
| media_type: \'image/jpeg\', data: imageData } },                      |
|                                                                       |
| { type: \'text\', text: \'Extract all tasks from this image.\' }      |
|                                                                       |
| \]}\]                                                                 |
|                                                                       |
| : \[{ role: \'user\', content: inputValue }\]                         |
|                                                                       |
| // 6. Call Claude                                                     |
|                                                                       |
| const response = await client.messages.create({                       |
|                                                                       |
| model: \'claude-sonnet-4-20250514\',                                  |
|                                                                       |
| max_tokens: 1024,                                                     |
|                                                                       |
| system: systemPrompt,                                                 |
|                                                                       |
| messages,                                                             |
|                                                                       |
| })                                                                    |
|                                                                       |
| // 7. Parse and return                                                |
|                                                                       |
| const text = response.content\[0\].type === \'text\' ?                |
| response.content\[0\].text : \'\'                                     |
|                                                                       |
| const result = JSON.parse(text)                                       |
|                                                                       |
| return NextResponse.json(result)                                      |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**6.4 Zustand stores --- src/store/capture.ts**

All four stores follow this same pattern. Here is the capture store as
the reference.

+-----------------------------------------------------------------------+
| import { create } from \'zustand\'                                    |
|                                                                       |
| type InputMode = \'text\' \| \'voice\' \| \'photo\' \| \'url\'        |
|                                                                       |
| interface CaptureState {                                              |
|                                                                       |
| inputValue: string                                                    |
|                                                                       |
| inputMode: InputMode                                                  |
|                                                                       |
| isProcessing: boolean                                                 |
|                                                                       |
| processingError: string \| null                                       |
|                                                                       |
| // Actions                                                            |
|                                                                       |
| setInputValue: (v: string) =\> void                                   |
|                                                                       |
| setInputMode: (m: InputMode) =\> void                                 |
|                                                                       |
| setProcessing: (b: boolean) =\> void                                  |
|                                                                       |
| setError: (e: string \| null) =\> void                                |
|                                                                       |
| reset: () =\> void                                                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| export const useCaptureStore = create\<CaptureState\>((set) =\> ({    |
|                                                                       |
| inputValue: \'\',                                                     |
|                                                                       |
| inputMode: \'text\',                                                  |
|                                                                       |
| isProcessing: false,                                                  |
|                                                                       |
| processingError: null,                                                |
|                                                                       |
| setInputValue: (v) =\> set({ inputValue: v }),                        |
|                                                                       |
| setInputMode: (m) =\> set({ inputMode: m }),                          |
|                                                                       |
| setProcessing: (b) =\> set({ isProcessing: b }),                      |
|                                                                       |
| setError: (e) =\> set({ processingError: e }),                        |
|                                                                       |
| reset: () =\> set({ inputValue: \'\', isProcessing: false,            |
| processingError: null }),                                             |
|                                                                       |
| }))                                                                   |
|                                                                       |
| // Usage in any component:                                            |
|                                                                       |
| // const { inputValue, setInputValue } = useCaptureStore()            |
+-----------------------------------------------------------------------+

**6.5 Notion OAuth --- src/app/api/auth/notion/route.ts**

+-----------------------------------------------------------------------+
| import { NextResponse } from \'next/server\'                          |
|                                                                       |
| export async function GET() {                                         |
|                                                                       |
| const params = new URLSearchParams({                                  |
|                                                                       |
| client_id: process.env.NOTION_CLIENT_ID!,                             |
|                                                                       |
| redirect_uri: process.env.NOTION_REDIRECT_URI!,                       |
|                                                                       |
| response_type: \'code\',                                              |
|                                                                       |
| owner: \'user\',                                                      |
|                                                                       |
| })                                                                    |
|                                                                       |
| return NextResponse.redirect(                                         |
|                                                                       |
| \`https://api.notion.com/v1/oauth/authorize?\${params}\`              |
|                                                                       |
| )                                                                     |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**6.6 Notion OAuth callback --- src/app/api/auth/callback/route.ts**

+---------------------------------------------------------------------------+
| import { NextRequest, NextResponse } from \'next/server\'                 |
|                                                                           |
| import { prisma } from \'@/lib/prisma\'                                   |
|                                                                           |
| import { getSession } from \'@/lib/session\'                              |
|                                                                           |
| import { encrypt } from \'@/lib/encrypt\'                                 |
|                                                                           |
| export async function GET(req: NextRequest) {                             |
|                                                                           |
| const code = req.nextUrl.searchParams.get(\'code\')                       |
|                                                                           |
| if (!code) return NextResponse.redirect(\'/?error=no_code\')              |
|                                                                           |
| // Exchange code for token                                                |
|                                                                           |
| const credentials = Buffer.from(                                          |
|                                                                           |
| \`\${process.env.NOTION_CLIENT_ID}:\${process.env.NOTION_CLIENT_SECRET}\` |
|                                                                           |
| ).toString(\'base64\')                                                    |
|                                                                           |
| const tokenRes = await fetch(\'https://api.notion.com/v1/oauth/token\', { |
|                                                                           |
| method: \'POST\',                                                         |
|                                                                           |
| headers: {                                                                |
|                                                                           |
| \'Authorization\': \`Basic \${credentials}\`,                             |
|                                                                           |
| \'Content-Type\': \'application/json\',                                   |
|                                                                           |
| },                                                                        |
|                                                                           |
| body: JSON.stringify({                                                    |
|                                                                           |
| grant_type: \'authorization_code\',                                       |
|                                                                           |
| code,                                                                     |
|                                                                           |
| redirect_uri: process.env.NOTION_REDIRECT_URI,                            |
|                                                                           |
| }),                                                                       |
|                                                                           |
| })                                                                        |
|                                                                           |
| const tokenData = await tokenRes.json()                                   |
|                                                                           |
| // Save user to database (encrypt the token)                              |
|                                                                           |
| const user = await prisma.user.upsert({                                   |
|                                                                           |
| where: { notionWorkspaceId: tokenData.workspace_id },                     |
|                                                                           |
| update: { notionToken: encrypt(tokenData.access_token) },                 |
|                                                                           |
| create: {                                                                 |
|                                                                           |
| notionToken: encrypt(tokenData.access_token),                             |
|                                                                           |
| notionWorkspaceId: tokenData.workspace_id,                                |
|                                                                           |
| notionWorkspaceName: tokenData.workspace_name,                            |
|                                                                           |
| },                                                                        |
|                                                                           |
| })                                                                        |
|                                                                           |
| // Create session                                                         |
|                                                                           |
| const session = await getSession()                                        |
|                                                                           |
| session.userId = user.id                                                  |
|                                                                           |
| session.isAuthenticated = true                                            |
|                                                                           |
| await session.save()                                                      |
|                                                                           |
| return NextResponse.redirect(\'/onboarding\')                             |
|                                                                           |
| }                                                                         |
+---------------------------------------------------------------------------+

**6.7 Image compression --- src/lib/camera.ts**

Compress photos to 1600px max before sending to Claude Vision. Run this
in the browser before the API call.

+-----------------------------------------------------------------------+
| export async function compressImage(file: File): Promise\<string\> {  |
|                                                                       |
| return new Promise((resolve, reject) =\> {                            |
|                                                                       |
| const img = new Image()                                               |
|                                                                       |
| const url = URL.createObjectURL(file)                                 |
|                                                                       |
| img.onload = () =\> {                                                 |
|                                                                       |
| const MAX = 1600                                                      |
|                                                                       |
| let { width, height } = img                                           |
|                                                                       |
| // Scale down if needed                                               |
|                                                                       |
| if (width \> MAX \|\| height \> MAX) {                                |
|                                                                       |
| if (width \> height) {                                                |
|                                                                       |
| height = Math.round((height / width) \* MAX)                          |
|                                                                       |
| width = MAX                                                           |
|                                                                       |
| } else {                                                              |
|                                                                       |
| width = Math.round((width / height) \* MAX)                           |
|                                                                       |
| height = MAX                                                          |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| const canvas = document.createElement(\'canvas\')                     |
|                                                                       |
| canvas.width = width                                                  |
|                                                                       |
| canvas.height = height                                                |
|                                                                       |
| const ctx = canvas.getContext(\'2d\')!                                |
|                                                                       |
| ctx.drawImage(img, 0, 0, width, height)                               |
|                                                                       |
| // Export as JPEG at 80% quality                                      |
|                                                                       |
| canvas.toBlob((blob) =\> {                                            |
|                                                                       |
| if (!blob) return reject(new Error(\'Compression failed\'))           |
|                                                                       |
| const reader = new FileReader()                                       |
|                                                                       |
| reader.onload = () =\> {                                              |
|                                                                       |
| const base64 = (reader.result as string).split(\',\')\[1\]            |
|                                                                       |
| resolve(base64)                                                       |
|                                                                       |
| }                                                                     |
|                                                                       |
| reader.readAsDataURL(blob)                                            |
|                                                                       |
| }, \'image/jpeg\', 0.8)                                               |
|                                                                       |
| URL.revokeObjectURL(url)                                              |
|                                                                       |
| }                                                                     |
|                                                                       |
| img.onerror = reject                                                  |
|                                                                       |
| img.src = url                                                         |
|                                                                       |
| })                                                                    |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**6.8 Offline queue --- src/lib/offline-queue.ts**

Four simple operations --- add, get all, remove, mark failed. Built on
idb.

+-----------------------------------------------------------------------+
| import { openDB } from \'idb\'                                        |
|                                                                       |
| const DB_NAME = \'nevermist\'                                         |
|                                                                       |
| const STORE = \'queue\'                                               |
|                                                                       |
| async function getDB() {                                              |
|                                                                       |
| return openDB(DB_NAME, 1, {                                           |
|                                                                       |
| upgrade(db) {                                                         |
|                                                                       |
| if (!db.objectStoreNames.contains(STORE)) {                           |
|                                                                       |
| db.createObjectStore(STORE, { keyPath: \'id\', autoIncrement: true }) |
|                                                                       |
| }                                                                     |
|                                                                       |
| },                                                                    |
|                                                                       |
| })                                                                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| export async function addToQueue(item: QueueItem) {                   |
|                                                                       |
| const db = await getDB()                                              |
|                                                                       |
| return db.add(STORE, { \...item, createdAt: Date.now(), status:       |
| \'pending\' })                                                        |
|                                                                       |
| }                                                                     |
|                                                                       |
| export async function getAllQueued() {                                |
|                                                                       |
| const db = await getDB()                                              |
|                                                                       |
| return db.getAll(STORE)                                               |
|                                                                       |
| }                                                                     |
|                                                                       |
| export async function removeFromQueue(id: number) {                   |
|                                                                       |
| const db = await getDB()                                              |
|                                                                       |
| return db.delete(STORE, id)                                           |
|                                                                       |
| }                                                                     |
|                                                                       |
| export async function markFailed(id: number, error: string) {         |
|                                                                       |
| const db = await getDB()                                              |
|                                                                       |
| const item = await db.get(STORE, id)                                  |
|                                                                       |
| return db.put(STORE, { \...item, status: \'failed\', error })         |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**7. Day 1 Setup --- Zero to Running App**

*Follow these steps in order. Takes approximately 45--60 minutes the
first time.*

+-----------------------------------------------------------------------+
| **Step 1 Create Next.js app**                                         |
|                                                                       |
| npx create-next-app@latest nevermist \\                               |
|                                                                       |
| \--typescript \\                                                      |
|                                                                       |
| \--tailwind \\                                                        |
|                                                                       |
| \--app \\                                                             |
|                                                                       |
| \--src-dir \\                                                         |
|                                                                       |
| \--import-alias \'@/\*\'                                              |
|                                                                       |
| cd nevermist                                                          |
|                                                                       |
| *Say yes to all prompts. src-dir creates the src/ folder structure.*  |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 2 Install all dependencies**                                   |
|                                                                       |
| npm install \\                                                        |
|                                                                       |
| \@anthropic-ai/sdk \\                                                 |
|                                                                       |
| \@notionhq/client \\                                                  |
|                                                                       |
| \@prisma/client \\                                                    |
|                                                                       |
| \@radix-ui/react-dialog \\                                            |
|                                                                       |
| \@serwist/next \\                                                     |
|                                                                       |
| framer-motion \\                                                      |
|                                                                       |
| idb \\                                                                |
|                                                                       |
| iron-session \\                                                       |
|                                                                       |
| web-push \\                                                           |
|                                                                       |
| zustand                                                               |
|                                                                       |
| npm install -D prisma \@types/web-push                                |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 3 Initialise Prisma**                                          |
|                                                                       |
| npx prisma init                                                       |
|                                                                       |
| \# This creates:                                                      |
|                                                                       |
| \# prisma/schema.prisma --- replace with schema from Section 5        |
|                                                                       |
| \# .env --- delete this, use .env.local instead                       |
|                                                                       |
| *Replace the generated schema.prisma with the one from Section 5 of   |
| this doc.*                                                            |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 4 Create Supabase project and get DATABASE_URL**               |
|                                                                       |
| \# 1. Go to supabase.com → New project                                |
|                                                                       |
| \# 2. Settings → Database → Connection string → URI tab               |
|                                                                       |
| \# 3. Copy the connection string                                      |
|                                                                       |
| \# 4. Add to .env.local as DATABASE_URL=\...                          |
|                                                                       |
| \# Then push your schema to Supabase:                                 |
|                                                                       |
| npx prisma db push                                                    |
|                                                                       |
| \# Verify it worked:                                                  |
|                                                                       |
| npx prisma studio                                                     |
|                                                                       |
| \# Opens at localhost:5555 --- you should see User and PageConfig     |
| tables                                                                |
|                                                                       |
| *If prisma db push fails, check your DATABASE_URL format. It must     |
| start with postgresql://*                                             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 5 Create Notion integration and get OAuth credentials**        |
|                                                                       |
| \# 1. Go to notion.so/my-integrations                                 |
|                                                                       |
| \# 2. Click \'+ New integration\'                                     |
|                                                                       |
| \# 3. Name: Nevermist                                                 |
|                                                                       |
| \# 4. Type: Public (not Internal) --- enables OAuth                   |
|                                                                       |
| \# 5. Redirect URI: http://localhost:3000/api/auth/callback           |
|                                                                       |
| \# 6. Copy Client ID and Client Secret to .env.local                  |
|                                                                       |
| *Make sure to select \'Public integration\' --- Internal integrations |
| don\'t support OAuth.*                                                |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 6 Get Anthropic API key and add credit**                       |
|                                                                       |
| \# 1. Go to console.anthropic.com                                     |
|                                                                       |
| \# 2. API Keys → Create Key → copy to .env.local                      |
|                                                                       |
| \# 3. Billing → Add credit (₹500 lasts months at personal scale)      |
|                                                                       |
| \# 4. Billing → Usage limits → set monthly limit to ₹200 (safety cap) |
+-----------------------------------------------------------------------+

+------------------------------------------------------------------------+
| **Step 7 Generate remaining secrets**                                  |
|                                                                        |
| \# Session secret (run twice --- get two different values)             |
|                                                                        |
| node -e                                                                |
| \"console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))\" |
|                                                                        |
| \# VAPID keys for push notifications                                   |
|                                                                        |
| npx web-push generate-vapid-keys                                       |
|                                                                        |
| \# Add all output values to .env.local                                 |
+------------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 8 Configure PWA manifest --- public/manifest.json**            |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"name\": \"Nevermist\",                                              |
|                                                                       |
| \"short_name\": \"Nevermist\",                                        |
|                                                                       |
| \"description\": \"Your thought never mists.\",                       |
|                                                                       |
| \"start_url\": \"/\",                                                 |
|                                                                       |
| \"display\": \"standalone\",                                          |
|                                                                       |
| \"background_color\": \"#0A0A0A\",                                    |
|                                                                       |
| \"theme_color\": \"#0A0A0A\",                                         |
|                                                                       |
| \"icons\": \[                                                         |
|                                                                       |
| { \"src\": \"/icons/icon-192.png\", \"sizes\": \"192x192\", \"type\": |
| \"image/png\" },                                                      |
|                                                                       |
| { \"src\": \"/icons/icon-512.png\", \"sizes\": \"512x512\", \"type\": |
| \"image/png\" }                                                       |
|                                                                       |
| \]                                                                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| *Create icon-192.png and icon-512.png in public/icons/. Use Nevermist |
| branding.*                                                            |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 9 Run the app**                                                |
|                                                                       |
| npm run dev                                                           |
|                                                                       |
| \# App runs at http://localhost:3000                                  |
|                                                                       |
| \# Prisma Studio at http://localhost:5555 (in separate terminal: npx  |
| prisma studio)                                                        |
|                                                                       |
| *You should see the Next.js default page. From here, start building   |
| the capture screen.*                                                  |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Step 10 Deploy to Vercel**                                          |
|                                                                       |
| \# 1. Push code to GitHub                                             |
|                                                                       |
| git init && git add . && git commit -m \'initial commit\'             |
|                                                                       |
| \# Create repo on github.com, then:                                   |
|                                                                       |
| git remote add origin https://github.com/yourusername/nevermist.git   |
|                                                                       |
| git push -u origin main                                               |
|                                                                       |
| \# 2. Go to vercel.com → New Project → Import your GitHub repo        |
|                                                                       |
| \# 3. Add all .env.local values in Vercel\'s Environment Variables UI |
|                                                                       |
| \# 4. Change NOTION_REDIRECT_URI to your Vercel URL                   |
|                                                                       |
| \# 5. Deploy                                                          |
|                                                                       |
| \# Every git push auto-deploys. Done.                                 |
|                                                                       |
| *Update NOTION_REDIRECT_URI in your Notion integration settings to    |
| your Vercel URL too.*                                                 |
+-----------------------------------------------------------------------+

**8. Recommended Build Order**

*Build in this order --- each phase gives you something working to test
before moving on.*

  ------------ --------------------------- -------------------------------
  **Phase**    **Build this**              **Test by doing this**

  1 ---        Next.js setup, Prisma       Run npx prisma studio --- see
  Foundation   schema, Supabase connected  empty tables in Supabase

  2 --- Auth   Notion OAuth flow, session, Click Connect Notion ---
               callback, user in DB        complete OAuth --- see user row
                                           in Supabase

  3 ---        Page selection UI,          Complete onboarding --- see
  Onboarding   auto-descriptions, save     PageConfig rows in Supabase
               PageConfig                  

  4 ---        CaptureInput, VoiceButton,  See the dark input screen ---
  Capture UI   CameraButton, SendButton    type --- send button appears

  5 --- AI     /api/capture route, Claude  Type a task --- see preview
  processing   call, PreviewCard           card with AI-generated fields

  6 --- Notion /api/notion/send, create    Tap Send --- see actual
  send         task in Notion              checkbox task appear in your
                                           Notion

  7 --- Voice  Web Speech API wrapper,     Tap mic --- speak --- text
               VoiceButton states          appears in input --- send to
                                           Notion

  8 --- Photo  Camera, compression, Claude Photograph a handwritten list
               Vision, TaskChip list       --- see chips --- send each to
                                           Notion

  9 ---        IndexedDB queue, sync on    Turn off wifi --- capture ---
  Offline      reconnect                   turn on wifi --- task appears
                                           in Notion

  10 --- PWA   \@serwist/next, manifest,   Open in mobile browser ---
               icons                       \'Add to Home Screen\' prompt
                                           appears

  11 --- Push  web-push, subscribe         Set nudge time --- receive
  notif        endpoint, Vercel Cron       notification at that time

  12 ---       Animations, first-launch    Full end-to-end feel ---
  Polish       experience, error states    smooth, no rough edges
  ------------ --------------------------- -------------------------------

+-----------------------------------------------------------------------+
| Tip: After Phase 6 (Notion send working), you have a usable app.      |
|                                                                       |
| Phases 7--12 add features and polish on top of a working core.        |
|                                                                       |
| Ship Phase 6 first. Use it daily. Then add voice, photo, and offline. |
+-----------------------------------------------------------------------+

**9. Commands Reference**

**9.1 Daily development**

  ----------------------------------- -----------------------------------
  **Command**                         **What it does**

  npm run dev                         Start dev server at localhost:3000

  npx prisma studio                   Open visual database browser at
                                      localhost:5555

  npx prisma db push                  Sync schema changes to Supabase (no
                                      migration file)

  npx prisma generate                 Regenerate TypeScript client after
                                      schema change

  npm run build                       Build for production --- catches
                                      TypeScript errors

  npm run lint                        Run ESLint --- catches common
                                      mistakes
  ----------------------------------- -----------------------------------

**9.2 One-time setup commands**

  ------------------------------------------------------------------------ -----------------------------------
  **Command**                                                              **When to run**

  npx create-next-app@latest nevermist \--typescript \--tailwind \--app    Day 1 only
  \--src-dir                                                               

  npx prisma init                                                          Day 1 only --- creates prisma/
                                                                           folder

  npx web-push generate-vapid-keys                                         Day 1 only --- generate push
                                                                           notification keys

  node -e                                                                  Day 1 twice --- session secret +
  \"console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))\"   encryption key
  ------------------------------------------------------------------------ -----------------------------------

**9.3 Git workflow**

  ----------------------------------- -----------------------------------
  **Command**                         **What it does**

  git add . && git commit -m          Save your work
  \'message\'                         

  git push                            Push to GitHub --- Vercel
                                      auto-deploys

  git checkout -b feature/voice-input New branch for a feature

  git merge feature/voice-input       Merge completed feature to main
  ----------------------------------- -----------------------------------

Nevermist --- Tech Stack Document v1.0

*Your thought never mists.*
