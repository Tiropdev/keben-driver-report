import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { getReports } from "@/lib/storage";
import { DeliveryReport } from "@/types/report";

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<DeliveryReport[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const savedReports = getReports();
    setReports(
      savedReports.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Saved Reports</h1>
            <p className="text-muted-foreground">View all your delivery reports</p>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first delivery report to see it here
              </p>
              <Button onClick={() => navigate("/")}>Create Report</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-lg">
                      {/* ✅ Display multiple materials if available */}
                      {Array.isArray(report.materials) && report.materials.length > 0 ? (
                        <span>
                          {report.materials.map((m, i) => (
                            <span key={i}>
                              {m.amount} {m.unit} {m.name}
                              {i < report.materials.length - 1 && ", "}
                            </span>
                          ))}
                        </span>
                      ) : (
                        report.material || "—"
                      )}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(report.timestamp), "PPp")}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Driver</p>
                      <p className="font-medium">{report.driverName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Truck</p>
                      <p className="font-medium">{report.truckNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-medium">
                        {((report as any).from ?? "—")} → {((report as any).to ?? "—")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount Paid</p>
                      <p className="font-medium">
                        KES {report.amountPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
