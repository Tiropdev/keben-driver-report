import { DeliveryReport } from "@/types/report";

const STORAGE_KEY = "keben_reports";

export const saveReport = (report: DeliveryReport): void => {
  try {
    // Get existing reports
    const reports = getReports();
    console.log("[DEBUG] Existing reports before save:", reports);

    // Ensure report is JSON-serializable
    const reportJSON = JSON.stringify(report);
    const newReports = [...reports, JSON.parse(reportJSON)];

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));

    // Debug logs
    console.log("[DEBUG] Saved new report:", report);
    console.log("[DEBUG] Reports now in localStorage:", getReports());
  } catch (error) {
    console.error("[ERROR] Failed to save report:", error);
  }
};

export const getReports = (): DeliveryReport[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    console.log("[DEBUG] Retrieved reports from localStorage:", parsed);
    return parsed;
  } catch (error) {
    console.error("[ERROR] Failed to read reports:", error);
    return [];
  }
};
