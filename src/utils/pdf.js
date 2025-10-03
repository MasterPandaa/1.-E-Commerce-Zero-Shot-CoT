const PDFDocument = require('pdfkit');

async function generateInvoicePDF({ order, items, user }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Date: ${order.created_at}`);
    doc.text(`Customer: ${user.email}`);
    doc.moveDown();

    doc.text('Items:');
    items.forEach((it) => {
      doc.text(`- ${it.product_name} x ${it.quantity} @ ${it.price} = ${it.quantity * it.price}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ${order.total_amount}`, { align: 'right' });

    doc.end();
  });
}

module.exports = { generateInvoicePDF };
