// BarecodeProductAdder_V2.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
// import type { Result } from "@zxing/library";
import * as Dialog from "@radix-ui/react-dialog";

interface BarecodeProductAdderV2Props<
  T = { productId: string; quantity: number; price: number }
> {
  onAdd: (item: T) => void;
  onClose?: () => void;
  fullScreen?: boolean;
  keepOpenOnAdd?: boolean;
}

export function BarecodeProductAdder_V2<
  T = { productId: string; quantity: number; price: number }
>({
  onAdd,
  onClose,
  fullScreen = false,
  keepOpenOnAdd = true,
}: BarecodeProductAdderV2Props<T>) {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<InstanceType<
    typeof BrowserMultiFormatReader
  > | null>(null);
  const lastScannedRef = useRef<{ code: string; time: number } | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Stopper tout flux existant
    if (videoRef.current.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    // Type guard pour détecter un résultat ZXing valide
    function isZXingResult(obj: unknown): obj is { getText: () => string } {
      return (
        typeof obj === "object" &&
        obj !== null &&
        "getText" in obj &&
        typeof (obj as { getText?: unknown }).getText === "function"
      );
    }

    const timeout = setTimeout(() => {
      codeReader
        .decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result: unknown, err?: unknown) => {
            if (isZXingResult(result)) {
              const code = result.getText();
              const now = Date.now();

              if (
                lastScannedRef.current?.code === code &&
                now - (lastScannedRef.current?.time ?? 0) < 1000
              ) {
                return;
              }

              lastScannedRef.current = { code, time: now };

              if (!isDialogOpen) {
                setScannedCode(code);
                setQuantity(1);
                setIsDialogOpen(true);
              }
            }

            if (err) {
              console.warn(err);
            }
          }
        )
        .then(() => setCameraReady(true))
        .catch(console.error);
    }, 100);

    return () => {
      clearTimeout(timeout);
      // Arrêter le flux vidéo proprement
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isDialogOpen]);

  const handleValidate = () => {
    if (!scannedCode) return;
    const item = { productId: scannedCode, quantity, price: 0 } as unknown as T;
    onAdd(item);
    setIsDialogOpen(false);
    setScannedCode(null);
    if (!keepOpenOnAdd && onClose) onClose();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setScannedCode(null);
  };

  const cameraPlaceholder = (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
    </div>
  );

  const scannerContent = (
    <div className={`relative ${fullScreen ? "flex-1" : "w-full h-64"}`}>
      {!cameraReady && cameraPlaceholder}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          cameraReady ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Bouton fermer */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[11000] px-1 py-1 text-white bg-gray-600/40 rounded hover:bg-gray-700/40"
        >
          <X />
        </button>
      )}
      {/* Dialog quantité */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[12000]" />
          <Dialog.Content className="fixed z-[12001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded w-[90%] max-w-sm">
            <h3 className="mb-2 text-lg font-semibold">Quantité du produit</h3>
            <p className="mb-2">Code-barres scanné: {scannedCode}</p>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value || "1")))
              }
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-3 py-1 border rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleValidate}
                className="px-3 py-1 text-white bg-blue-600 rounded"
              >
                Valider
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );

  return fullScreen
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col">
          {scannerContent}
        </div>,
        document.body
      )
    : scannerContent;
}
