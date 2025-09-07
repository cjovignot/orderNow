import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Order, Supplier, Product, OrderProduct } from "../types";
import { BarecodeProductAdder_V2 } from "./BarecodeProductAdder_V2";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  orderToEdit?: Order;
  onSave: (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (order: Order) => void;
  readOnly?: boolean;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  orderToEdit,
  onSave,
  onUpdate,
  readOnly = false,
}) => {
  const [supplierId, setSupplierId] = useState("");
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [status, setStatus] = useState<Order["status"]>("draft");
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (orderToEdit) {
      setSupplierId(orderToEdit.supplierId);
      setOrderProducts(orderToEdit.products.map((p) => ({ ...p })));
      setStatus(orderToEdit.status);
    } else {
      setSupplierId("");
      setOrderProducts([]);
      setStatus("draft");
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

  const updateProductAt = (idx: number, changes: Partial<OrderProduct>) => {
    const newProducts = [...orderProducts];
    newProducts[idx] = { ...newProducts[idx], ...changes };
    newProducts[idx].quantity = Number(newProducts[idx].quantity) || 0;
    newProducts[idx].price = Number(newProducts[idx].price) || 0;
    setOrderProducts(newProducts);
  };

  const removeProductAt = (idx: number) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== idx));
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
          {/* Supplier */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Supplier
            </label>
            <select
              className="w-full p-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={readOnly}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scanner */}
          {!readOnly && (
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
                  fullScreen={true}
                  keepOpenOnAdd={true}
                  mode="order"
                  onAdd={(scanned) => {
                    const catalogProduct = products.find(
                      (p) => p.id === scanned.id // ✅
                    );
                    const priceFromCatalog =
                      catalogProduct?.price ?? scanned.price;

                    const existingIndex = orderProducts.findIndex(
                      (p) => p.productId === scanned.id // ✅
                    );

                    if (existingIndex >= 0) {
                      const newProducts = [...orderProducts];
                      newProducts[existingIndex] = {
                        ...newProducts[existingIndex],
                        quantity:
                          newProducts[existingIndex].quantity +
                          scanned.quantity,
                        price:
                          priceFromCatalog ?? newProducts[existingIndex].price,
                      };
                      setOrderProducts(newProducts);
                    } else {
                      setOrderProducts([
                        ...orderProducts,
                        {
                          productId: scanned.id, // ✅
                          quantity: scanned.quantity,
                          price: priceFromCatalog ?? 0,
                        },
                      ]);
                    }
                    setScannerOpen(false);
                  }}
                  onClose={() => setScannerOpen(false)}
                />
              )}
            </div>
          )}

          {/* Products list */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Products
            </label>
            <div className="space-y-2">
              {orderProducts.map((op, idx) => {
                const product = products.find((p) => p.id === op.productId);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      className="flex-1 p-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={op.productId}
                      onChange={(e) =>
                        updateProductAt(idx, { productId: e.target.value })
                      }
                      disabled={readOnly}
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className="w-20 p-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={op.quantity}
                      onChange={(e) =>
                        updateProductAt(idx, {
                          quantity: parseInt(e.target.value || "0", 10),
                        })
                      }
                      disabled={readOnly}
                      min={1}
                    />

                    <input
                      type="number"
                      className="w-24 p-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={op.price}
                      onChange={(e) =>
                        updateProductAt(idx, {
                          price: parseFloat(e.target.value || "0"),
                        })
                      }
                      disabled={readOnly}
                      step={0.01}
                      min={0}
                    />

                    {!readOnly && (
                      <button
                        onClick={() => removeProductAt(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}

                    {readOnly && product && (
                      <span className="text-sm text-gray-500">
                        {product.name}
                      </span>
                    )}
                  </div>
                );
              })}

              {!readOnly && (
                <div className="mt-2">
                  <button
                    onClick={() =>
                      setOrderProducts([
                        ...orderProducts,
                        { productId: "", quantity: 1, price: 0 },
                      ])
                    }
                    className="px-3 py-1 mt-2 text-white rounded-lg bg-sky-500 hover:bg-sky-600"
                  >
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {/* Status badge */}
          {orderToEdit && status !== "draft" && (
            <div>
              <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">
                {status}
              </span>
            </div>
          )}

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
