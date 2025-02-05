import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { DocumentArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import { generateSampleExcel } from '../utils/createSampleExcel';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';
import { LineItem, Address, InvoiceDetails } from '../types';

const emptyAddress: Address = {
  businessName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
};

const AddressForm: React.FC<{
  title: string;
  address: Address;
  onChange: (address: Address) => void;
}> = ({ title, address, onChange }) => {
  const handleChange = (field: keyof Address) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...address, [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            value={address.businessName}
            onChange={handleChange('businessName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Enter business name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <input
            type="text"
            value={address.addressLine1}
            onChange={handleChange('addressLine1')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Enter street address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
          <input
            type="text"
            value={address.addressLine2}
            onChange={handleChange('addressLine2')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Enter apartment, suite, etc."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={address.city}
              onChange={handleChange('city')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              value={address.state}
              onChange={handleChange('state')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter state"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              value={address.pincode}
              onChange={handleChange('pincode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter pincode"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GSTIN (Optional)</label>
            <input
              type="text"
              value={address.gstin}
              onChange={handleChange('gstin')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter GSTIN"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceDetailsForm: React.FC<{
  details: InvoiceDetails;
  onChange: (details: InvoiceDetails) => void;
}> = ({ details, onChange }) => {
  const handleChange = (field: keyof InvoiceDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...details, [field]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
        <input
          type="text"
          value={details.invoiceNumber}
          onChange={handleChange('invoiceNumber')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="Enter invoice number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
        <input
          type="date"
          value={details.invoiceDate}
          onChange={handleChange('invoiceDate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          value={details.dueDate}
          onChange={handleChange('dueDate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
    </div>
  );
};

const InvoiceGenerator: React.FC = () => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [cgst, setCgst] = useState<number>(0);
  const [sgst, setSgst] = useState<number>(0);
  const [billTo, setBillTo] = useState<Address>(emptyAddress);
  const [shipTo, setShipTo] = useState<Address>(emptyAddress);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const processExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedItems = jsonData.map((item: any) => ({
        shippedDate: item['Shipped Date'] || '',
        awbNumber: item['Awb Number'] || '',
        origin: item['Origin'] || '',
        destination: item['Destination'] || '',
        actWeight: Number(item['Act Weight']) || 0,
        volWeight: Number(item['Vol Weight']) || 0,
        otherCharges: Number(item['Other Charges']) || 0,
        total: Number(item['Total']) || 0,
      }));

      setLineItems(processedItems);
      toast.success(`Successfully processed ${processedItems.length} line items`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Error processing Excel file. Please check the format.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          uploadedFile.type === 'application/vnd.ms-excel') {
        processExcelFile(uploadedFile);
      } else {
        toast.error('Please upload a valid Excel file');
      }
    }
  };

  const validateForm = () => {
    if (!invoiceDetails.invoiceNumber || !invoiceDetails.invoiceDate || !invoiceDetails.dueDate) {
      toast.error('Please fill in all invoice details');
      return false;
    }

    const requiredFields: (keyof Address)[] = ['businessName', 'addressLine1', 'city', 'state', 'pincode'];
    const isBillToValid = requiredFields.every(field => billTo[field]);
    const isShipToValid = requiredFields.every(field => shipTo[field]);

    if (!isBillToValid || !isShipToValid) {
      toast.error('Please fill in all required address fields');
      return false;
    }

    if (lineItems.length === 0) {
      toast.error('Please upload an Excel file with line items first');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await generateInvoicePDF({
        lineItems,
        cgst,
        sgst,
        billTo,
        shipTo,
        invoiceDetails,
      });
      toast.success('Invoice PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF invoice');
    }
  };

  const handleClearAll = () => {
    setLineItems([]);
    setCgst(0);
    setSgst(0);
    setBillTo(emptyAddress);
    setShipTo(emptyAddress);
    setInvoiceDetails({
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const handleDownloadSample = () => {
    try {
      generateSampleExcel();
      toast.success('Sample Excel file downloaded successfully');
    } catch (error) {
      console.error('Error generating sample file:', error);
      toast.error('Error generating sample file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Generate Invoice</h2>
          <button
            onClick={handleDownloadSample}
            className="flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-secondary"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Sample Excel
          </button>
        </div>

        {/* Invoice Details Form */}
        <InvoiceDetailsForm details={invoiceDetails} onChange={setInvoiceDetails} />

        {/* Address Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <AddressForm title="Bill To" address={billTo} onChange={setBillTo} />
          <AddressForm title="Ship To" address={shipTo} onChange={setShipTo} />
        </div>
        
        {/* File Upload Section */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <DocumentArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <label className="block">
              <span className="sr-only">Choose Excel file</span>
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Upload Excel file with line item details</p>
          </div>
        </div>

        {/* Line Items Table */}
        {lineItems.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AWB</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Act. Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vol. Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Charges</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shippedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.awbNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.origin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.actWeight}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.volWeight}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.otherCharges}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tax Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">CGST (%)</label>
            <input
              type="number"
              step="0.01"
              value={cgst}
              onChange={(e) => setCgst(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter CGST percentage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SGST (%)</label>
            <input
              type="number"
              step="0.01"
              value={sgst}
              onChange={(e) => setSgst(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter SGST percentage"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={handleSubmit}
            disabled={lineItems.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator; 
