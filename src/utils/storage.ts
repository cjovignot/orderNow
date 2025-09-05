import type { Supplier, Product, Order, UserPreferences } from "../types";

const STORAGE_KEYS = {
  SUPPLIERS: "suppliers",
  PRODUCTS: "products",
  ORDERS: "orders",
  PREFERENCES: "preferences",
} as const;

export const storage = {
  // Suppliers
  getSuppliers: (): Supplier[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setSuppliers: (suppliers: Supplier[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (error) {
      console.error("Failed to save suppliers:", error);
    }
  },

  // Products
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setProducts: (products: Product[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products:", error);
    }
  },

  // Orders
  getOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setOrders: (orders: Order[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error("Failed to save orders:", error);
    }
  },

  // Preferences
  getPreferences: (): UserPreferences => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data
        ? JSON.parse(data)
        : {
            theme: "system",
            language: "fr",
            notifications: true,
          };
    } catch {
      return {
        theme: "system",
        language: "fr",
        notifications: true,
      };
    }
  },

  setPreferences: (preferences: UserPreferences): void => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  // Export data
  exportData: (): string => {
    const data = {
      suppliers: storage.getSuppliers(),
      products: storage.getProducts(),
      orders: storage.getOrders(),
      preferences: storage.getPreferences(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import data
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.suppliers) storage.setSuppliers(data.suppliers);
      if (data.products) storage.setProducts(data.products);
      if (data.orders) storage.setOrders(data.orders);
      if (data.preferences) storage.setPreferences(data.preferences);
      return true;
    } catch {
      return false;
    }
  },
};
