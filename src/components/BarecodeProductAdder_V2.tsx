// BarecodeProductAdder_V2.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import * as Dialog from "@radix-ui/react-dialog";
import type { Product, Supplier } from "../types";

interface BarecodeProductAdderV2Props {
  mode: "order" | "catalog";
  onAdd: (scanned: {
    id: string;
    name: string;
    supplierId: string;
    quantity: number;
    price: number;
    barcode: string;
  }) => void; // ✅ changement ici
  onClose?: () => void;
  fullScreen?: boolean;
  keepOpenOnAdd?: boolean;
  products?: Product[];
  suppliers?: Supplier[];
}

export function BarecodeProductAdder_V2({
  mode,
  onAdd,
  onClose,
  fullScreen = false,
  keepOpenOnAdd = true,
  products = [],
  suppliers = [],
}: BarecodeProductAdderV2Props) {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [productName, setProductName] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastScannedRef = useRef<{ code: string; time: number } | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (videoRef.current.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    const codeReader = new BrowserMultiFormatReader();

    const isZXingResult = (obj: unknown): obj is { getText: () => string } =>
      typeof obj === "object" &&
      obj !== null &&
      "getText" in obj &&
      typeof (obj as { getText: () => string }).getText === "function";

    codeReader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result: unknown, err?: unknown) => {
          if (isZXingResult(result)) {
            const code = result.getText();
            const now = Date.now();

            if (
              lastScannedRef.current?.code === code &&
              now - (lastScannedRef.current?.time ?? 0) < 1000
            )
              return;

            lastScannedRef.current = { code, time: now };
            if (!isDialogOpen) {
              setScannedCode(code);
              setQuantity(1);

              if (mode === "order") {
                const product = products.find((p) => p.barcode === code);
                setProductName(product?.name || "");
                setSupplierId(product?.supplierId || "");
                setPrice(product?.price);
              } else {
                setProductName("");
                setSupplierId("");
                setPrice(undefined);
              }

              setIsDialogOpen(true);
            }
          }

          if (err) console.warn(err);
        }
      )
      .then(() => setCameraReady(true))
      .catch(console.error);

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isDialogOpen, mode, products]);

  const handleValidate = () => {
    if (!scannedCode) return;

    if (!productName || !supplierId) return; // for catalog mode

    onAdd({
      id: scannedCode,
      name: productName,
      supplierId,
      quantity: quantity,
      price: price ?? 0,
      barcode: scannedCode,
    });

    setIsDialogOpen(false);
    setScannedCode(null);
    if (!keepOpenOnAdd && onClose) onClose();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setScannedCode(null);
  };

  return fullScreen
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col">
          {scannerDialog()}
        </div>,
        document.body
      )
    : scannerDialog();

  function scannerDialog() {
    return (
      <div className={`relative ${fullScreen ? "flex-1" : "w-full h-64"}`}>
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-12 h-12 border-t-2 border-b-2 border-white rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            cameraReady ? "opacity-100" : "opacity-0"
          }`}
        />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[11000] px-1 py-1 text-white bg-gray-600/40 rounded hover:bg-gray-700/40"
          >
            <X />
          </button>
        )}

        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[12000]" />
            <Dialog.Content className="fixed z-[12001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded w-[90%] max-w-sm">
              {mode === "order" ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold">
                    Quantité du produit
                  </h3>
                  <p className="mb-2">Produit : {productName}</p>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value || "1")))
                    }
                    className="w-full p-2 border rounded"
                  />
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-lg font-semibold">
                    Ajouter un produit au catalogue
                  </h3>
                  <p className="mb-2">Code-barres : {scannedCode}</p>
                  <input
                    type="text"
                    placeholder="Nom du produit *"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  >
                    <option value="">-- Sélectionner un fournisseur --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Prix (optionnel)"
                    value={price ?? ""}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full p-2 mb-2 border rounded"
                  />
                </>
              )}
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
  }
}
