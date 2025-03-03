export interface Address {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
}

export interface LineItem {
  shippedDate: string;
  awbNumber: string;
  origin: string;
  destination: string;
  shipmentType: 'Prepaid' | 'COD' | '';
  actWeight: number;
  volWeight: number;
  otherCharges: number;
  freightCharges: number;
  total: number;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

export interface InvoiceData {
  billTo: Address;
  lineItems: LineItem[];
  fuelSurcharge: number;
  cgst: number;
  sgst: number;
  igst: number;
  invoiceDetails: InvoiceDetails;
} 