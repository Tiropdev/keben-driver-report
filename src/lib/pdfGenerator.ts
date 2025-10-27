import jsPDF from "jspdf";
import { DeliveryReport } from "@/types/report";
import { format } from "date-fns";

export const generatePDF = (report: DeliveryReport): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(45, 80, 22); // Keben green
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("KEBEN HARDWARE", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Delivery Report", pageWidth / 2, 32, { align: "center" });
  
  // Reset text color for body
  doc.setTextColor(0, 0, 0);
  
  // Report details
  let yPos = 55;
  const lineHeight = 10;
  const labelX = 20;
  const valueX = 80;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Date: ${format(new Date(report.timestamp), "PPpp")}`, pageWidth - 20, 50, { align: "right" });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  
  const addField = (label: string, value: string | number) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, labelX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), valueX, yPos);
    yPos += lineHeight;
  };
  
  addField("Driver Name", report.driverName);
  addField("Truck Number", report.truckNumber);
  addField("Material", report.material);
  yPos += 5; // Extra spacing
  
  addField("From", report.from);
  addField("To", report.to);
  yPos += 5;
  
  addField("Mileage", `${report.mileage} km`);
  yPos += 5;
  
  addField("Purchase Cost", `KES ${report.purchaseCost.toLocaleString()}`);
  addField("Cess", `KES ${report.cess.toLocaleString()}`);
  addField("Allowance", `KES ${report.allowance.toLocaleString()}`);
  addField("Amount Paid by Customer", `KES ${report.amountPaid.toLocaleString()}`);
  
  // Signature section
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Driver Signature:", labelX, yPos);
  doc.line(labelX + 40, yPos + 2, pageWidth - 20, yPos + 2);
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("This is a computer-generated report from Keben Hardware", pageWidth / 2, 280, { align: "center" });
  
  return doc.output("blob");
};
