import { useEffect } from "react";
import { useApp } from "./useApp";

export function useTheme() {
  const { state } = useApp();
  const { preferences } = state;

  const applyTheme = (theme: string) => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", isDarkMode);
    }
  };

  useEffect(() => {
    applyTheme(preferences.theme);

    if (preferences.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [preferences.theme]);
}
