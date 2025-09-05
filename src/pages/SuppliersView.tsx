import React, { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useApp } from "../hooks/useApp";
import type { Supplier } from "../types";
import { storage } from "../utils/storage";
import { SupplierModal } from "../components/SupplierModal";

export const SuppliersView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = state.suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.siret.includes(searchTerm)
  );

  const handleSaveSupplier = (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    const supplier: Supplier = {
      ...supplierData,
      id: editingSupplier?.id || crypto.randomUUID(),
      createdAt: editingSupplier?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    let updatedSuppliers: Supplier[];
    if (editingSupplier) {
      updatedSuppliers = state.suppliers.map((s) =>
        s.id === supplier.id ? supplier : s
      );
      dispatch({ type: "UPDATE_SUPPLIER", payload: supplier });
    } else {
      updatedSuppliers = [...state.suppliers, supplier];
      dispatch({ type: "ADD_SUPPLIER", payload: supplier });
    }

    storage.setSuppliers(updatedSuppliers);

    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      const updatedSuppliers = state.suppliers.filter((s) => s.id !== id);
      storage.setSuppliers(updatedSuppliers);
      dispatch({ type: "DELETE_SUPPLIER", payload: id });
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 mx-auto">
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="space-y-6">
          {/* Header */}
          <div className="h-24 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Suppliers ({filteredSuppliers.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>

          <div className="relative mx-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          <div className="grid gap-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {supplier.name}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <strong>Address:</strong> {supplier.address}
                      </p>
                      <p>
                        <strong>Email:</strong> {supplier.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {supplier.phone}
                      </p>
                      <p>
                        <strong>SIRET:</strong> {supplier.siret}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No suppliers found matching your search."
                  : "No suppliers yet. Add one to get started!"}
              </div>
            )}
          </div>

          <SupplierModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingSupplier(null);
            }}
            onSave={handleSaveSupplier}
            supplier={editingSupplier}
          />
        </div>
      </div>
    </div>
  );
};
