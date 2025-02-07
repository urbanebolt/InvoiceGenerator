import * as XLSX from 'xlsx';

export const generateSampleExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Sample data
  const sampleData = [
    {
      'Shipped Date*': '2024-02-07',
      'Awb Number*': '6551051',
      'Origin*': 'BLR',
      'Destination*': 'DEL',
      'Shipment Type*': 'Prepaid',
      'Act Weight*': 420.00,
      'Vol Weight*': 500.00,
      'Freight Charges': 0.00,
      'Other Charges': 0.00,
      'Total*': 1024.00
    },
    {
      'Shipped Date*': '2024-02-07',
      'Awb Number*': '6551052',
      'Origin*': 'DEL',
      'Destination*': 'BLR',
      'Shipment Type*': 'COD',
      'Act Weight*': 320.00,
      'Vol Weight*': 400.00,
      'Freight Charges': 0.00,
      'Other Charges': 50.00,
      'Total*': 950.00
    }
  ];

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  const colWidths = [
    { wch: 15 },  // Shipped Date
    { wch: 15 },  // Awb Number
    { wch: 10 },  // Origin
    { wch: 15 },  // Destination
    { wch: 15 },  // Shipment Type
    { wch: 12 },  // Act Weight
    { wch: 12 },  // Vol Weight
    { wch: 15 },  // Freight Charges
    { wch: 15 },  // Other Charges
    { wch: 12 }   // Total
  ];
  ws['!cols'] = colWidths;

  // Create styles object for the worksheet
  ws['!styles'] = {};

  // Define which columns are required (all except Other Charges and Freight Charges)
  const requiredColumns = {
    'Shipped Date*': true,
    'Awb Number*': true,
    'Origin*': true,
    'Destination*': true,
    'Shipment Type*': true,
    'Act Weight*': true,
    'Vol Weight*': true,
    'Freight Charges': false,
    'Other Charges': false,
    'Total*': true
  };

  // Get the range of the headers (first row)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:J1');

  // Apply styles to headers
  for (let C = range.s.c; C <= range.e.c; C++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[headerCell]) continue;
    
    // Check if this is a required field
    const isRequired = requiredColumns[ws[headerCell].v as keyof typeof requiredColumns];
    
    if (isRequired) {
      // Style for required fields
      ws[headerCell].s = {
        fill: {
          patternType: 'solid',
          bgColor: { indexed: 43 }, // Light yellow
          fgColor: { indexed: 43 }
        },
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    } else {
      // Style for optional fields
      ws[headerCell].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }

  // Style for data cells
  for (let R = 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell]) continue;
      ws[cell].s = {
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Line Items');

  // Save the file
  XLSX.writeFile(wb, 'sample_invoice_data.xlsx');
}; 