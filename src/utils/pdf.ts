import jsPDF from "jspdf";

export const generateOrderPDF = async (
  order: any,
  supplier: any,
  products: any[]
): Promise<void> => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("Purchase Order", 20, 30);

  doc.setFontSize(12);
  doc.text(`Order #: ${order.id.slice(0, 8)}`, 20, 50);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 60);
  doc.text(`Status: ${order.status.toUpperCase()}`, 20, 70);

  // Supplier information
  doc.setFontSize(14);
  doc.text("Supplier Information:", 20, 90);
  doc.setFontSize(10);
  doc.text(`Name: ${supplier.name}`, 20, 105);
  doc.text(`Address: ${supplier.address}`, 20, 115);
  doc.text(`Email: ${supplier.email}`, 20, 125);
  doc.text(`Phone: ${supplier.phone}`, 20, 135);
  doc.text(`SIRET: ${supplier.siret}`, 20, 145);

  // Products table
  doc.setFontSize(14);
  doc.text("Order Items:", 20, 165);

  let yPos = 180;
  doc.setFontSize(10);

  // Table headers
  doc.text("Product Name", 20, yPos);
  doc.text("Barcode", 80, yPos);
  doc.text("Qty", 130, yPos);
  doc.text("Price", 150, yPos);
  doc.text("Total", 170, yPos);

  // Table line
  doc.line(20, yPos + 5, 190, yPos + 5);
  yPos += 15;

  // Products
  products.forEach((product: any) => {
    const orderProduct = order.products.find(
      (op: any) => op.productId === product.id
    );
    if (orderProduct && product) {
      doc.text(product.name.substring(0, 25), 20, yPos);
      doc.text(product.barcode, 80, yPos);
      doc.text(orderProduct.quantity.toString(), 130, yPos);
      doc.text(`€${orderProduct.price.toFixed(2)}`, 150, yPos);
      doc.text(
        `€${(orderProduct.quantity * orderProduct.price).toFixed(2)}`,
        170,
        yPos
      );
      yPos += 12;
    }
  });

  // Total
  doc.line(20, yPos + 5, 190, yPos + 5);
  yPos += 15;
  doc.setFontSize(12);
  doc.text(`TOTAL: €${order.total.toFixed(2)}`, 150, yPos);

  // Download
  doc.save(`order-${order.id.slice(0, 8)}.pdf`);
};
