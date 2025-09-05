export const sendOrderEmail = async (
  order: any,
  supplier: any
): Promise<void> => {
  const subject = `Purchase Order #${order.id.slice(0, 8)}`;
  const body = `
Dear ${supplier.name},

Please find below our purchase order details:

Order #: ${order.id.slice(0, 8)}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Total: €${order.total.toFixed(2)}

Products:
${order.products
  .map(
    (op: any, index: number) =>
      `${index + 1}. Quantity: ${op.quantity} - Price: €${op.price.toFixed(2)}`
  )
  .join("\n")}

Please confirm receipt and expected delivery date.

Best regards,
Order Management Team
  `.trim();

  // Use mailto link to open default email client
  const mailtoLink = `mailto:${supplier.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
};
