import { X, Share, Dot } from "lucide-react";

interface IosInstallGuideProps {
  onClose: () => void;
}

export function IosInstallGuide({ onClose }: IosInstallGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg mx-4 p-6 max-w-sm animate-fadeIn">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg text-center font-semibold mb-4 text-gray-800 dark:text-white">
          Ajouter à l’écran d’accueil
        </h2>

        <div className="flex flex-col text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Dot size={25} />
            <span>
              Appuyez sur le bouton <strong>Partager</strong>{" "}
              <Share size={17} />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dot size={25} />
            <span>
              Faites défiler et choisissez{" "}
              <strong>Sur l'écran d'accueil +</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dot size={25} />
            <span>
              Validez en appuyant sur <strong>Ajouter</strong>.
            </span>
          </div>
        </div>

        <div className="mt-4">
          <img
            src="/images/ios-install-step.png"
            alt="Tutoriel iOS"
            className="w-full rounded-md border"
          />
        </div>
      </div>
    </div>
  );
}
