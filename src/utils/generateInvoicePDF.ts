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

export const generateInvoicePDF = async ({ lineItems, fuelSurcharge, cgst, sgst, billTo, invoiceDetails }: InvoiceData) => {
  // Initialize logo if not already loaded
  await initializeLogo();
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Modern color scheme
  type RGBColor = [number, number, number];
  const colors: Record<string, RGBColor> = {
    primary: [41, 71, 98],    // Dark blue
    secondary: [79, 89, 98],  // Gray
    accent: [236, 240, 241],  // Light gray
    text: [44, 62, 80],       // Dark gray
    textLight: [127, 140, 141] // Medium gray
  };

  // Function to add footer to current page
  const addFooter = (pageNumber?: number) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text('Powered by: urbanebolt', 105, pageHeight - 10, { align: 'center' });
    if (pageNumber) {
      doc.text(`Page ${pageNumber}`, 195, pageHeight - 10, { align: 'right' });
    }
  };

  // Add footer to first page
  doc.setPage(1);
  addFooter(1);

  // Subscribe to page added event to add footer to new pages
  let currentPage = 1;
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = (...args) => {
    originalAddPage(...args);
    currentPage++;
    addFooter(currentPage);
    return doc;
  };

  // Add TAX INVOICE title centered at the top with modern styling
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('TAX INVOICE', 105, 20, { align: 'center' });
  
  // Add logo if available (left side)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 15, 35, 80, 16); // Adjusted size for better proportion
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add company details (right side) with modern styling
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  const companyDetails = [
    'URBANLOGIX GLOBAL INDIA PRIVATE LIMITED',
    'Company ID: U49120KA2024PTC194106',
    'NO.95, 6TH CROSS, CHOLANAYAKANAHALLI, HEBBAL',
    'R.T NAGAR POST',
    'BENGALURU, Karnataka 560032',
    'India',
    'GSTIN: 29AADCU6793Q1Z6',
    'Phone: +91 9916833222',
    'Email: varaprasadr@urbanebolt.com',
    'Web: www.urbanebolt.com'
  ];

  companyDetails.forEach((line, index) => {
    doc.text(line, 105, 40 + (index * 5));
  });
  
  // Add invoice details with modern styling
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('Invoice Details', 15, 85);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(`Invoice No: ${invoiceDetails.invoiceNumber}`, 15, 92);
  doc.text(`Invoice Date: ${invoiceDetails.invoiceDate}`, 15, 97);
  doc.text(`Due Date: ${invoiceDetails.dueDate}`, 15, 102);

  // Add billing address with modern styling
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('Bill To', 15, 115);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(billTo.businessName, 15, 122);
  doc.text(billTo.addressLine1, 15, 127);
  if (billTo.addressLine2) {
    doc.text(billTo.addressLine2, 15, 132);
  }
  const hasAddressLine2 = billTo.addressLine2 ? 5 : 0;
  doc.text(`${billTo.city}, ${billTo.state} ${billTo.pincode}`, 15, 127 + hasAddressLine2 + 5);
  if (billTo.gstin) {
    doc.text(`GSTIN: ${billTo.gstin}`, 15, 132 + hasAddressLine2 + 5);
  }

  // Get the maximum Y position after all the header content
  const maxYPos = (billTo.gstin ? 147 : 142) + hasAddressLine2 + 5;
  
  // Format numbers with proper spacing
  const formatNumber = (num: number | string) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(value)) return '0.00';
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total), 0);
  const fuelSurchargeAmount = (subtotal * Number(fuelSurcharge)) / 100;
  const cgstAmount = (subtotal * Number(cgst)) / 100;
  const sgstAmount = (subtotal * Number(sgst)) / 100;
  const grandTotal = subtotal + fuelSurchargeAmount + cgstAmount + sgstAmount;

  // Add table with line items - modern styling
  autoTable(doc, {
    startY: maxYPos,
    head: [[
      { content: 'Date', styles: { halign: 'left' } },
      { content: 'AWB No.', styles: { halign: 'left' } },
      { content: 'Origin', styles: { halign: 'left' } },
      { content: 'Destination', styles: { halign: 'left' } },
      { content: 'Type', styles: { halign: 'left' } },
      { content: 'Act. Weight', styles: { halign: 'right' } },
      { content: 'Vol. Weight', styles: { halign: 'right' } },
      { content: 'Freight', styles: { halign: 'right' } },
      { content: 'Other', styles: { halign: 'right' } },
      { content: 'Amount', styles: { halign: 'right' } }
    ]],
    body: lineItems.map(item => [
      { content: item.shippedDate, styles: { halign: 'left' } },
      { content: item.awbNumber, styles: { halign: 'left' } },
      { content: item.origin, styles: { halign: 'left' } },
      { content: item.destination, styles: { halign: 'left' } },
      { content: item.shipmentType, styles: { halign: 'left' } },
      { content: formatNumber(item.actWeight), styles: { halign: 'right' } },
      { content: formatNumber(item.volWeight), styles: { halign: 'right' } },
      { content: formatNumber(item.freightCharges), styles: { halign: 'right' } },
      { content: formatNumber(item.otherCharges), styles: { halign: 'right' } },
      { content: formatNumber(item.total), styles: { halign: 'right' } }
    ]),
    foot: [
      [
        { content: 'Subtotal:', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(subtotal), styles: { halign: 'right', fontStyle: 'bold' } }
      ],
      [
        { content: `Fuel Surcharge (${fuelSurcharge.toFixed(3)}%):`, colSpan: 9, styles: { halign: 'right' } },
        { content: formatNumber(fuelSurchargeAmount), styles: { halign: 'right' } }
      ],
      [
        { content: `CGST (${cgst.toFixed(3)}%):`, colSpan: 9, styles: { halign: 'right' } },
        { content: formatNumber(cgstAmount), styles: { halign: 'right' } }
      ],
      [
        { content: `SGST (${sgst.toFixed(3)}%):`, colSpan: 9, styles: { halign: 'right' } },
        { content: formatNumber(sgstAmount), styles: { halign: 'right' } }
      ],
      [
        { content: 'Grand Total:', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(grandTotal), styles: { halign: 'right', fontStyle: 'bold' } }
      ]
    ],
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      textColor: colors.text as [number, number, number],
      lineColor: colors.accent as [number, number, number],
    },
    headStyles: {
      fillColor: colors.accent as [number, number, number],
      textColor: colors.primary as [number, number, number],
      fontSize: 7.5,
      fontStyle: 'bold',
      lineWidth: 0,
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
    },
    bodyStyles: {
      fontSize: 7.5,
      lineColor: colors.accent as [number, number, number],
      lineWidth: 0.1,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
    },
    footStyles: {
      fontSize: 7.5,
      fillColor: colors.accent as [number, number, number],
      textColor: colors.text as [number, number, number],
      lineWidth: 0,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
    },
    columnStyles: {
      0: { cellWidth: 18 },  // Date
      1: { cellWidth: 22 },  // AWB
      2: { cellWidth: 15 },  // Origin
      3: { cellWidth: 15 },  // Destination
      4: { cellWidth: 15 },  // Type
      5: { cellWidth: 15, halign: 'right' },  // Act Weight
      6: { cellWidth: 15, halign: 'right' },  // Vol Weight
      7: { cellWidth: 15, halign: 'right' },  // Freight
      8: { cellWidth: 15, halign: 'right' },  // Other
      9: { cellWidth: 22, halign: 'right' },  // Amount
    },
    margin: { left: 15, right: 15, top: 10, bottom: 15 },
    tableWidth: 'auto',
  });
  
  // Add terms and conditions with modern styling
  const finalY = (doc as any).lastAutoTable.finalY + 10;  // Reduced spacing after table
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('Terms & Conditions', 15, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  
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

  let lastYPos = finalY + 8;  // Reduced spacing before terms
  const pageHeight = doc.internal.pageSize.height;
  const footerSpace = 20; // Space reserved for footer

  // Calculate line height based on page width and text length
  terms.forEach((term, index) => {
    const lineHeight = term.length > 80 ? 6 : 4;  // Reduced line height
    const yPos = lastYPos + (index * lineHeight);
    
    // Check if we're too close to the footer
    if (yPos > pageHeight - footerSpace) {
      doc.addPage();
      lastYPos = 20; // Reset Y position on new page
      doc.text(term, 15, lastYPos + (index * lineHeight));
    } else {
      doc.text(term, 15, yPos);
    }
  });
  
  // Save the PDF
  doc.save(`Invoice-${invoiceDetails.invoiceNumber}.pdf`);
}; 