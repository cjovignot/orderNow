import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import type { Order, Supplier, Product } from "../types";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  suppliers: Supplier[];
  products: Product[];
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
  products,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    {
      productId: string;
      quantity: number;
      price: number;
    }[]
  >([]);

  const availableProducts = products.filter(
    (p) => p.supplierId === selectedSupplierId
  );

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product && !selectedProducts.find((sp) => sp.productId === productId)) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId,
          quantity: 1,
          price: product.price || 0,
        },
      ]);
    }
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts((prev) =>
        prev.filter((sp) => sp.productId !== productId)
      );
    } else {
      setSelectedProducts((prev) =>
        prev.map((sp) =>
          sp.productId === productId ? { ...sp, quantity } : sp
        )
      );
    }
  };

  const updateProductPrice = (productId: string, price: number) => {
    setSelectedProducts((prev) =>
      prev.map((sp) => (sp.productId === productId ? { ...sp, price } : sp))
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, sp) => total + sp.quantity * sp.price,
      0
    );
  };

  const handleSubmit = () => {
    if (!selectedSupplierId || selectedProducts.length === 0) {
      alert("Please select a supplier and at least one product");
      return;
    }

    onSave({
      supplierId: selectedSupplierId,
      products: selectedProducts,
      total: calculateTotal(),
      status: "draft",
    });

    // Reset form
    setSelectedSupplierId("");
    setSelectedProducts([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Order
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label
              htmlFor="supplier"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Supplier *
            </label>
            <select
              id="supplier"
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                setSelectedProducts([]);
              }}
              className="focus:ring w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Choose a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSupplierId && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Products
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product.id)}
                      disabled={selectedProducts.some(
                        (sp) => sp.productId === product.id
                      )}
                      className="w-full text-left p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.barcode}
                      </div>
                    </button>
                  ))}
                  {availableProducts.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No products available for this supplier
                    </p>
                  )}
                </div>
              </div>

              {selectedProducts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Items
                  </label>
                  <div className="space-y-3">
                    {selectedProducts.map((sp) => {
                      const product = products.find(
                        (p) => p.id === sp.productId
                      );
                      return (
                        <div
                          key={sp.productId}
                          className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                        >
                          <div className="font-medium mb-2">
                            {product?.name}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Quantity
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateProductQuantity(
                                      sp.productId,
                                      sp.quantity - 1
                                    )
                                  }
                                  className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-medium min-w-[2rem] text-center">
                                  {sp.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateProductQuantity(
                                      sp.productId,
                                      sp.quantity + 1
                                    )
                                  }
                                  className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Unit Price (€)
                              </label>
                              <input
                                type="number"
                                value={sp.price}
                                onChange={(e) =>
                                  updateProductPrice(
                                    sp.productId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white focus:ring dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              />
                            </div>
                          </div>
                          <div className="text-right text-sm font-medium mt-2">
                            Subtotal: €{(sp.quantity * sp.price).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-right text-lg font-bold mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    Total: €{calculateTotal().toFixed(2)}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedSupplierId || selectedProducts.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
