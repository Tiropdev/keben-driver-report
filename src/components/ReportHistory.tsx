import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getReports } from "@/lib/storage";
import { DeliveryReport } from "@/types/report";

export const ReportHistory = () => {
  const [reports, setReports] = useState<DeliveryReport[]>([]);

  useEffect(() => {
    const savedReports = getReports();
    setReports(savedReports);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-4">
      <h1 className="text-2xl font-bold">Report History</h1>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">No reports saved yet.</p>
      ) : (
        reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>
                {report.driverName} — {report.truckNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Material:</strong> {report.material}
              </p>
              <p>
                <strong>From:</strong> {report.from} → <strong>To:</strong> {report.to}
              </p>
              <p>
                <strong>Amount Paid:</strong> KES {report.amountPaid.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Saved on: {new Date(report.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
