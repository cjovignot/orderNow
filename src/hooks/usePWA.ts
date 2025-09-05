import { useState, useEffect } from "react";
import type { NavigatorStandalone } from "../types";

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Vérifie le mode d’affichage (standalone = lancé comme PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorStandalone).standalone
    ) {
      setIsInstalled(true);
    }

    if ("onbeforeinstallprompt" in window) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    } else {
      setIsSupported(false);
    }

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("App installed!");
      } else {
        console.log("User dismissed the installation.");
      }
    } catch (err) {
      console.error("Installation failed:", err);
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, isSupported, isInstalled, installApp };
}
