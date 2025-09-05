import React, { useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import type { Theme } from "../types";
import { storage } from "../utils/storage";
import { appReducer, initialState, AppContext } from "./AppReducer";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // Charger les données depuis le storage
        const suppliers = storage.getSuppliers?.() ?? [];
        const products = storage.getProducts?.() ?? [];
        const orders = storage.getOrders?.() ?? [];

        dispatch({ type: "SET_SUPPLIERS", payload: suppliers });
        dispatch({ type: "SET_PRODUCTS", payload: products });
        dispatch({ type: "SET_ORDERS", payload: orders });

        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
          dispatch({ type: "SET_THEME", payload: savedTheme });
        }
      } catch (err) {
        console.error(err);
        dispatch({ type: "SET_ERROR", payload: "Failed to load data" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    const theme = state.preferences.theme;
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [state.preferences.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
