import { Home, Calendar, Settings, Sun, Moon, Circle } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import type { View } from "../../types";

export function BottomNav() {
  const { state, dispatch } = useApp();
  const { preferences, currentView } = state;
  const theme = preferences.theme;

  const setView = (view: View) => {
    dispatch({ type: "SET_VIEW", payload: view });
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    dispatch({
      type: "SET_THEME",
      payload: newTheme,
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md dark:bg-gray-900 dark:border-gray-700 md:hidden">
      <div className="flex items-center justify-around h-14">
        <button
          onClick={() => setView("orders")}
          className={`flex flex-col items-center text-xs ${
            currentView === "orders"
              ? "text-primary-600"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <Home className="w-5 h-5" />
          Orders
        </button>

        <button
          onClick={() => setView("products")}
          className={`flex flex-col items-center text-xs ${
            currentView === "products"
              ? "text-primary-600"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <Circle className="w-5 h-5" />
          Products
        </button>

        <button
          onClick={() => setView("suppliers")}
          className={`flex flex-col items-center text-xs ${
            currentView === "suppliers"
              ? "text-primary-600"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <Calendar className="w-5 h-5" />
          Suppliers
        </button>

        <button
          onClick={toggleTheme}
          className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          Thème
        </button>

        <button
          onClick={() => setView("settings")}
          className={`flex flex-col items-center text-xs ${
            currentView === "settings"
              ? "text-primary-600"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </nav>
  );
}
