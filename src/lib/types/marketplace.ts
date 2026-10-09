export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  public_id: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface PublicProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  sell_price: number;
  compare_at_price: number | null;
  brand: string | null;
  model: string | null;
  warranty_months: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product_images: ProductImage[];
}

export interface ProductWriteInput {
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  short_description?: string | null;
  description?: string | null;
  buy_price: number;
  sell_price: number;
  compare_at_price?: number | null;
  brand?: string | null;
  model?: string | null;
  warranty_months?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface ProductUpdateInput {
  category_id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  short_description?: string | null;
  description?: string | null;
  buy_price?: number;
  sell_price?: number;
  compare_at_price?: number | null;
  brand?: string | null;
  model?: string | null;
  warranty_months?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface ProductImageInput {
  image_url: string;
  public_id?: string | null;
  alt_text?: string | null;
  sort_order?: number;
  is_primary?: boolean;
}

export interface ProductInventoryState {
  state: StockState;
}

export interface InventoryRecord {
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface ManageableProduct extends PublicProduct {
  buy_price: number;
  inventory: InventoryRecord | null;
}

export interface InventoryWriteInput {
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
}

export interface ManageableProductFilters {
  search?: string;
  categoryId?: string;
  status?: "all" | "active" | "inactive";
  limit: number;
  offset: number;
}

export interface ManageableProductsPage {
  products: ManageableProduct[];
  total: number;
}

export interface AdminMarketplaceSummary {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  categories: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface CartItem {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: PublicProduct;
}
