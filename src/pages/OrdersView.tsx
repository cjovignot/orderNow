import React, { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Pencil,
  Mail,
  Eye,
  Trash2,
  ScanLine,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import type { Order, Product } from "../types";
import { storage } from "../utils/storage";
import { generateOrderPDF } from "../utils/pdf";
import { sendOrderEmail } from "../utils/email";
import { OrderModal } from "../components/OrderModal";
import { BarecodeProductAdder_V2 } from "../components/BarecodeProductAdder_V2";

export const OrdersView: React.FC = () => {
  const { state, dispatch } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOrderModal, setOrderModalModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("create");

  const [scannerOpen, setScannerOpen] = useState(false);

  const orders = state.orders || [];
  const suppliers = state.suppliers || [];
  const products = state.products || [];

  const filteredOrders = orders.filter((order) => {
    const supplier = suppliers.find((s) => s.id === order.supplierId);
    return (
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreate = () => {
    setCurrentOrder(null);
    setMode("create");
    setOrderModalModalOpen(true);
  };

  const handleView = (order: Order) => {
    setCurrentOrder(order);
    setMode("view");
    setOrderModalModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    if (order.status === "draft") {
      setCurrentOrder(order);
      setMode("edit");
      setOrderModalModalOpen(true);
    } else {
      alert("Only draft orders can be edited.");
    }
  };

  const handleSaveOrder = (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    const order: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedOrders = [...orders, order];
    storage.setOrders(updatedOrders);
    dispatch({ type: "ADD_ORDER", payload: order });
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const updatedOrders = orders.map((o) =>
      o.id === updatedOrder.id ? updatedOrder : o
    );
    storage.setOrders(updatedOrders);
    dispatch({ type: "UPDATE_ORDER", payload: updatedOrder });
    setCurrentOrder(updatedOrder);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const updatedOrders = orders.filter((o) => o.id !== id);
      storage.setOrders(updatedOrders);
      dispatch({ type: "DELETE_ORDER", payload: id });
    }
  };

  const handleDownloadPDF = async (order: Order) => {
    try {
      const supplier = suppliers.find((s) => s.id === order.supplierId);
      if (!supplier) return;

      const orderProducts = order.products
        .map((op) => {
          const product = products.find((p) => p.id === op.productId);
          if (!product) return null;
          return {
            ...product,
            orderQuantity: op.quantity,
            orderPrice: op.price,
          };
        })
        .filter(
          (p): p is Product & { orderQuantity: number; orderPrice: number } =>
            p !== null
        );

      await generateOrderPDF(order, supplier, orderProducts);
    } catch {
      alert("Failed to generate PDF");
    }
  };

  const handleSendEmail = async (order: Order) => {
    try {
      const supplier = suppliers.find((s) => s.id === order.supplierId);
      if (!supplier) return alert("Supplier not found");
      await sendOrderEmail(order, supplier);
      alert("Email sent successfully!");
    } catch {
      alert("Failed to send email");
    }
  };

  return (
    <div className="p-4 mx-auto">
      <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between h-24 p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Orders ({filteredOrders.length})
            </h2>
            <div className="flex h-12 gap-2">
              <Plus
                size={25}
                onClick={handleCreate}
                className="m-auto transition-colors duration-200 text-sky-800 hover:text-green-700"
              />
              {currentOrder && mode === "edit" && (
                <ScanLine
                  size={25}
                  onClick={() => setScannerOpen(true)}
                  className="m-auto text-green-700 transition-colors duration-200 hover:text-green-800"
                />
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mx-6">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Orders List */}
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const supplier = suppliers.find((s) => s.id === order.supplierId);
              return (
                <div
                  key={order.id}
                  className="p-6 transition-shadow duration-200 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-2">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-sky-900 dark:text-white">
                          #{order.id.slice(0, 8)}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <strong>Supplier:</strong>{" "}
                          {supplier?.name || "Unknown"}
                        </p>
                        <p>
                          <strong>Products:</strong> {order.products.length}
                        </p>
                        <p>
                          <strong>Total:</strong> €{order.total.toFixed(2)}
                        </p>
                        <p>
                          <strong>Created:</strong>{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(order)}
                          className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit Order"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-gray-600 transition-colors duration-200 rounded-lg dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === "draft"
                              ? "bg-gray-100 text-gray-800"
                              : order.status === "sent"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No orders found matching your search."
                  : "No orders yet. Create one to get started!"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scanner modal pour ajouter produit à la commande */}
      {scannerOpen && currentOrder && mode === "edit" && (
        <BarecodeProductAdder_V2
          mode="order"
          products={products}
          onAdd={(scanned) => {
            const updatedProducts = [...(currentOrder.products || [])];
            const existing = updatedProducts.find(
              (p) => p.productId === scanned.productId // ✅
            );

            if (existing) {
              existing.quantity += scanned.quantity ?? 1;
            } else {
              updatedProducts.push({
                productId: scanned.productId, // ✅
                quantity: scanned.quantity ?? 1,
                price: scanned.price ?? 0,
              });
            }

            const total = updatedProducts.reduce(
              (sum, p) => sum + (p.price ?? 0) * p.quantity,
              0
            );

            handleUpdateOrder({
              ...currentOrder,
              products: updatedProducts,
              total,
            });
          }}
          fullScreen
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Order modal */}
      <OrderModal
        isOpen={isOrderModal}
        onClose={() => {
          setOrderModalModalOpen(false);
          setCurrentOrder(null);
        }}
        suppliers={suppliers}
        products={products}
        orderToEdit={currentOrder || undefined}
        onSave={handleSaveOrder}
        onUpdate={handleUpdateOrder}
        readOnly={mode === "view"}
      />
    </div>
  );
};
