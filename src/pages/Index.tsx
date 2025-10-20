import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/ReportForm";
import { FileText, Truck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Keben Hardware</h1>
                <p className="text-sm text-primary-foreground/90">Driver Delivery Reports</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/reports")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">View Reports</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ReportForm />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Keben Hardware. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
