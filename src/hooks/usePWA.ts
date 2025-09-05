import { useState, useEffect } from "react";

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    if ("onbeforeinstallprompt" in window) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    } else {
      // Safari iOS ou navigateur sans support
      setIsSupported(false);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
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

  console.log(isSupported);
  return { isInstallable, isSupported, installApp };
}
