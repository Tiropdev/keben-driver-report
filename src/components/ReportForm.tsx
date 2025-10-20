import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { DeliveryReport, MATERIAL_OPTIONS } from "@/types/report";
import { saveReport } from "@/lib/storage";
import { generatePDF } from "@/lib/pdfGenerator";
import { supabase } from "@/supabaseClient"; // ✅ new import

const formSchema = z.object({
  driverName: z.string().trim().min(1, "Driver name is required").max(100),
  truckNumber: z.string().trim().min(1, "Truck number is required").max(50),
  material: z.string().min(1, "Please select a material"),
  from: z.string().trim().min(1, "Origin location is required").max(100),
  to: z.string().trim().min(1, "Destination is required").max(100),
  purchaseCost: z.coerce.number().min(0, "Must be a positive number"),
  cess: z.coerce.number().min(0, "Must be a positive number"),
  allowance: z.coerce.number().min(0, "Must be a positive number"),
  fuelPerDay: z.coerce.number().min(0, "Must be a positive number"),
  mileage: z.coerce.number().min(0, "Must be a positive number"),
  amountPaid: z.coerce.number().min(0, "Must be a positive number"),
  confirmed: z.boolean().refine((val) => val === true, "You must confirm the report accuracy"),
});

type FormValues = z.infer<typeof formSchema>;

export const ReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmed: false,
    },
  });

  const confirmed = watch("confirmed");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Create report object
      const report = {
        id: `report_${Date.now()}`,
        driverName: data.driverName,
        truckNumber: data.truckNumber,
        material: data.material,
        from: data.from,
        to: data.to,
        purchaseCost: data.purchaseCost,
        cess: data.cess,
        allowance: data.allowance,  
        fuelPerDay: data.fuelPerDay,
        mileage: data.mileage,
        amountPaid: data.amountPaid,
      
        timestamp: new Date().toISOString(),
      };

      // Save to local storage
      saveReport(report);
      // Save to Supabase
const { error } = await supabase.from("reports").insert([
  {
    driver_name: data.driverName,
    truck_number: data.truckNumber,
    material: data.material,
    from_location: data.from,
    to_location: data.to,
    purchase_cost: data.purchaseCost,
    cess: data.cess,
    allowance: data.allowance,
    mileage: data.mileage,
    amount_paid: data.amountPaid,
    fuel_per_day: data.fuelPerDay, // ✅ add here
  },
]);

if (error) {
  console.error("Supabase insert error:", error);
  toast.error("Failed to save report to Supabase", {
    description: error.message,
  });
} else {
  console.log("✅ Report saved to Supabase");
}


      // Generate PDF
      const pdfBlob = generatePDF(report);
      
      toast.success("Report generated!", {
        description: "The delivery report has been saved and will download.",
      });

      // Download PDF for driver
      //const url = URL.createObjectURL(pdfBlob);
      //const a = document.createElement("a");
      //a.href = url;
      //a.download = `Keben_Report_${data.truckNumber}_${Date.now()}.pdf`;
      //a.click();
      //URL.revokeObjectURL(url);

      // Reset form
      reset();
      setSelectedMaterial("");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to generate report", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
        <CardTitle className="text-2xl">New Delivery Report</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          Fill in the delivery details below
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Driver Info */}
          <div className="space-y-2">
            <Label htmlFor="driverName">Driver Name</Label>
            <Input
              id="driverName"
              placeholder="Enter driver name"
              {...register("driverName")}
              className="h-12"
            />
            {errors.driverName && (
              <p className="text-sm text-destructive">{errors.driverName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="truckNumber">Truck Number</Label>
            <Input
              id="truckNumber"
              placeholder="e.g., KBN-001"
              {...register("truckNumber")}
              className="h-12"
            />
            {errors.truckNumber && (
              <p className="text-sm text-destructive">{errors.truckNumber.message}</p>
            )}
          </div>

          {/* Material Selection */}
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select
              value={selectedMaterial}
              onValueChange={(value) => {
                setSelectedMaterial(value);
                setValue("material", value);
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_OPTIONS.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.material && (
              <p className="text-sm text-destructive">{errors.material.message}</p>
            )}
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                placeholder="Origin location"
                {...register("from")}
                className="h-12"
              />
              {errors.from && (
                <p className="text-sm text-destructive">{errors.from.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="Destination"
                {...register("to")}
                className="h-12"
              />
              {errors.to && (
                <p className="text-sm text-destructive">{errors.to.message}</p>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Purchase Cost (KES)</Label>
              <Input
                id="purchaseCost"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("purchaseCost")}
                className="h-12"
              />
              {errors.purchaseCost && (
                <p className="text-sm text-destructive">{errors.purchaseCost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cess">Cess (KES)</Label>
              <Input
                id="cess"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("cess")}
                className="h-12"
              />
              {errors.cess && (
                <p className="text-sm text-destructive">{errors.cess.message}</p>
              )}
            </div>
          </div>

        {/* Allowance / Fuel per Day */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="allowance">Allowance (KES)</Label>
    <Input
      id="allowance"
      type="number"
      step="0.01"
      placeholder="0.00"
      {...register("allowance")}
      className="h-12"
    />
    {errors.allowance && <p className="text-sm text-destructive">{errors.allowance.message}</p>}
  </div>

  <div className="space-y-2">
    <Label htmlFor="fuelPerDay">Fuel per Day (Ltrs)</Label>
    <Input
      id="fuelPerDay"
      type="number"
      step="0.1"
      placeholder="0.0"
      {...register("fuelPerDay")}
      className="h-12"
    />
    {errors.fuelPerDay && <p className="text-sm text-destructive">{errors.fuelPerDay.message}</p>}
  </div>
</div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("mileage")}
                className="h-12"
              />
              {errors.mileage && (
                <p className="text-sm text-destructive">{errors.mileage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid by Customer (KES)</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amountPaid")}
                className="h-12"
              />
              {errors.amountPaid && (
                <p className="text-sm text-destructive">{errors.amountPaid.message}</p>
              )}
            </div>
          </div>
          {/* Confirmation */}
          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="confirmed"
              checked={confirmed}
              onCheckedChange={(checked) => setValue("confirmed", checked as boolean)}
            />
            <Label
              htmlFor="confirmed"
              className="text-sm font-normal leading-relaxed cursor-pointer"
            >
              I confirm that the information provided in this report is accurate and complete
            </Label>
          </div>
          {errors.confirmed && (
            <p className="text-sm text-destructive">{errors.confirmed.message}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Generate Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
