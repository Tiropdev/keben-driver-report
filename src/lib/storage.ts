import { DeliveryReport } from "@/types/report";

const STORAGE_KEY = "keben_reports";

export const saveReport = (report: DeliveryReport): void => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const getReports = (): DeliveryReport[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

