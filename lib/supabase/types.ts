export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  duration_days: number | null;
  price: number;
  stock_count: number;
  is_active: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_variants?: ProductVariant[];
  categories?: Category | null;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "delivered"
  | "expired"
  | "cancelled";

export type Order = {
  id: string;
  order_code: string;
  variant_id: string;
  product_name_snapshot: string;
  variant_label_snapshot: string;
  price_snapshot: number;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string | null;
  payment_method: "manual_transfer" | "xendit";
  status: OrderStatus;
  proof_url: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
};
