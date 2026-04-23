# Vera PM — Property Management Platform
**verapm.ai** · Built with Next.js 14 + Supabase + Tailwind CSS

---

## What's included

| Module | Status |
|---|---|
| Properties & Units | ✅ |
| Tenants & Leases | ✅ |
| Rent & Payments | ✅ |
| Maintenance Requests | ✅ |
| General Ledger | ✅ |
| Financial Reports (P&L, BS, CF, TB, Owner Statements) | ✅ |
| Bank Reconciliation | ✅ |
| Multi-tenant SaaS (org isolation via RLS) | ✅ |
| Email + Magic Link Auth | ✅ |
| Tenant Portal | Phase 5 |
| Stripe Payments | Phase 5 |
| Mobile App (PWA) | Phase 5 |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Payments:** Stripe (Phase 5)

---

## Setup Guide (step by step)

### Step 1 — Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS** version (e.g. 20.x)
3. Install it — click Next through all defaults
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Verify: type `node --version` → should show `v20.x.x`

---

### Step 2 — Set up Supabase

1. Go to **https://supabase.com** → Sign up free
2. Click **New Project**
   - Name: `verapm`
   - Database password: save this somewhere safe
   - Region: US East (or closest to you)
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** → **New Query**
5. Copy the entire contents of `supabase/schema.sql` and paste it → click **Run**
6. You should see "Success" — your database is ready
7. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://abcdef.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
   - **service_role key** (keep this secret — never expose it)

---

### Step 3 — Configure the app

1. In the `verapm` folder, copy the example env file:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in any text editor (Notepad, TextEdit, VS Code)
3. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJyour-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJyour-actual-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Save the file

---

### Step 4 — Install and run locally

Open Terminal in the `verapm` folder and run:

```bash
npm install
npm run dev
```

Open your browser to **http://localhost:3000**

You should see the Vera PM login page!

---

### Step 5 — Create your account

1. On the login page, click **Sign up free**
2. Enter your email and a password
3. You'll be automatically logged in and your organization is created
4. You're now inside the dashboard

---

### Step 6 — Load sample data (optional)

To load the sample portfolio (4 properties, 9 tenants, payments, etc.):

1. Go to **Supabase → Authentication → Users**
2. Find your user and copy your **User ID** (UUID format)
3. Open `supabase/seed.sql`
4. Replace `'YOUR-USER-UUID'` with your actual UUID
5. Go to **Supabase → SQL Editor** → paste the seed.sql contents → Run

You'll now have sample data matching the HTML prototypes.

---

### Step 7 — Deploy to Vercel (go live at verapm.ai)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial Vera PM deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/verapm.git
   git push -u origin main
   ```
3. In Vercel: **New Project** → Import your GitHub repo
4. Add environment variables (same as `.env.local` but with production URL):
   ```
   NEXT_PUBLIC_SUPABASE_URL        → your Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY   → your anon key
   SUPABASE_SERVICE_ROLE_KEY       → your service role key
   NEXT_PUBLIC_APP_URL             → https://verapm.ai
   ```
5. Click **Deploy** — Vercel builds and deploys in ~2 minutes

---

### Step 8 — Connect verapm.ai domain

1. In Vercel: **Project → Settings → Domains** → Add `verapm.ai`
2. Vercel gives you DNS records to add
3. Go to **Cloudflare** (where you registered the domain)
4. **DNS → Add record:**
   - Type: `CNAME`
   - Name: `@`
   - Target: `cname.vercel-dns.com`
5. Also add:
   - Type: `CNAME`
   - Name: `www`
   - Target: `cname.vercel-dns.com`
6. Back in Vercel → click **Verify** — SSL is automatic
7. Wait 5–10 minutes → visit **https://verapm.ai** 🎉

---

### Step 9 — Set up Supabase auth redirect URLs

So magic links and email confirmations work on your live domain:

1. **Supabase → Authentication → URL Configuration**
2. Site URL: `https://verapm.ai`
3. Redirect URLs — add:
   ```
   https://verapm.ai/dashboard
   https://verapm.ai/auth/callback
   http://localhost:3000/dashboard
   ```

---

## Folder structure

```
verapm/
├── app/
│   ├── (auth)/login/         # Login / signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Sidebar + nav (shared)
│   │   ├── dashboard/        # Overview page
│   │   ├── properties/       # Properties list + detail
│   │   ├── tenants/          # Tenants + leases
│   │   ├── payments/         # Rent ledger
│   │   ├── maintenance/      # Tickets + vendors
│   │   └── gl/               # General ledger + reports
│   ├── globals.css
│   └── layout.tsx
├── components/               # Shared UI components
├── lib/
│   ├── supabase.ts           # Supabase client (browser + server)
│   └── types.ts              # All TypeScript types
├── supabase/
│   ├── schema.sql            # Full database schema + RLS
│   └── seed.sql              # Sample data
├── .env.local.example        # Environment variable template
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Monthly costs at scale

| Service | Free Tier | Paid |
|---|---|---|
| Vercel | Free (unlimited) | $20/mo (teams) |
| Supabase | Free (500MB, 50k MAU) | $25/mo (8GB) |
| Cloudflare domain | ~$30/yr | — |
| Stripe | No monthly fee | 2.9%+30¢/txn |
| **Total** | **~$2.50/mo** | **~$45/mo** |

---

## Next phases

| Phase | Features |
|---|---|
| Phase 5 | Stripe payments, tenant portal login, mobile PWA |
| Phase 6 | Email/SMS notifications (Twilio, SendGrid) |
| Phase 7 | Document storage (lease uploads, e-signatures) |
| Phase 8 | Multi-org SaaS billing (sell to other managers) |

---

## Need help?

Ask Claude to:
- "Add a new page to Vera PM for [feature]"
- "Fix this error: [paste error message]"
- "Connect Stripe payments to the payments page"
- "Build the tenant portal login page"
