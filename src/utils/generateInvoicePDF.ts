import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from '../types';
import { loadImage } from './imageUtils';

let logoBase64: string | null = null;

// Function to initialize the logo
const initializeLogo = async () => {
  if (!logoBase64) {
    try {
      logoBase64 = await loadImage('/UeB.jpg');
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  }
};

export const generateInvoicePDF = async ({ lineItems, cgst, sgst, billTo, shipTo, invoiceDetails }: InvoiceData) => {
  // Initialize logo if not already loaded
  await initializeLogo();
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add TAX INVOICE title centered at the top
  doc.setFontSize(20);
  doc.text('TAX INVOICE', 105, 15, { align: 'center' });
  
  // Add logo if available (left side)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 10, 25, 100, 20); // Adjusted position and size
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add company details (right side)
  doc.setFontSize(10);
  doc.text('URBANLOGIX GLOBAL INDIA PRIVATE LIMITED', 105, 25);
  doc.setFontSize(9);
  doc.text('Company ID: U49120KA2024PTC194106', 105, 30);
  doc.text('NO.95, 6TH CROSS, CHOLANAYAKANAHALLI, HEBBAL', 105, 35);
  doc.text('R.T NAGAR POST', 105, 40);
  doc.text('BENGALURU, Karnataka 560032', 105, 45);
  doc.text('India', 105, 50);
  doc.text('GSTIN: 29AADCU6793Q1Z6', 105, 55);
  doc.text('Phone: +91 9916833222', 105, 60);
  doc.text('Email: varaprasadr@urbanebolt.com', 105, 65);
  doc.text('Web: www.urbanebolt.com', 105, 70);
  
  // Add invoice details (below company details)
  doc.text(`Invoice No: ${invoiceDetails.invoiceNumber}`, 15, 75);
  doc.text(`Invoice Date: ${new Date(invoiceDetails.invoiceDate).toLocaleDateString()}`, 15, 80);
  doc.text(`Due Date: ${new Date(invoiceDetails.dueDate).toLocaleDateString()}`, 15, 85);

  // Add billing and shipping information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 15, 95);
  doc.text('Ship To:', 105, 95);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Billing Address
  let yPos = 100;
  doc.text(billTo.businessName, 15, yPos);
  yPos += 5;
  doc.text(billTo.addressLine1, 15, yPos);
  if (billTo.addressLine2) {
    yPos += 5;
    doc.text(billTo.addressLine2, 15, yPos);
  }
  yPos += 5;
  doc.text(`${billTo.city}, ${billTo.state} ${billTo.pincode}`, 15, yPos);
  if (billTo.gstin) {
    yPos += 5;
    doc.text(`GSTIN: ${billTo.gstin}`, 15, yPos);
  }

  // Shipping Address
  yPos = 100;
  doc.text(shipTo.businessName, 105, yPos);
  yPos += 5;
  doc.text(shipTo.addressLine1, 105, yPos);
  if (shipTo.addressLine2) {
    yPos += 5;
    doc.text(shipTo.addressLine2, 105, yPos);
  }
  yPos += 5;
  doc.text(`${shipTo.city}, ${shipTo.state} ${shipTo.pincode}`, 105, yPos);
  if (shipTo.gstin) {
    yPos += 5;
    doc.text(`GSTIN: ${shipTo.gstin}`, 105, yPos);
  }

  // Calculate maximum Y position after addresses
  const maxYPos = yPos + 10;
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const cgstAmount = (subtotal * cgst) / 100;
  const sgstAmount = (subtotal * sgst) / 100;
  const grandTotal = subtotal + cgstAmount + sgstAmount;

  // Format numbers with proper spacing
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  // Add table with line items
  autoTable(doc, {
    startY: maxYPos,
    head: [[
      { content: 'Date', styles: { halign: 'left' } },
      { content: 'AWB No.', styles: { halign: 'left' } },
      { content: 'Origin', styles: { halign: 'left' } },
      { content: 'Destination', styles: { halign: 'left' } },
      { content: 'Act. Weight', styles: { halign: 'right' } },
      { content: 'Vol. Weight', styles: { halign: 'right' } },
      { content: 'Other Charges', styles: { halign: 'right' } },
      { content: 'Amount', styles: { halign: 'right' } }
    ]],
    body: lineItems.map(item => [
      { content: item.shippedDate, styles: { halign: 'left' } },
      { content: item.awbNumber, styles: { halign: 'left' } },
      { content: item.origin, styles: { halign: 'left' } },
      { content: item.destination, styles: { halign: 'left' } },
      { content: formatNumber(item.actWeight), styles: { halign: 'right' } },
      { content: formatNumber(item.volWeight), styles: { halign: 'right' } },
      { content: formatNumber(item.otherCharges), styles: { halign: 'right' } },
      { content: formatNumber(item.total), styles: { halign: 'right' } }
    ]),
    foot: [
      [
        { content: 'Subtotal:', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(subtotal), styles: { halign: 'right', fontStyle: 'bold' } }
      ],
      [
        { content: `CGST (${cgst.toFixed(3)}%):`, colSpan: 7, styles: { halign: 'right' } },
        { content: formatNumber(cgstAmount), styles: { halign: 'right' } }
      ],
      [
        { content: `SGST (${sgst.toFixed(3)}%):`, colSpan: 7, styles: { halign: 'right' } },
        { content: formatNumber(sgstAmount), styles: { halign: 'right' } }
      ],
      [
        { content: 'Grand Total:', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(grandTotal), styles: { halign: 'right', fontStyle: 'bold' } }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [229, 233, 236],
      textColor: [1, 48, 70],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
    },
    bodyStyles: {
      fontSize: 8,
      lineColor: [80, 80, 80],
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
    },
    footStyles: {
      fontSize: 8,
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
      7: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
    tableWidth: 'auto',
  });
  
  // Add terms and conditions
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(9);
  doc.text('Terms & Conditions:', 15, finalY + 20);
  doc.setFontSize(8);
  
  // Terms and conditions text
  const terms = [
    '1. Any errors in the invoice has to be reported in writing within 3 days from the date of receipt of the invoice.',
    '2. Interest @24% per annum will be charged on bills after due date.',
    '3. Bank details for payment through NEFT or RTGS are as mentioned below:',
    '   Beneficiary Name : URBANLOGIX GLOBAL INDIA PRIVATE LIMITED',
    '   Bank Name : YES BANK LTD',
    '   Account Number : 047663200000495',
    '   IFSC Code : YESB0000476',
    '4. This is a computer generated document which do not require signature'
  ];

  // Calculate line height based on page width and text length
  terms.forEach((term, index) => {
    const yPos = finalY + 30 + (index * (term.length > 80 ? 8 : 5));
    doc.text(term, 15, yPos);
  });
  
  // Add footer
  doc.setFontSize(8);
  doc.text('Powered by: urbanebolt', 105, 280, { align: 'center' });
  
  // Save the PDF
  doc.save(`Invoice-${invoiceDetails.invoiceNumber}.pdf`);
}; 