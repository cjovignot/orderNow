import { createContext } from "react";
import type {
  View,
  Supplier,
  Product,
  Order,
  UserPreferences,
  Theme,
} from "../types";
import { storage } from "../utils/storage";

export const AppContext = createContext<{
  state: typeof initialState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export interface AppState {
  user?: UserType | null;
  currentView: View;
  preferences: UserPreferences;
  suppliers: Supplier[];
  products: Product[];
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export const initialState: AppState = {
  user: null,
  preferences: storage.getPreferences(),
  currentView: "orders",
  suppliers: [],
  products: [],
  orders: [],
  loading: true,
  error: null,
};

export interface UserType {
  id: string;
  email: string;
  isGuest: boolean;
}

export type AppAction =
  | { type: "SET_USER"; payload: UserType | null }
  | { type: "SET_PREFERENCES"; payload: Partial<UserPreferences> } // partial pour update partiel
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_VIEW"; payload: View }
  | { type: "SET_SUPPLIERS"; payload: Supplier[] }
  | { type: "ADD_SUPPLIER"; payload: Supplier }
  | { type: "UPDATE_SUPPLIER"; payload: Supplier }
  | { type: "DELETE_SUPPLIER"; payload: string }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER"; payload: Order }
  | { type: "DELETE_ORDER"; payload: string }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_PREFERENCES":
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case "SET_THEME":
      return {
        ...state,
        preferences: { ...state.preferences, theme: action.payload },
      };
    case "SET_VIEW":
      return {
        ...state,
        currentView: action.payload,
      };
    case "SET_SUPPLIERS":
      return { ...state, suppliers: action.payload };
    case "ADD_SUPPLIER":
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case "DELETE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
      };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case "SET_ORDERS":
      return { ...state, orders: action.payload };
    case "ADD_ORDER":
      return { ...state, orders: [...state.orders, action.payload] };
    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? action.payload : o
        ),
      };
    case "DELETE_ORDER":
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};
