import { useState } from "react";
import { AppProvider } from "./contexts/AppProvider";
import { useApp } from "./hooks/useApp";
import { Header } from "./components/Layout/Header";
import { Navigation } from "./components/Layout/Navigation";
import { BottomNav } from "./components/Layout/BottomNav";
import { SettingsView } from "./pages/SettingsView";
import { SuppliersView } from "./pages/SuppliersView";
import { ProductsView } from "./pages/ProductsView";
import { OrdersView } from "./pages/OrdersView";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useTheme } from "./hooks/useTheme";
import { usePWA } from "./hooks/usePWA";
import { TriangleAlert } from "lucide-react";

function AppContent() {
  const { state } = useApp();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isInstallable, isSupported, installApp } = usePWA();

  // Active le thème clair/sombre
  useTheme();

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Sélectionne la vue à afficher
  const renderCurrentView = () => {
    switch (state.currentView) {
      case "suppliers":
        return <SuppliersView />;
      case "products":
        return <ProductsView />;
      case "orders":
        return <OrdersView />;
      case "settings":
        return <SettingsView />;
      default:
        return <SuppliersView />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      {/* Header avec bouton menu */}
      <Header onMenuClick={() => setIsNavOpen(true)} />

      <div className="flex">
        {/* Navigation latérale */}
        <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

        <main className="flex-1 transition-all duration-300 md:ml-0">
          {/* Bannière PWA si installable */}
          {!isSupported && (
            <div className="flex font-medium items-center bg-red-600/70 p-4 text-xs text-white">
              <TriangleAlert className="w-14 h-14 mr-2" />
              <p>
                Votre navigateur ne supporte pas l'installation automatique.
                <br />
                Ajoutez l'app à votre écran d'accueil via le menu du navigateur.
              </p>
            </div>
          )}

          {!isInstallable && (
            <div className="flex justify-center font-medium items-center bg-blue-600 p-4 text-sm text-white">
              <button onClick={installApp}>Installer l’application</button>
            </div>
          )}

          {/* Contenu dynamique */}
          <div className="pb-16 animate-fadeIn">{renderCurrentView()}</div>

          {/* Navigation mobile en bas */}
          <BottomNav />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
