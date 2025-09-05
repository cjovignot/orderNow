import React, { useState } from "react";
import { Plus, Search, ScanLine, Edit, Trash2 } from "lucide-react";
import { useApp } from "../hooks/useApp";
import type { Product } from "../types";
import { storage } from "../utils/storage";
import { ProductModal } from "../components/ProductModal";
import { BarcodeScanner } from "../components/BarcodeScanner";

export const ProductsView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = state.products.filter((product) => {
    const supplier = state.suppliers.find((s) => s.id === product.supplierId);
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSaveProduct = (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const product: Product = {
      ...productData,
      id: editingProduct?.id || crypto.randomUUID(),
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = state.products.map((p) =>
        p.id === product.id ? product : p
      );
      dispatch({ type: "UPDATE_PRODUCT", payload: product });
    } else {
      updatedProducts = [...state.products, product];
      dispatch({ type: "ADD_PRODUCT", payload: product });
    }

    storage.setProducts(updatedProducts);

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = state.products.filter((p) => p.id !== id);
      storage.setProducts(updatedProducts);
      dispatch({ type: "DELETE_PRODUCT", payload: id });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setIsScannerOpen(false);
    setEditingProduct({
      ...({} as Product),
      barcode,
      name: "",
      supplierId: "",
      quantity: 1,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 mx-auto">
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="space-y-6">
          {/* Header */}
          <div className="h-24 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Products ({filteredProducts.length})
            </h2>

            <div className="flex gap-2">
              <ScanLine
                size={25}
                onClick={() => setIsScannerOpen(true)}
                className="text-green-700 hover:text-green-700 transition-colors duration-200"
              />
              <Plus
                size={25}
                onClick={() => setIsModalOpen(true)}
                className="text-sky-800 hover:text-green-700 transition-colors duration-200"
              />
            </div>
          </div>
          <div className="relative mx-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          <div className="grid gap-4">
            {filteredProducts.map((product) => {
              const supplier = state.suppliers.find(
                (s) => s.id === product.supplierId
              );
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {product.name}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>
                          <strong>Barcode:</strong> {product.barcode}
                        </p>
                        <p>
                          <strong>Supplier:</strong>{" "}
                          {supplier?.name || "Unknown"}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {product.quantity}
                        </p>
                        {product.price && (
                          <p>
                            <strong>Price:</strong> €{product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No products found matching your search."
                  : "No products yet. Add one or scan a barcode to get started!"}
              </div>
            )}
          </div>

          <ProductModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
            product={editingProduct}
            suppliers={state.suppliers}
          />

          <BarcodeScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onScan={handleBarcodeScanned}
          />
        </div>
      </div>
    </div>
  );
};
