import React, { useState } from "react";
import { Plus, Search, ScanLine, Edit, Trash2 } from "lucide-react";
import { useApp } from "../hooks/useApp";
import type { Product } from "../types";
import { storage } from "../utils/storage";
import { ProductModal } from "../components/ProductModal";
import { BarecodeProductAdder_V2 } from "../components/BarecodeProductAdder_V2";

export const ProductsView: React.FC = () => {
  const { state, dispatch } = useApp();

  // Recherche
  const [searchTerm, setSearchTerm] = useState("");

  // Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );

  // Scanner
  const [scannerOpen, setScannerOpen] = useState(false);

  // Filtrage des produits
  const filteredProducts = state.products.filter((product) => {
    const supplier = state.suppliers.find((s) => s.id === product.supplierId);
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Ajout nouveau produit
  const handleAddProduct = (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedProducts = [...state.products, newProduct];
    dispatch({ type: "ADD_PRODUCT", payload: newProduct });
    storage.setProducts(updatedProducts);
  };

  // Mise à jour produit existant
  const handleUpdateProduct = (updated: Product) => {
    const updatedProducts = state.products.map((p) =>
      p.id === updated.id ? updated : p
    );
    dispatch({ type: "UPDATE_PRODUCT", payload: updated });
    storage.setProducts(updatedProducts);
  };

  // Suppression produit
  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = state.products.filter((p) => p.id !== id);
      storage.setProducts(updatedProducts);
      dispatch({ type: "DELETE_PRODUCT", payload: id });
    }
  };

  // Edition produit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // Ajout produit depuis scanner
  const handleScannedProduct = (scanned: {
    productId: string;
    quantity: number;
    price: number;
  }) => {
    const existingProduct = state.products.find(
      (p) => p.id === scanned.productId
    );

    if (existingProduct) {
      // Mise à jour quantité seulement
      const updatedProduct = {
        ...existingProduct,
        quantity: existingProduct.quantity + scanned.quantity,
      };
      const updatedProducts = state.products.map((p) =>
        p.id === scanned.productId ? updatedProduct : p
      );
      dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct });
      storage.setProducts(updatedProducts);
    } else {
      // Nouveau produit → ouvrir le modal pour compléter le nom et le supplier
      setEditingProduct({
        id: scanned.productId,
        name: "",
        barcode: scanned.productId,
        supplierId: "",
        quantity: scanned.quantity,
        price: scanned.price,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setIsProductModalOpen(true);
    }

    setScannerOpen(false);
  };

  return (
    <div className="p-4 mx-auto">
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between h-24 p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Products ({filteredProducts.length})
            </h2>
            <div className="flex gap-2">
              {!scannerOpen && (
                <ScanLine
                  size={25}
                  onClick={() => setScannerOpen(true)}
                  className="text-green-700 transition-colors duration-200 hover:text-green-800"
                />
              )}
              <Plus
                size={25}
                onClick={() => {
                  setEditingProduct(undefined);
                  setIsProductModalOpen(true);
                }}
                className="transition-colors duration-200 text-sky-800 hover:text-green-700"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative mx-6">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Scanner */}
          {scannerOpen && (
            <div className="fixed inset-0 z-[9999]">
              <BarecodeProductAdder_V2
                mode="catalog"
                onAdd={handleScannedProduct}
                fullScreen
                onClose={() => setScannerOpen(false)}
                products={state.products}
                suppliers={state.suppliers}
              />
            </div>
          )}

          {/* Products list */}
          <div className="grid gap-4">
            {filteredProducts.map((product) => {
              const supplier = state.suppliers.find(
                (s) => s.id === product.supplierId
              );
              return (
                <div
                  key={product.id}
                  className="p-6 transition-shadow duration-200 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
                        className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No products found matching your search."
                  : "No products yet. Add one or scan a barcode to get started!"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(undefined);
        }}
        onSave={handleAddProduct}
        onUpdate={editingProduct ? handleUpdateProduct : undefined}
        product={editingProduct}
        suppliers={state.suppliers}
      />
    </div>
  );
};
