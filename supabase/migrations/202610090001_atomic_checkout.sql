-- Fixora Step 5B: Atomic checkout and order database foundation
-- Creates a PostgreSQL function for atomic order creation from cart with inventory reservation.
-- Uses a single transaction with row-level locking to prevent overselling.

-- Inventory accounting model (documented for future maintenance):
-- quantity: total physical stock on hand
-- reserved_quantity: stock committed to confirmed orders (not yet fulfilled/shipped)
-- available = quantity - reserved_quantity
-- At checkout: reserved_quantity += ordered_qty (stock reserved for this order)
-- On fulfillment: quantity -= fulfilled_qty; reserved_quantity -= fulfilled_qty
-- On cancellation: reserved_quantity -= cancelled_qty
-- This model preserves accurate available stock and supports future fulfillment/cancellation flows.

create or replace function public.create_order_from_cart(
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_area text,
  p_payment_method text,
  p_idempotency_key uuid,
  p_shipping_cost numeric(12,2) default 0,
  p_discount numeric(12,2) default 0
)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_shipping_cost numeric(12,2);
  v_discount numeric(12,2);
  v_cart_item record;
  v_product record;
  v_inventory record;
  v_available integer;
  v_new_reserved integer;
  v_item_subtotal numeric(12,2);
  v_cart_count integer := 0;
  v_request_payload jsonb;
  v_existing_order_id uuid;
  v_existing_order_number text;
begin
  -- 1. Authenticate customer
  v_customer_id := auth.uid();
  if v_customer_id is null then
    raise exception 'Authentication required' using errcode = 'P0001';
  end if;

  -- 2. Validate payment method: only 'cod' allowed for initial release
  if p_payment_method is null or trim(p_payment_method) = '' or lower(trim(p_payment_method)) <> 'cod' then
    raise exception 'Invalid payment method. Only COD is supported.' using errcode = 'P0007';
  end if;

  -- 3. Validate shipping cost and discount
  v_shipping_cost := coalesce(p_shipping_cost, 0);
  v_discount := coalesce(p_discount, 0);

  if v_shipping_cost < 0 then
    raise exception 'Shipping cost cannot be negative' using errcode = 'P0008';
  end if;

  if v_discount < 0 then
    raise exception 'Discount cannot be negative' using errcode = 'P0009';
  end if;

  -- 4. Validate idempotency key
  if p_idempotency_key is null then
    raise exception 'Idempotency key is required' using errcode = 'P0010';
  end if;

  -- 5. Build deterministic request payload for idempotency validation
  v_request_payload := jsonb_build_object(
    'shipping_name', trim(p_shipping_name),
    'shipping_phone', trim(p_shipping_phone),
    'shipping_address', trim(p_shipping_address),
    'shipping_city', trim(p_shipping_city),
    'shipping_area', trim(p_shipping_area),
    'payment_method', lower(trim(p_payment_method)),
    'shipping_cost', v_shipping_cost,
    'discount', v_discount
  );

  -- 6. Idempotency: attempt to insert the key with the request payload
  -- If the key already exists, the unique constraint will raise an exception
  -- We handle this by catching the exception and validating the existing row
  begin
    insert into public.checkout_idempotency_keys (customer_id, idempotency_key, request_payload)
    values (v_customer_id, p_idempotency_key, v_request_payload);
  exception
    when unique_violation then
      -- Key exists for this customer. Lock the row and validate payload.
      select order_id into v_existing_order_id
      from public.checkout_idempotency_keys
      where customer_id = v_customer_id
        and idempotency_key = p_idempotency_key
      for update;

      if v_existing_order_id is not null then
        -- Order already created for this key. Return it if payload matches.
        select request_payload, order_number
        into v_request_payload, v_existing_order_number
        from public.checkout_idempotency_keys cik
        join public.orders o on o.id = cik.order_id
        where cik.customer_id = v_customer_id
          and cik.idempotency_key = p_idempotency_key;

        -- Validate payload matches (excluding customer_id which is implicit)
        if (select request_payload from public.checkout_idempotency_keys
            where customer_id = v_customer_id and idempotency_key = p_idempotency_key) <> v_request_payload then
          raise exception 'Idempotency key reused with different request payload' using errcode = 'P0011';
        end if;

        -- Return existing order
        return query select v_existing_order_id, v_existing_order_number;
        return;
      else
        -- Key exists but no order_id yet (in-progress or failed checkout).
        -- Validate payload matches.
        if (select request_payload from public.checkout_idempotency_keys
            where customer_id = v_customer_id and idempotency_key = p_idempotency_key) <> v_request_payload then
          raise exception 'Idempotency key reused with different request payload' using errcode = 'P0011';
        end if;
        -- Continue with checkout - the existing row will be updated with order_id on success
      end if;
  end;

  -- 7. Count cart items and fail fast if empty
  select count(*) into v_cart_count
  from public.cart_items
  where customer_id = v_customer_id;

  if v_cart_count = 0 then
    raise exception 'Cart is empty' using errcode = 'P0002';
  end if;

  -- 8. Create order header (will be rolled back if later steps fail)
  select public.generate_order_number() into v_order_number;

  insert into public.orders (
    customer_id,
    order_number,
    status,
    subtotal,
    shipping_cost,
    discount,
    total,
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    shipping_area,
    payment_status,
    payment_method
  ) values (
    v_customer_id,
    v_order_number,
    'pending'::public.order_status,
    0, -- subtotal calculated below
    v_shipping_cost,
    v_discount,
    0, -- total calculated below
    trim(p_shipping_name),
    trim(p_shipping_phone),
    trim(p_shipping_address),
    trim(p_shipping_city),
    trim(p_shipping_area),
    'pending'::public.payment_status,
    lower(trim(p_payment_method))
  )
  returning id into v_order_id;

  -- 9. Update idempotency row with order_id (same transaction)
  update public.checkout_idempotency_keys
  set order_id = v_order_id
  where customer_id = v_customer_id
    and idempotency_key = p_idempotency_key;

  -- 10. Process each cart item: lock inventory, validate, create order_item, reserve stock
  -- Lock cart items first in consistent order (by product_id) to prevent deadlocks
  for v_cart_item in
    select ci.id, ci.product_id, ci.quantity
    from public.cart_items ci
    where ci.customer_id = v_customer_id
    order by ci.product_id
  loop
    -- 10a. Lock product and inventory rows in consistent order
    -- First lock the product row (checks is_active)
    select p.id, p.name, p.sku, p.sell_price, p.buy_price, p.is_active
    into v_product
    from public.products p
    where p.id = v_cart_item.product_id
    for update of p;

    if not found then
      raise exception 'Product not found: %', v_cart_item.product_id using errcode = 'P0003';
    end if;

    if not v_product.is_active then
      raise exception 'Product is no longer available: %', v_product.name using errcode = 'P0004';
    end if;

    -- 10b. Lock inventory row
    select i.quantity, i.reserved_quantity
    into v_inventory
    from public.inventory i
    where i.product_id = v_cart_item.product_id
    for update of i;

    if not found then
      -- No inventory row means no stock tracking - treat as out of stock
      raise exception 'Product has no inventory tracking: %', v_product.name using errcode = 'P0005';
    end if;

    -- 10c. Calculate available stock and validate
    v_available := v_inventory.quantity - v_inventory.reserved_quantity;
    if v_cart_item.quantity > v_available then
      raise exception 'Insufficient stock for product: % (requested: %, available: %)', v_product.name, v_cart_item.quantity, v_available using errcode = 'P0006';
    end if;

    -- 10d. Calculate line subtotal using authoritative sell_price
    v_item_subtotal := v_product.sell_price * v_cart_item.quantity;
    v_subtotal := v_subtotal + v_item_subtotal;

    -- 10e. Insert order_item with historical snapshot (includes buy_price)
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      quantity,
      unit_price,
      buy_price,
      subtotal
    ) values (
      v_order_id,
      v_cart_item.product_id,
      v_product.name,
      v_product.sku,
      v_cart_item.quantity,
      v_product.sell_price,
      v_product.buy_price,
      v_item_subtotal
    );

    -- 10f. Reserve inventory: increment reserved_quantity
    v_new_reserved := v_inventory.reserved_quantity + v_cart_item.quantity;

    -- The CHECK constraint (reserved_quantity <= quantity) will enforce we don't over-reserve
    update public.inventory
    set reserved_quantity = v_new_reserved
    where product_id = v_cart_item.product_id;
  end loop;

  -- 11. Validate discount does not exceed subtotal
  if v_discount > v_subtotal then
    raise exception 'Discount cannot exceed subtotal' using errcode = 'P0012';
  end if;

  -- 12. Calculate totals
  v_total := v_subtotal + v_shipping_cost - v_discount;

  -- 13. Update order with calculated totals
  update public.orders
  set subtotal = v_subtotal,
      total = v_total
  where id = v_order_id;

  -- 14. Clear cart atomically (only this customer's cart items)
  delete from public.cart_items
  where customer_id = v_customer_id;

  -- 15. Return order identifiers to caller
  return query select v_order_id, v_order_number;

exception
  when others then
    -- Re-raise with original error code for predictable handling
    raise;
end;
$$;

-- Function permissions
revoke all on function public.create_order_from_cart(text, text, text, text, text, text, uuid, numeric, numeric) from public;
grant execute on function public.create_order_from_cart(text, text, text, text, text, text, uuid, numeric, numeric) to authenticated;

-- Verification: basic syntax and dependency check
-- The function should compile without errors if all referenced tables/columns/enums exist.