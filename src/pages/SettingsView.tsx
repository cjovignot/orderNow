import React from "react";
import {
  Download,
  Upload,
  Trash2,
  Palette,
  Globe,
  Bell,
  Globe2,
} from "lucide-react";
import clsx from "clsx";
import { useApp } from "../hooks/useApp";
import { storage } from "../utils/storage";
import type { UserPreferences } from "../types";

export function SettingsView() {
  const { state, dispatch } = useApp();
  const { preferences } = state;

  // Exporter les données
  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-now-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importer les données
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = storage.importData(content);
      if (success) {
        window.location.reload();
      } else {
        alert("Erreur lors de l'importation des données");
      }
    };
    reader.readAsText(file);
  };

  // Supprimer toutes les données
  const handleClearData = () => {
    if (
      confirm(
        "Êtes-vous sûre de vouloir supprimer toutes vos données ? Cette action est irréversible."
      )
    ) {
      storage.clearAll();
      window.location.reload();
    }
  };

  // Mettre à jour les préférences
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    dispatch({ type: "SET_PREFERENCES", payload: newPrefs });
    storage.setPreferences(newPrefs);
  };

  return (
    <div className="p-4 mx-auto">
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        {/* Header */}
        <div className="h-24 flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Paramètres
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Thème */}
          <div>
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Apparence
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updatePreferences({ theme: t })}
                  className={clsx(
                    "py-2 px-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium",
                    preferences.theme === t
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {t === "light"
                    ? "Clair"
                    : t === "dark"
                    ? "Sombre"
                    : "Système"}
                </button>
              ))}
            </div>
          </div>

          {/* Langue */}
          <div>
            <div className="flex items-center mb-4">
              <Globe2 className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Langue
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["fr", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => updatePreferences({ language: lang })}
                  className={clsx(
                    "py-2 px-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium",
                    preferences.language === lang
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {lang === "fr" ? "Français" : "English"}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Activer les notifications
              </span>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) =>
                  updatePreferences({ notifications: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Gestion des données */}
          <div>
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Données
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="flex items-center justify-center w-full px-4 py-3 text-gray-700 transition-colors border border-gray-200 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter mes données
              </button>

              <label className="flex items-center justify-center w-full px-4 py-3 text-gray-700 transition-colors border border-gray-200 rounded-lg cursor-pointer dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                <Upload className="w-5 h-5 mr-2" />
                Importer des données
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearData}
                className="flex items-center justify-center w-full px-4 py-3 text-red-600 transition-colors border border-red-200 rounded-lg dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer toutes les données
              </button>
              <span className="flex justify-center pt-10 text-xs">
                Version Alpha 1.0.3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
