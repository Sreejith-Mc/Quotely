# Quotely — Setup

This app is a React + Vite SPA backed by Supabase (Postgres, Auth, Storage) and deployed on Vercel (static build + one serverless function), built to stay on free tiers.

## 1. Create the Supabase project

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run the entire contents of `supabase/migrations/0001_init.sql`. This creates all tables, RLS policies, the `next_quote_number()` function, and the `branding`/`avatars` storage buckets with their policies.
3. In **Authentication > Providers**, make sure Email/Password sign-in is enabled.
4. Create your first admin account:
   - In **Authentication > Users**, click "Add user" and create yourself with email + password (set "Auto Confirm User" on).
   - In **Table Editor > profiles**, find the row created for that user (the `on_auth_user_created` trigger inserts it automatically with `role = 'employee'`) and change `role` to `admin`.

## 2. Get your API keys

In **Project Settings > API**:
- `Project URL` → used as both `VITE_SUPABASE_URL` and `SUPABASE_URL`.
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY`.
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server-only, never put this in a `VITE_`-prefixed variable or commit it**).

## 3. Local development

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env
npm install
npm run dev
```

The `api/invite-employee.js` serverless function (used by Admin → Employees → Add Employee) only runs under Vercel. Locally that one button won't work unless you run `vercel dev`, but everything else works against your live Supabase project.

## 4. Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel as a new project (framework preset: Vite).
2. In **Project Settings > Environment Variables** add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL` (same value as `VITE_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY` (**do not** prefix this with `VITE_` — that would expose it to the browser)
3. Deploy. Vercel will build the SPA with `vite build` and automatically pick up `api/invite-employee.js` as a serverless function.

## 5. First login

- Employee/Admin sign-in: `/login` (admin sign-in: `/login?as=admin`).
- Sign in with the admin account you created in step 1, then use Admin → Employees → "Add Employee" to invite your team — they'll receive a temporary password you can hand them directly (no email sending is wired up; the password is just generated and shown to you to share).
