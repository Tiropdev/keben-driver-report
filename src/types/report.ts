// ✅ Updated DeliveryReport type
export interface DeliveryReport {
  id: string;
  driverName: string;
  truckNumber: string;
  from_location: string;
  to_location: string;
  purchaseCost: number;
  cess: number;
  allowance: number;
  mileage: number;
  amountPaid: number;
  timestamp: string;

  // ✅ Old single-material field (for legacy reports)
  material?: string;

  // ✅ New multiple materials field
  materials?: {
    name: string;
    amount: number;
    unit: string;
  }[];
}

// ✅ Material options list remains the same
export const MATERIAL_OPTIONS = [
  "Ballast 1/2",
  "Ballast 3/4",
  "Mixed Ballast",
  "Quarry Sand",
  "Quarry Dust",
  "West Pokot Sand",
  "River Sand",
  "Machine Blocks 6x9",
  "Machine Blocks 9x9",
  "Foundation Stones",
  "Hardcore",
  "Murram",
  "Quarry Waste",
];
