-- Fixora Step 5B: Idempotency keys for atomic checkout
-- Creates a table to store idempotency keys with customer ownership and order linkage.
-- Enables safe retry of checkout requests with the same key.

create table public.checkout_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  idempotency_key text not null,
  order_id uuid references public.orders(id) on delete set null,
  request_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint checkout_idempotency_keys_unique_customer_key unique (customer_id, idempotency_key)
);

create index checkout_idempotency_keys_customer_id_idx on public.checkout_idempotency_keys(customer_id);
create index checkout_idempotency_keys_order_id_idx on public.checkout_idempotency_keys(order_id);

alter table public.checkout_idempotency_keys enable row level security;

create policy checkout_idempotency_keys_customer_all
on public.checkout_idempotency_keys
for all
to authenticated
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

create policy checkout_idempotency_keys_staff_all
on public.checkout_idempotency_keys
for all
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

revoke all on public.checkout_idempotency_keys from anon;
grant select, insert, update on public.checkout_idempotency_keys to authenticated;

comment on table public.checkout_idempotency_keys is
  'Idempotency keys for checkout requests. One row per customer/key. Links to order on success. Prevents duplicate order creation on retry.';
comment on column public.checkout_idempotency_keys.request_payload is
  'Full checkout request payload for validation against repeated calls with same key but different inputs.';

-- Verification: table and policies created without errors