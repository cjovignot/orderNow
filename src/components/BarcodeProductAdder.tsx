import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { OrderProduct } from "../types";

interface BarcodeProductAdderProps {
  onAdd: (product: OrderProduct) => void;
}

export function BarcodeProductAdder({ onAdd }: BarcodeProductAdderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleDetected = (result: string) => {
    if (!result) return;

    const product: OrderProduct = {
      productId: result, // code-barres scanné
      quantity,
      price: 10, // valeur par défaut temporaire
    };

    onAdd(product);
    setIsScanning(false);
    setQuantity(1);
  };

  return (
    <div className="space-y-3">
      {isScanning ? (
        <div className="relative border rounded-lg overflow-hidden">
          <Scanner
            onDecode={(res: string) => handleDetected(res)}
            onError={(err: unknown) => console.error("Erreur scanner:", err)}
            constraints={{ facingMode: "environment" }}
            style={{ width: "100%" }}
          />
          <button
            onClick={() => setIsScanning(false)}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded"
          >
            Stop
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsScanning(true)}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Scanner un produit
        </button>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm">Quantité :</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-20 border rounded px-2 py-1"
        />
      </div>
    </div>
  );
}
