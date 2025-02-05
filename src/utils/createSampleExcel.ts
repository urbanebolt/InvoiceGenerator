import * as XLSX from 'xlsx';

const sampleData = [
  {
    'Shipped Date': '2024-02-01',
    'Awb Number': 'AWB123456789',
    'Origin': 'Mumbai',
    'Destination': 'Delhi',
    'Act Weight': 25.5,
    'Vol Weight': 22.3,
    'Other Charges': 500,
    'Total': 2500
  },
  {
    'Shipped Date': '2024-02-02',
    'Awb Number': 'AWB987654321',
    'Origin': 'Bangalore',
    'Destination': 'Chennai',
    'Act Weight': 18.7,
    'Vol Weight': 17.9,
    'Other Charges': 350,
    'Total': 1800
  },
  {
    'Shipped Date': '2024-02-03',
    'Awb Number': 'AWB456789123',
    'Origin': 'Hyderabad',
    'Destination': 'Kolkata',
    'Act Weight': 32.1,
    'Vol Weight': 30.5,
    'Other Charges': 750,
    'Total': 3200
  }
];

export const generateSampleExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert the data to a worksheet
  const ws = XLSX.utils.json_to_sheet(sampleData);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice Data');
  
  // Generate buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and download
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_invoice_data.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
}; 