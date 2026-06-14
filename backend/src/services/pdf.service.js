"use strict";

const PDFDocument = require('pdfkit');

/**
 * Generate a PDF buffer for an invoice
 * @param {object} payload - Invoice data
 * @returns {Promise<Buffer>}
 */
exports.generateInvoicePdf = (payload) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const {
        clientName,
        companyName,
        invoiceNumber,
        invoiceDate,
        dueDate,
        amount,
        gstPercent = 18,
        gstAmount,
        discount = 0,
        totalAmount,
        lineItems = [],
        notes,
        status,
        senderName = 'Graphura CRM',
        senderEmail,
        senderPhone,
        senderAddress,
      } = payload;

      const fmtDate = (d) =>
        d
          ? new Date(d).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—';
      const fmtAmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
      const subtotal = (amount || 0) - (gstAmount || 0);

      // --- HEADER ---
      // Draw a dark header box
      doc.rect(40, 40, 515, 80).fill('#1e293b');

      // Add Company Name on the left
      doc.fillColor('#ffffff')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(senderName, 55, 52, { width: 250 });

      // Add Company Contact info below it
      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica')
         .text(senderAddress || '', 55, 72, { width: 250 })
         .text(senderEmail ? `Email: ${senderEmail}` : '', 55, 84, { width: 250 })
         .text(senderPhone ? `Phone: ${senderPhone}` : '', 55, 96, { width: 250 });

      // Add TAX INVOICE on the right
      doc.fillColor('#ffffff')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('TAX INVOICE', 350, 52, { width: 190, align: 'right' });

      // Add Invoice Details below it
      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica')
         .text(`Invoice #: ${invoiceNumber}`, 350, 72, { width: 190, align: 'right' })
         .text(`Date: ${fmtDate(invoiceDate)}`, 350, 84, { width: 190, align: 'right' })
         .text(`Status: ${status || 'SENT'}`, 350, 96, { width: 190, align: 'right' });

      // --- BILL TO ---
      let y = 140;
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('BILL TO', 40, y);

      y += 15;
      // Draw background box for client info
      doc.rect(40, y, 515, 60).fillColor('#f8fafc').strokeColor('#e2e8f0').fillAndStroke();

      doc.fillColor('#1e293b')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(clientName || 'Client', 55, y + 10);

      doc.fillColor('#475569')
         .fontSize(9)
         .font('Helvetica')
         .text(companyName || '', 55, y + 25)
         .text(payload.email || '', 55, y + 37);

      // --- SERVICES / ITEMS TABLE ---
      y += 90;
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('SERVICES / ITEMS', 40, y);

      y += 15;
      // Draw Table Header
      doc.rect(40, y, 515, 20).fill('#1e293b');
      doc.fillColor('#ffffff')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Description', 50, y + 6, { width: 220 })
         .text('Qty', 280, y + 6, { width: 50, align: 'center' })
         .text('Rate', 340, y + 6, { width: 90, align: 'right' })
         .text('Amount', 440, y + 6, { width: 105, align: 'right' });

      y += 20;

      // Draw rows
      const items = lineItems.length > 0 ? lineItems : [{ name: 'Professional Services', qty: 1, price: amount, amount }];
      items.forEach((item, idx) => {
        // Zebra striping
        if (idx % 2 === 0) {
          doc.rect(40, y, 515, 20).fill('#f8fafc');
        } else {
          doc.rect(40, y, 515, 20).fill('#ffffff');
        }

        doc.fillColor('#1e293b')
           .fontSize(9)
           .font('Helvetica')
           .text(item.name || 'Service', 50, y + 6, { width: 220, lineBreak: false })
           .text(String(item.qty || 1), 280, y + 6, { width: 50, align: 'center' })
           .text(fmtAmt(item.price), 340, y + 6, { width: 90, align: 'right' })
           .text(fmtAmt(item.amount), 440, y + 6, { width: 105, align: 'right' });

        y += 20;
      });

      // --- TOTALS ---
      y += 10;
      const drawTotalRow = (label, val, isBold = false) => {
        doc.fillColor(isBold ? '#1e293b' : '#475569')
           .fontSize(isBold ? 11 : 9)
           .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
           .text(label, 300, y, { width: 120, align: 'right' })
           .text(val, 430, y, { width: 115, align: 'right' });
        y += 18;
      };

      drawTotalRow('Subtotal', fmtAmt(subtotal));
      drawTotalRow(`GST (${gstPercent}%)`, fmtAmt(gstAmount));
      if (discount > 0) {
        drawTotalRow('Discount', `- ${fmtAmt(discount)}`);
      }

      // Draw line before grand total
      doc.moveTo(350, y).lineTo(555, y).strokeColor('#1e293b').lineWidth(1).stroke();
      y += 5;

      drawTotalRow('Grand Total', fmtAmt(totalAmount), true);

      // --- NOTES / TERMS ---
      y += 10;
      if (notes) {
        doc.fillColor('#0369a1')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Notes:', 40, y);
        doc.font('Helvetica')
           .text(notes, 40, y + 12, { width: 240 });
        y += 45;
      }

      doc.fillColor('#475569')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Terms & Conditions:', 40, y);
      doc.font('Helvetica')
         .fontSize(8)
         .text('Payment due within 15 days of invoice date.', 40, y + 12, { width: 240 });

      // --- FOOTER ---
      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica')
         .text(`Thank you for your business! - ${senderName}`, 40, 740, { width: 515, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
