import { useState } from "react";
import { BarecodeProductAdder_V2 } from "./BarecodeProductAdder_V2";
import { ProductModal } from "./ProductModal";
import type { Supplier, Product } from "../types";

interface AddProductWithScannerProps {
  suppliers: Supplier[];
  onSave: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
}

export function AddProductWithScanner({
  suppliers,
  onSave,
}: AddProductWithScannerProps) {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quand un code-barres est scanné
  const handleAddScanned = (item: {
    id: string;
    name: string;
    supplierId: string;
    quantity: number;
    price: number;
    barcode: string;
  }) => {
    setBarcode(item.barcode); // On récupère le code-barres
    setIsModalOpen(true); // On ouvre le modal pour compléter
  };

  const handleSave = (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    onSave(productData);
    setIsModalOpen(false);
    setBarcode(null);
  };

  return (
    <>
      <BarecodeProductAdder_V2
        onAdd={handleAddScanned}
        keepOpenOnAdd={false}
        mode="catalog"
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          handleSave({ ...data, barcode: barcode! });
        }}
        suppliers={suppliers}
        product={undefined} // ✅ compatible
      />
    </>
  );
}
