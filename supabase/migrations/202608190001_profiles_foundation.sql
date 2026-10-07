-- Fixora Day 01 profile foundation
-- Apply this migration in the Supabase SQL editor or with Supabase CLI.

create type public.app_role as enum ('customer', 'admin', 'seller');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is 'Public application profile linked one-to-one with auth.users.';
comment on column public.profiles.role is 'Assigned by trusted server/database operators; client users cannot change it.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- A client may update profile details, but never its role. Trusted operators
-- can promote an account through the Supabase SQL editor or a protected server job.
create or replace function public.prevent_client_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'profile role changes must be performed by a trusted operator';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_client_role_change() from public;

create trigger profiles_prevent_client_role_change
before update on public.profiles
for each row execute procedure public.prevent_client_role_change();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own_details"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- No INSERT, DELETE, or role-changing policy is granted to client users.
-- The auth trigger creates profiles, and trusted operators use the SQL editor.

revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;

-- Future roles can be added deliberately with an ALTER TYPE migration:
-- alter type public.app_role add value 'technician';
-- alter type public.app_role add value 'manager';
-- alter type public.app_role add value 'staff';
