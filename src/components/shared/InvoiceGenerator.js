import React from 'react';
import jsPDF from 'jspdf';
import { CURRENCY_CONFIG } from '../../utils/constants';

const InvoiceGenerator = ({ order, onDownload }) => {
  const generateInvoice = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Using unified CURRENCY_CONFIG for all formatting

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('NAHATI ANYTIME LAUNDRY', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Your Anytime Laundry Service', pageWidth / 2, 38, { align: 'center' });
    doc.text('📞 +256 200 981 445 | 📧 info@nahati.com', pageWidth / 2, 46, { align: 'center' });

    // Invoice Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 20, 65);

    // Order Information
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Left side - Order details
    doc.text(`Invoice #: ${order.id || 'INV-' + Date.now()}`, 20, 80);
    doc.text(`Order #: ${order.orderNumber || order.id}`, 20, 88);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 96);
    doc.text(`Pickup Date: ${order.pickupDate || 'TBD'}`, 20, 104);
    doc.text(`Delivery Date: ${order.deliveryDate || 'TBD'}`, 20, 112);

    // Right side - Customer details
    doc.text('BILL TO:', 120, 80);
    doc.text(`${order.customerName || 'Customer'}`, 120, 88);
    doc.text(`${order.customerPhone || ''}`, 120, 96);
    doc.text(`${order.customerEmail || ''}`, 120, 104);
    doc.text(`${order.address || ''}`, 120, 112);

    // Services Table Header
    let yPosition = 135;
    doc.setFont(undefined, 'bold');
    doc.text('SERVICES', 20, yPosition);
    doc.text('QTY', 100, yPosition);
    doc.text('WEIGHT', 125, yPosition);
    doc.text('RATE', 150, yPosition);
    doc.text('AMOUNT', 175, yPosition);
    
    // Draw line under header
    doc.line(20, yPosition + 3, 190, yPosition + 3);
    
    yPosition += 15;
    doc.setFont(undefined, 'normal');

    // Services
    let total = 0;
    const services = order.services || [];
    
    services.forEach((service) => {
      const amount = (service.quantity || 1) * (service.price || 0);
      total += amount;
      
      doc.text(service.name || 'Laundry Service', 20, yPosition);
      doc.text((service.quantity || 1).toString(), 100, yPosition);
      doc.text(`${service.weight || order.weight || 0}kg`, 125, yPosition);
      doc.text(CURRENCY_CONFIG.formatPrice(service.price || 0), 150, yPosition);
      doc.text(CURRENCY_CONFIG.formatPrice(amount), 175, yPosition);
      
      yPosition += 10;
    });

    // If no specific services, show general laundry
    if (services.length === 0) {
      const amount = order.totalAmount || 0;
      doc.text('Laundry Service', 20, yPosition);
      doc.text('1', 100, yPosition);
      doc.text(`${order.weight || 0}kg`, 125, yPosition);
      doc.text(CURRENCY_CONFIG.formatPrice(amount), 150, yPosition);
      doc.text(CURRENCY_CONFIG.formatPrice(amount), 175, yPosition);
      total = amount;
      yPosition += 10;
    }

    // Totals
    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    doc.setFont(undefined, 'bold');
    doc.text('SUBTOTAL:', 150, yPosition);
    doc.text(CURRENCY_CONFIG.formatPrice(total), 175, yPosition);
    
    yPosition += 8;
    const tax = total * 0.18; // 18% VAT
    doc.text('VAT (18%):', 150, yPosition);
    doc.text(CURRENCY_CONFIG.formatPrice(tax), 175, yPosition);
    
    yPosition += 8;
    const grandTotal = total + tax;
    doc.setFontSize(12);
    doc.text('TOTAL:', 150, yPosition);
    doc.text(CURRENCY_CONFIG.formatPrice(grandTotal), 175, yPosition);

    // Payment Information
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT INFORMATION', 20, yPosition);
    
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.text('Payment Method: Cash on Delivery', 20, yPosition);
    yPosition += 6;
    doc.text('Status: Pending Payment', 20, yPosition);
    yPosition += 6;
    doc.text('Payment due upon delivery', 20, yPosition);

    // Order Status
    yPosition += 15;
    doc.setFont(undefined, 'bold');
    doc.text('ORDER STATUS', 20, yPosition);
    
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Current Status: ${order.status || 'Pending'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Last Updated: ${order.updatedAt?.toDate().toLocaleString() || new Date().toLocaleString()}`, 20, yPosition);

    // Footer
    const footerY = pageHeight - 30;
    doc.setFontSize(8);
    doc.text('Thank you for choosing Nahati Anytime Laundry!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('For support: +256 200 981 445 | WhatsApp available 24/7', pageWidth / 2, footerY + 8, { align: 'center' });

    // Save the PDF
    const fileName = `Nahati-Invoice-${order.orderNumber || order.id}.pdf`;
    doc.save(fileName);
    
    if (onDownload) {
      onDownload(fileName);
    }
  };

  return (
    <button
      onClick={generateInvoice}
      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Download Invoice</span>
    </button>
  );
};

export default InvoiceGenerator;
