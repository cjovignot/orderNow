import { Settings, Sun, Moon } from "lucide-react";
import { useApp } from "../../hooks/useApp";
interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { state, dispatch } = useApp();
  const { preferences } = state;
  const theme = preferences.theme;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    dispatch({
      type: "SET_THEME",
      payload: newTheme,
    });
  };

  return (
    <header className="items-center justify-between hidden px-4 py-3 bg-white border-b border-gray-200 shadow-sm md:flex dark:bg-gray-900 dark:border-gray-700">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        OrderNow
      </h1>

      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 md:hidden dark:text-gray-300"
          >
            {/* icône hamburger */}
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="text-gray-600 dark:text-gray-300 hover:text-primary-600"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button
          className="text-gray-600 dark:text-gray-300 hover:text-primary-600"
          onClick={() => dispatch({ type: "SET_VIEW", payload: "settings" })}
        >
          <Settings onClick={onMenuClick} className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
