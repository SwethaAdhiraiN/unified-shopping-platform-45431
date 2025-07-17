import Papa from "papaparse";
// We'll lazy-load jsPDF only where needed for bundle size reasons

/**
 * PUBLIC_INTERFACE
 * Parse a CSV string or file into array of product objects.
 * Expects header: name,price,stock,category,image
 */
export function parseInventoryCSV(csvString) {
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  if (!result.data) return [];
  // Coerce numbers
  return result.data
    .map((row, i) => ({
      name: row.name || "",
      price: +row.price || 0,
      stock: +row.stock || 0,
      category: (row.category || "").trim(),
      image: row.image || "",
    }))
    .filter((p) => p.name && p.category && !isNaN(p.price) && !isNaN(p.stock));
}

/**
 * PUBLIC_INTERFACE
 * Download a PDF invoice or receipt for a given order.
 * (Order: {id, customer, items, total, created, ...})
 */
export async function downloadOrderPDF(order, type = "invoice") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(type === "receipt" ? "Receipt" : "Invoice", 14, 18);
  doc.setFontSize(13);
  doc.text(`Order #: ${order.id || ""}`, 14, 30);
  doc.text(`Customer: ${order.customer || ""}`, 14, 38);
  doc.text(`Date: ${order.created || ""}`, 14, 46);
  doc.setFontSize(12);
  doc.text("Items:", 14, 56);
  let y = 62;
  (order.items || []).forEach((item) => {
    doc.text(
      `${item.qty}× ${item.name}  $${(item.price).toFixed(2)}`,
      20,
      y
    );
    y += 7;
  });
  y += 2;
  doc.setFontSize(13);
  doc.text(`Total: $${(order.total || 0).toFixed(2)}`, 14, y + 4);
  doc.save(`${type}_${order.id}.pdf`);
}
