import jsPDF from 'jspdf';

const generateInvoicePDF = (orderDetails) => {
    const { orderId, services, totalPrice, customerName, pickupTime, deliveryTime } = orderDetails;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Nahati Anytime Laundry', 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 20, 40);
    doc.text(`Customer Name: ${customerName}`, 20, 50);
    doc.text(`Pickup Time: ${pickupTime}`, 20, 60);
    doc.text(`Delivery Time: ${deliveryTime}`, 20, 70);
    
    doc.text('Services:', 20, 90);
    services.forEach((service, index) => {
        doc.text(`${index + 1}. ${service.name} - UGX ${service.price}`, 20, 100 + (index * 10));
    });

    doc.setFontSize(14);
    doc.text(`Total Price: UGX ${totalPrice}`, 20, 100 + (services.length * 10) + 20);

    doc.save(`invoice_${orderId}.pdf`);
};

export { generateInvoicePDF };