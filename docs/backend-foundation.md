# Fixora Backend Foundation

Day 01 establishes Supabase Auth, a protected `profiles` table, Next.js Supabase clients, and a server-only Cloudinary upload proof of concept.

## Supabase Setup

1. Create a Supabase project.
2. In Project Settings > API, copy the project URL and anon/publishable key into `.env.local`.
3. Open the Supabase SQL Editor and run `supabase/migrations/202608190001_profiles_foundation.sql`.
4. In Authentication > Providers, enable Email. Choose whether email confirmation is required for the environment.
5. Add the local and deployed callback URLs in Authentication > URL Configuration for password reset redirects.

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are shared with the frontend. Never use a service-role key in browser code.

## Profiles and Roles

`public.profiles.id` is a one-to-one foreign key to `auth.users.id` with cascade delete. The role is a PostgreSQL enum with `customer`, `seller`, and `admin`. Future roles can be added through reviewed migrations, for example `alter type public.app_role add value 'technician';`.

The `on_auth_user_created` trigger creates a customer profile from `raw_user_meta_data.full_name` and `phone`. The profile update trigger refreshes `updated_at`.

## Authentication Flow

Use `src/features/auth/auth.ts` from client components for email/password sign-up, sign-in, sign-out, password reset preparation, and auth-state subscriptions. `src/lib/supabase/browser.ts` creates the browser client. `src/lib/supabase/server.ts` creates a cookie-backed App Router server client. `src/lib/supabase/profile.ts` reads the authenticated user's own profile server-side.

After sign-up, Supabase may require email confirmation. Once `auth.users` is inserted, the database trigger creates the profile regardless of whether the UI has confirmed the email.

## RLS Strategy

RLS is enabled on `public.profiles`.

- Authenticated users can select only the row where `auth.uid() = id`.
- Authenticated users can update only their own row.
- There is no client insert or delete policy.
- A database trigger rejects role changes when a request has an authenticated user, preventing self-promotion to admin.
- The signup trigger is `security definer` with `search_path = public` and is not executable by public roles.

RLS is the security boundary. Frontend role checks are only for presentation.

## Promoting the First Admin

After the owner has registered the account, run this exact statement in the Supabase SQL Editor while signed in as an authorized project operator:

```sql
update public.profiles
set role = 'admin', updated_at = timezone('utc', now())
where id = (select id from auth.users where email = 'owner@example.com');
```

Replace the email with the verified owner account. Do not expose a public endpoint that accepts a role. The client-side role-change trigger blocks normal authenticated requests; the SQL Editor/service operations run outside that client request context.

## Cloudinary Strategy

Create a Cloudinary product environment and keep assets under:

- `fixora/products`
- `fixora/categories`
- `fixora/brands`
- `fixora/users`

`POST /api/uploads/image` is a Day 01 proof-of-concept route. It accepts multipart field `file`, allows JPEG/PNG/WebP only, limits files to 5 MB, restricts folder names to the four namespaces above, and returns Cloudinary's `secure_url` and `public_id`.

The route uses the server-only Cloudinary API secret. It is intentionally not a complete authenticated product uploader. Before production use, require an authenticated admin/seller policy, add content inspection and image dimension checks, and persist the returned public ID with the owning record.

## Environment

Copy `.env.example` to `.env.local`. Public variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

Server-only variables required by the upload route:

```text
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`.env.local` is ignored. No service-role key, database password, or Cloudinary secret may be committed or passed to client components.

## Developer A Integration Steps

1. Pull the `feature/database-setup` branch.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill the public Supabase values.
4. Apply the SQL migration in Supabase.
5. Import `createSupabaseBrowserClient` for client components and `createSupabaseServerClient` for server components/route handlers.
6. Import the auth helpers from `src/features/auth/auth.ts` for UI actions.
7. Use `getCurrentProfile()` for server-side profile reads.
8. Keep Cloudinary uploads behind `/api/uploads/image`; never import `cloudinary` into client code.

## Verification Checklist

Remote verification requires real Supabase and Cloudinary credentials, which are intentionally not present in this repository. With those configured, test:

1. Register a new email/password user.
2. Confirm both `auth.users` and `profiles` contain the user ID.
3. Log in and read the own profile.
4. Attempt to select/update a different profile and confirm RLS denies it.
5. Attempt to update the own role to `admin` and confirm the trigger rejects it.
6. Upload a JPEG/PNG/WebP under 5 MB and verify the returned `secureUrl` in a browser.
7. Upload a non-image or oversized file and confirm rejection.

## Limitations and Day 02

Day 01 does not implement products, inventory, cart, orders, checkout, payments, seller workflows, or full RBAC. Day 02 should add Supabase middleware/session refresh, authenticated upload authorization, generated database types, integration tests against a local Supabase instance, and the first product schema.
