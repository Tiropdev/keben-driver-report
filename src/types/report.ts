export interface DeliveryReport {
  id: string;
  driverName: string;
  truckNumber: string;
  material: string;
  from: string;
  to: string;
  purchaseCost: number;
  cess: number;
  allowance: number;
  mileage: number;
  amountPaid: number;
  timestamp: string;
}

export const MATERIAL_OPTIONS = [
  "Ballast 1/2",
  "Ballast 3/4",
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
