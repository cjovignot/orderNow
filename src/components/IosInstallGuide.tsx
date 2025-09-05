import { X, Share, Dot, Plus } from "lucide-react";

interface IosInstallGuideProps {
  onClose: () => void;
}

export function IosInstallGuide({ onClose }: IosInstallGuideProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose} // clic sur overlay ferme le popup
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg mx-4 px-10 py-8"
        onClick={(e) => e.stopPropagation()} // empêcher la propagation du clic vers l’overlay
      >
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
          <div className="flex items-center ">
            <Dot size={25} />
            <span className="flex gap-1">
              Appuyez sur le bouton
              <strong>Partager</strong> <Share size={15} />
            </span>
          </div>
          <div className="flex items-center ">
            <Dot size={25} />
            <span className="flex gap-1">
              Sélectionnez <strong>Sur l'écran d'accueil</strong>{" "}
              <Plus size={15} />
            </span>
          </div>
          <div className="flex items-center ">
            <Dot size={25} />
            <span>
              Validez en appuyant sur <strong>Ajouter</strong>
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
