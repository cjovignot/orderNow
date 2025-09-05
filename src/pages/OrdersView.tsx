import React, { useState } from "react";
import { Plus, Search, Download, Mail, Eye, Trash2, X } from "lucide-react";
import { useApp } from "../hooks/useApp";
import type { Order, Supplier, Product } from "../types";
import { storage } from "../utils/storage";
import { OrderModal } from "../components/OrderModal";
import { generateOrderPDF } from "../utils/pdf";
import { sendOrderEmail } from "../utils/email";

export const OrdersView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const filteredOrders = state.orders.filter((order) => {
    const supplier = state.suppliers.find((s) => s.id === order.supplierId);
    return (
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSaveOrder = (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    const order: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedOrders = [...state.orders, order];
    storage.setOrders(updatedOrders);
    dispatch({ type: "ADD_ORDER", payload: order });
    setIsModalOpen(false);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const updatedOrders = state.orders.filter((o) => o.id !== id);
      storage.setOrders(updatedOrders);
      dispatch({ type: "DELETE_ORDER", payload: id });
    }
  };

  const handleDownloadPDF = async (order: Order) => {
    try {
      const supplier = state.suppliers.find((s) => s.id === order.supplierId);
      if (!supplier) return;

      const products = order.products
        .map((op) => {
          const product = state.products.find((p) => p.id === op.productId);
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

      await generateOrderPDF(order, supplier, products);
    } catch {
      alert("Failed to generate PDF");
    }
  };

  const handleSendEmail = async (order: Order) => {
    try {
      const supplier = state.suppliers.find((s) => s.id === order.supplierId);
      if (!supplier) {
        alert("Supplier not found");
        return;
      }

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
          <div className="h-24 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Orders ({filteredOrders.length})
            </h2>

            <div className="flex gap-2 h-12">
              <Plus
                size={25}
                onClick={() => setIsModalOpen(true)}
                className="text-sky-800 m-auto hover:bg-green-700 text-white transition-colors duration-200"
              />
            </div>
          </div>

          <div className="relative mx-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const supplier = state.suppliers.find(
                (s) => s.id === order.supplierId
              );
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Order #{order.id.slice(0, 8)}
                        </h3>
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
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
                          onClick={() => setViewingOrder(order)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(order)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No orders found matching your search."
                  : "No orders yet. Create one to get started!"}
              </div>
            )}
          </div>

          <OrderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveOrder}
            suppliers={state.suppliers}
            products={state.products}
          />

          {viewingOrder && (
            <OrderViewModal
              order={viewingOrder}
              supplier={
                state.suppliers.find((s) => s.id === viewingOrder.supplierId)!
              }
              products={state.products}
              onClose={() => setViewingOrder(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const OrderViewModal: React.FC<{
  order: Order;
  supplier: Supplier;
  products: Product[];
  onClose: () => void;
}> = ({ order, supplier, products, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order #{order.id.slice(0, 8)}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Supplier
            </h4>
            <p className="text-gray-600 dark:text-gray-400">{supplier.name}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Products
            </h4>
            <div className="space-y-2">
              {order.products.map((op, index) => {
                const product = products.find((p) => p.id === op.productId);
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{product?.name || "Unknown Product"}</span>
                    <span>
                      Qty: {op.quantity} × €{op.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
