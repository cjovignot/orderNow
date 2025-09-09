import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Order, Supplier, Product, OrderProduct } from "../types";
import { BarecodeProductAdder_V2 } from "./BarecodeProductAdder_V2";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  orders: Order[]; // ✅ toutes les commandes dispo
  orderToEdit?: Order;
  onSave: (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (order: Order) => void;
  readOnly?: boolean;
  addProductToOrder: (orderId: string, product: OrderProduct) => void; // ✅ nouvelle prop
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  orders,
  orderToEdit,
  onSave,
  onUpdate,
  readOnly = false,
  addProductToOrder,
}) => {
  const [supplierId, setSupplierId] = useState("");
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [status, setStatus] = useState<Order["status"]>("draft");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(""); // ✅ choix de la commande

  useEffect(() => {
    if (orderToEdit) {
      setSupplierId(orderToEdit.supplierId);
      setOrderProducts(orderToEdit.products.map((p) => ({ ...p })));
      setStatus(orderToEdit.status);
      setSelectedOrderId(orderToEdit.id); // si on ouvre un order existant
    } else {
      setSupplierId("");
      setOrderProducts([]);
      setStatus("draft");
      setSelectedOrderId("");
    }
  }, [orderToEdit]);

  if (!isOpen) return null;

  const total = orderProducts.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.price) || 0),
    0
  );

  const handleSave = () => {
    if (readOnly) return;
    if (!supplierId) return alert("Select a supplier");
    if (orderProducts.length === 0) return alert("Add at least one product");

    const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
      supplierId,
      products: orderProducts,
      total,
      status,
    };

    if (orderToEdit) {
      onUpdate({ ...orderToEdit, ...orderData, updatedAt: new Date() });
    } else {
      onSave(orderData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {orderToEdit
              ? status === "draft"
                ? "Edit Order"
                : "View Order"
              : "New Order"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Sélection de la commande */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Sélectionner une commande
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              disabled={readOnly}
            >
              <option value="">-- Choisir une commande --</option>
              {orders.map((o) => {
                const supplier = suppliers.find((s) => s.id === o.supplierId);
                return (
                  <option key={o.id} value={o.id}>
                    {supplier?.name || "Unknown supplier"} - {o.status} - Total:
                    €{o.total.toFixed(2)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Scanner */}
          {!readOnly && selectedOrderId && (
            <div>
              {!scannerOpen && (
                <button
                  onClick={() => setScannerOpen(true)}
                  className="px-3 py-1 text-white rounded bg-sky-500 hover:bg-sky-600"
                >
                  Scanner un produit
                </button>
              )}

              {scannerOpen && (
                <BarecodeProductAdder_V2
                  fullScreen
                  keepOpenOnAdd
                  mode="order"
                  onAdd={(scanned) => {
                    const catalogProduct = products.find(
                      (p) => p.barcode === scanned.barcode
                    );
                    const priceFromCatalog =
                      catalogProduct?.price ?? scanned.price;

                    addProductToOrder(selectedOrderId, {
                      productId: catalogProduct?.id ?? scanned.id,
                      quantity: scanned.quantity,
                      price: priceFromCatalog ?? 0,
                    });

                    setScannerOpen(false);
                  }}
                  onClose={() => setScannerOpen(false)}
                />
              )}
            </div>
          )}

          {/* Liste des produits de la commande sélectionnée */}
          {selectedOrderId && (
            <div>
              <h4 className="font-medium">Produits de la commande</h4>
              <ul className="space-y-2">
                {orders
                  .find((o) => o.id === selectedOrderId)
                  ?.products.map((op, idx) => {
                    const product = products.find((p) => p.id === op.productId);
                    return (
                      <li key={idx} className="flex justify-between">
                        <span>{product?.name ?? "Unknown"}</span>
                        <span>
                          {op.quantity} × €{op.price.toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {/* Save button */}
          {!readOnly && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                {orderToEdit ? "Update" : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
