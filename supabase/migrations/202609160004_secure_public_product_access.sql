-- Fixora Step 1: public product data boundary
--
-- The products table contains business-only cost data (buy_price). RLS limits
-- rows, not columns, so public catalog reads must go through a separate,
-- explicitly selected interface.

create or replace view public.customer_safe_products
with (security_barrier = true)
as
select
  products.id,
  products.category_id,
  products.name,
  products.slug,
  products.sku,
  products.short_description,
  products.description,
  products.sell_price,
  products.compare_at_price,
  products.brand,
  products.model,
  products.warranty_months,
  products.is_active,
  products.is_featured,
  products.created_at,
  products.updated_at
from public.products
join public.categories on categories.id = products.category_id
where products.is_active = true
  and categories.is_active = true;

comment on view public.customer_safe_products is
  'Customer-safe active product catalog. Intentionally excludes buy_price and other future internal product fields.';

revoke all on public.customer_safe_products from public;
grant select on public.customer_safe_products to anon, authenticated;

-- Anonymous clients no longer have any base-table product read grant. The
-- authenticated role retains its existing table grant for staff operations,
-- while RLS below distinguishes staff from customers.
revoke select on public.products from anon, public;

-- The staff policy continues to grant full-table reads to staff/admin users.
-- Removing only the public policy prevents customer rows from being returned
-- from the cost-bearing base table while preserving staff management access.
drop policy if exists products_public_read_active on public.products;

-- Product images remain publicly readable only when their product is present
-- in the customer-safe catalog. The view runs with its owner privileges, so
-- this policy does not require public base-table access to products.
drop policy if exists product_images_public_read_active on public.product_images;
create policy product_images_public_read_active
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.customer_safe_products
    where customer_safe_products.id = product_images.product_id
  )
);

-- Verification after applying this migration (run with the appropriate JWT
-- role in the Supabase SQL editor or API client):
--   select id, name, sell_price from public.customer_safe_products limit 1;
--   select buy_price from public.customer_safe_products; -- must fail: column does not exist
--   select buy_price from public.products; -- anon/customer returns no rows via RLS
--   select buy_price from public.products; -- staff/admin returns permitted rows via products_staff_manage
