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
  fuelPerDay: number;
  distance: number;
  amountPaid: number;
  timestamp: string;
}

export const MATERIAL_OPTIONS = [
  "BALLAST 1/2",
  "BALLAST 3/4",
  "MIXED BALLAST",
  "QUARRY SAND",
  "QUARRY DUST",
  "WEST POKOT SAND",
  "RIVER SAND",
  "MACHINE BLOCKS 6X9",
  "MACHINE BLOCKS 9X9",
  "FOUNDATION STONES",
  "HARDCORE",
  "MURRAM",
  "QUARRY WASTE",
];
