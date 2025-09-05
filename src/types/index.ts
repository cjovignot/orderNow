export interface Supplier {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  siret: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  supplierId: string;
  quantity: number;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  supplierId: string;
  products: OrderProduct[];
  total: number;
  status: "draft" | "sent" | "received";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "fr" | "en";
  notifications: boolean;
}

export type Theme = "light" | "dark" | "system";

export type View = "suppliers" | "products" | "orders" | "settings";
