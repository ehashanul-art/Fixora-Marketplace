-- Fixora Day 02 marketplace database foundation

create type public.order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

create type public.payment_status as enum (
  'pending', 'paid', 'failed', 'refunded'
);

create sequence public.order_number_seq;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete restrict,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_not_blank check (length(trim(name)) > 0),
  constraint categories_slug_not_blank check (length(trim(slug)) > 0)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  description text,
  buy_price numeric(12, 2) not null default 0,
  sell_price numeric(12, 2) not null default 0,
  compare_at_price numeric(12, 2),
  brand text,
  model text,
  warranty_months integer,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_name_not_blank check (length(trim(name)) > 0),
  constraint products_slug_not_blank check (length(trim(slug)) > 0),
  constraint products_sku_not_blank check (length(trim(sku)) > 0),
  constraint products_buy_price_nonnegative check (buy_price >= 0),
  constraint products_sell_price_nonnegative check (sell_price >= 0),
  constraint products_compare_at_price_nonnegative check (compare_at_price is null or compare_at_price >= 0),
  constraint products_warranty_months_nonnegative check (warranty_months is null or warranty_months >= 0)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  public_id text,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint product_images_url_not_blank check (length(trim(image_url)) > 0)
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete restrict,
  quantity integer not null default 0,
  reserved_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint inventory_quantity_nonnegative check (quantity >= 0),
  constraint inventory_reserved_nonnegative check (reserved_quantity >= 0),
  constraint inventory_threshold_nonnegative check (low_stock_threshold >= 0),
  constraint inventory_reserved_within_quantity check (reserved_quantity <= quantity)
);

create or replace function public.generate_order_number()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select format(
    'FIX-%s-%s',
    to_char(current_date, 'YYYY'),
    lpad(nextval('public.order_number_seq')::text, 6, '0')
  );
$$;

revoke all on function public.generate_order_number() from public;
grant execute on function public.generate_order_number() to authenticated;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  order_number text not null unique default public.generate_order_number(),
  status public.order_status not null default 'pending',
  subtotal numeric(12, 2) not null default 0,
  shipping_cost numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text,
  shipping_area text,
  payment_status public.payment_status not null default 'pending',
  payment_method text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_subtotal_nonnegative check (subtotal >= 0),
  constraint orders_shipping_cost_nonnegative check (shipping_cost >= 0),
  constraint orders_discount_nonnegative check (discount >= 0),
  constraint orders_total_nonnegative check (total >= 0),
  constraint orders_shipping_name_not_blank check (length(trim(shipping_name)) > 0),
  constraint orders_shipping_phone_not_blank check (length(trim(shipping_phone)) > 0),
  constraint orders_shipping_address_not_blank check (length(trim(shipping_address)) > 0)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  sku text not null,
  quantity integer not null,
  unit_price numeric(12, 2) not null,
  buy_price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint order_items_product_name_not_blank check (length(trim(product_name)) > 0),
  constraint order_items_sku_not_blank check (length(trim(sku)) > 0),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_nonnegative check (unit_price >= 0),
  constraint order_items_buy_price_nonnegative check (buy_price >= 0),
  constraint order_items_subtotal_nonnegative check (subtotal >= 0)
);

create index categories_parent_id_idx on public.categories(parent_id);
create index products_category_id_idx on public.products(category_id);
create index product_images_product_id_idx on public.product_images(product_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

create trigger categories_set_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger inventory_set_updated_at before update on public.inventory for each row execute procedure public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute procedure public.set_updated_at();

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'seller')
  );
$$;

revoke all on function public.is_staff_or_admin() from public;
grant execute on function public.is_staff_or_admin() to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy categories_public_read_active on public.categories for select to anon, authenticated using (is_active = true);
create policy categories_staff_manage on public.categories for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy products_public_read_active on public.products for select to anon, authenticated using (
  is_active = true and exists (
    select 1 from public.categories where categories.id = products.category_id and categories.is_active = true
  )
);
create policy products_staff_manage on public.products for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy product_images_public_read_active on public.product_images for select to anon, authenticated using (
  exists (
    select 1 from public.products
    join public.categories on categories.id = products.category_id
    where products.id = product_images.product_id and products.is_active = true and categories.is_active = true
  )
);
create policy product_images_staff_manage on public.product_images for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy inventory_staff_manage on public.inventory for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy orders_customer_read_own on public.orders for select to authenticated using (customer_id = auth.uid());
create policy orders_staff_manage on public.orders for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create policy order_items_customer_read_own on public.order_items for select to authenticated using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = auth.uid())
);
create policy order_items_staff_manage on public.order_items for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant select on public.orders, public.order_items to authenticated;
grant insert on public.orders to authenticated;
grant all on public.categories, public.products, public.product_images, public.inventory to authenticated;
grant all on public.orders, public.order_items to authenticated;

comment on column public.order_items.product_name is 'Historical product name snapshot at checkout.';
comment on column public.order_items.sku is 'Historical SKU snapshot at checkout.';
comment on column public.order_items.unit_price is 'Historical customer price snapshot at checkout.';
comment on column public.order_items.buy_price is 'Historical cost snapshot at checkout.';