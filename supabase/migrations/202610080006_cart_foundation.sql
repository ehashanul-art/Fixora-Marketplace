-- Fixora Step 4B: Cart database foundation
-- Creates cart_items table for authenticated customer carts.
-- No price, buy_price, or subtotal stored in cart.
-- Price always read from customer_safe_products.sell_price at render/mutation time.
-- Inventory validated live via get_product_stock_state at mutation/checkout.

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cart_items_quantity_positive check (quantity > 0),
  constraint cart_items_unique_customer_product unique (customer_id, product_id)
);

create index cart_items_customer_id_idx on public.cart_items(customer_id);
create index cart_items_product_id_idx on public.cart_items(product_id);

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute procedure public.set_updated_at();

alter table public.cart_items enable row level security;

create policy cart_items_customer_all
on public.cart_items
for all
to authenticated
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

create policy cart_items_staff_all
on public.cart_items
for all
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

revoke all on public.cart_items from anon;
grant select, insert, update, delete on public.cart_items to authenticated;

comment on table public.cart_items is
  'Authenticated customer cart items. One row per customer/product. Quantity only. Price and stock validated at mutation/checkout via customer_safe_products and get_product_stock_state.';
comment on column public.cart_items.quantity is
  'Quantity of this product in the cart. Must be > 0. Validated against available inventory (quantity - reserved_quantity) at add/update/checkout.';