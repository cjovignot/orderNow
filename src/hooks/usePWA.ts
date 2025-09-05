import { useState, useEffect } from "react";

type BeforeInstallPromptEvent = Event & {
  platforms?: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

interface NavigatorStandalone extends Navigator {
  standalone?: boolean; // Safari iOS
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [supportsPrompt, setSupportsPrompt] = useState<boolean>(
    () => "onbeforeinstallprompt" in window
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      (navigator as NavigatorStandalone).standalone === true
    );
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setSupportsPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // 👇 typage propre pour MediaQueryListListener
    const handleDisplayModeChange = (ev: MediaQueryListEvent) => {
      const isNowStandalone =
        ev.matches || (navigator as NavigatorStandalone).standalone === true;
      setIsInstalled(isNowStandalone);
    };

    const mq = window.matchMedia?.("(display-mode: standalone)");
    if (mq) {
      mq.addEventListener("change", handleDisplayModeChange);
    }

    if ("onbeforeinstallprompt" in window) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      setSupportsPrompt(true);
    } else {
      setSupportsPrompt(false);
    }

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      if (mq) {
        mq.removeEventListener("change", handleDisplayModeChange);
      }
      if ("onbeforeinstallprompt" in window) {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      }
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error("Installation failed:", err);
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isSupported: supportsPrompt,
    isInstalled,
    installApp,
  };
}
