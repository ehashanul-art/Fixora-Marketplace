-- Fixora Day 03 public stock-state access
-- Exposes stock state only through a narrow RPC; inventory writes remain staff/admin-only.

create or replace function public.get_product_stock_state(product_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when inventory.quantity - inventory.reserved_quantity <= 0 then 'out_of_stock'
    when inventory.quantity - inventory.reserved_quantity <= inventory.low_stock_threshold then 'low_stock'
    else 'in_stock'
  end
  from public.inventory
  join public.products on products.id = inventory.product_id
  join public.categories on categories.id = products.category_id
  where inventory.product_id = get_product_stock_state.product_id
    and products.is_active = true
    and categories.is_active = true;
$$;

revoke all on function public.get_product_stock_state(uuid) from public;
grant execute on function public.get_product_stock_state(uuid) to anon, authenticated;
