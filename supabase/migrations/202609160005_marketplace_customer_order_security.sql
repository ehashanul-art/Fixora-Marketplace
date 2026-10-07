-- Customer order-item reads are column-limited. Staff retain a separate,
-- role-gated projection for internal cost and historical business data.

revoke select on public.order_items from public, anon, authenticated;

grant select (
  id,
  order_id,
  product_id,
  product_name,
  sku,
  quantity,
  unit_price,
  subtotal,
  created_at
) on public.order_items to authenticated;

create or replace view public.customer_safe_order_items
with (security_invoker = true, security_barrier = true)
as
select
  order_items.id,
  order_items.order_id,
  order_items.product_id,
  order_items.product_name,
  order_items.sku,
  order_items.quantity,
  order_items.unit_price,
  order_items.subtotal,
  order_items.created_at
from public.order_items
join public.orders on orders.id = order_items.order_id
where orders.customer_id = (select auth.uid());

revoke all on public.customer_safe_order_items from public, anon, authenticated;
grant select on public.customer_safe_order_items to authenticated;

-- The ordinary authenticated role cannot select buy_price from the base table.
-- Trusted internal staff can read costs only through this gated view.
create or replace view public.staff_order_items
with (security_barrier = true)
as
select
  order_items.id,
  order_items.order_id,
  order_items.product_id,
  order_items.product_name,
  order_items.sku,
  order_items.quantity,
  order_items.unit_price,
  order_items.buy_price,
  order_items.subtotal,
  order_items.created_at
from public.order_items
where public.is_staff_or_admin();

revoke all on public.staff_order_items from public, anon, authenticated;
grant select on public.staff_order_items to authenticated;

comment on view public.customer_safe_order_items is
  'Customer-owned order items. Excludes buy_price and relies on invoker RLS plus the customer order ownership predicate.';
comment on view public.staff_order_items is
  'Internal order-item projection including historical buy_price; returns rows only to admin/seller staff.';

-- Guard the customer-facing database boundary whenever this migration runs.
do $security_checks$
declare
  customer_columns text[];
  staff_definition text;
begin
  if has_column_privilege('authenticated', 'public.order_items', 'buy_price', 'select') then
    raise exception 'authenticated users must not have SELECT access to order_items.buy_price';
  end if;

  if not has_column_privilege('authenticated', 'public.order_items', 'quantity', 'select') then
    raise exception 'authenticated users must retain safe order-item column access';
  end if;

  if not has_table_privilege('authenticated', 'public.customer_safe_order_items', 'select') then
    raise exception 'authenticated users must be able to read the customer-safe order-item view';
  end if;

  select array_agg(column_name order by ordinal_position)
    into customer_columns
    from information_schema.columns
   where table_schema = 'public'
     and table_name = 'customer_safe_order_items';

  if customer_columns is distinct from array[
    'id', 'order_id', 'product_id', 'product_name', 'sku',
    'quantity', 'unit_price', 'subtotal', 'created_at'
  ]::text[] then
    raise exception 'customer_safe_order_items contains an unexpected column set';
  end if;

  select pg_get_viewdef('public.staff_order_items'::regclass)
    into staff_definition;

  if position('is_staff_or_admin' in staff_definition) = 0 then
    raise exception 'staff_order_items must require the existing staff role check';
  end if;
end;
$security_checks$;
