import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/supabaseClient";

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

const loadReports = () => {
  const savedReports = JSON.parse(localStorage.getItem("reports") || "[]");
  setReports(savedReports.reverse()); // show newest first
  console.log("📄 Loaded local reports:", savedReports);
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Delivery Reports
            </h1>
            <p className="text-muted-foreground">
              View all submitted delivery reports
            </p>
          </div>
        </div>

        {/* Reports List */}
{reports.length === 0 ? (
  <Card className="text-center py-12">
    <CardContent className="pt-6">
      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
      <p className="text-muted-foreground mb-6">
        Once a driver submits a delivery report, it will appear here.
      </p>
      <Button onClick={() => navigate("/")}>Create Report</Button>
    </CardContent>
  </Card>
) : (
  <div className="space-y-4">
    {reports.map((report) => (
      <Card
        key={report.id}
        className="p-4 hover:shadow-md transition-shadow rounded-xl border border-border"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            {report.material || "Unknown Material"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {report.created_at
              ? format(new Date(report.created_at), "PPp")
              : "No date available"}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Driver</p>
            <p className="font-medium">{report.driver_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Truck</p>
            <p className="font-medium">{report.truck_number}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Route</p>
            <p className="font-medium">
              {report.from_location} → {report.to_location}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Amount Paid</p>
            <p className="font-medium">KES {report.amount_paid?.toLocaleString()}</p>
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
