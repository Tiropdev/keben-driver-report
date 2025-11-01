import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { saveReport } from "@/lib/storage";

const ALL_MATERIALS = [
  "Ballast 1/2",
  "Ballast 3/4",
  "Mixed Ballast",
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
  "Other",
];

const getUnit = (material?: string) => {
  if (!material) return "";
  const m = material.toLowerCase();
  if (m.includes("foundation")) return "ft";
  if (m.includes("machine block") || m.includes("6x9") || m.includes("9x9"))
    return "pieces";
  return "";
};

const formSchema = z.object({
  driverName: z.string().trim().min(1, "Driver name is required").max(100),
  truckNumber: z.string().trim().min(1, "Truck number is required").max(50),
  from: z.string().trim().min(1, "Origin location is required").max(100),
  to: z.string().trim().min(1, "Destination is required").max(100),
  material: z.string().min(1, "Please select a material"),
  otherMaterial: z.string().optional(),
  amount: z.coerce.number().optional(),
  trips: z.coerce.number().optional(),
  purchaseCost: z.coerce.number().min(0, "Must be positive"),
  cess: z.coerce.number().min(0, "Must be positive"),
  allowance: z.coerce.number().min(0, "Must be positive"),
  fuel: z.coerce.number().min(0, "Must be positive"),
  distance: z.coerce.number().min(0, "Must be positive"),
  amountPaid: z.coerce.number().min(0, "Must be positive"),
  confirmed: z.boolean().refine((val) => val === true, "Confirm report accuracy"),
});

type FormValues = z.infer<typeof formSchema>;

const SUPABASE_URL = "https://gyqrhyjmilcogdggdnal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cXJoeWptaWxjb2dkZ2dkbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzM4ODksImV4cCI6MjA3NjMwOTg4OX0.E9_z2ER7idyKDIL1u_XmxvdssfFa5QTaQ9iMs0aRcSk";

export const ReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      trips: undefined,
      amount: undefined,
      material: "",
      otherMaterial: "",
    },
  });

  const selectedMaterial = watch("material");

  // show amount for foundation, machine blocks (6x9/9x9) and Other
  const showAmountField =
    selectedMaterial &&
    (
      selectedMaterial.toLowerCase().includes("foundation") ||
      selectedMaterial.toLowerCase().includes("6x9") ||
      selectedMaterial.toLowerCase().includes("9x9") ||
      selectedMaterial === "Other"
    );

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // amountValue: keep null if user didn't provide an amount
      const amountValue =
        typeof data.amount === "number" && !Number.isNaN(data.amount)
          ? data.amount
          : null;

      // tripsValue: keep null if not provided
      const tripsValue =
        typeof data.trips === "number" && !Number.isNaN(data.trips)
          ? data.trips
          : null;

      // materialName: plain text only (if Other, take typed otherMaterial)
      const materialName =
        data.material === "Other"
          ? (data.otherMaterial?.trim() || "Other")
          : data.material;

      // local report (keeps amount & trips separate)
      const localReport = {
        id: `report_${Date.now()}`,
        driverName: data.driverName,
        truckNumber: data.truckNumber,
        from: data.from,
        to: data.to,
        material: materialName, // plain text
        amount: amountValue,
        trips: tripsValue,
        purchaseCost: data.purchaseCost,
        cess: data.cess,
        allowance: data.allowance,
        fuel: data.fuel,
        distance: data.distance,
        amountPaid: data.amountPaid,
        timestamp: new Date().toISOString(),
      };

      saveReport(localReport);

      // payload: material, amount, trips are separate columns (no pipes)
      const payload: Record<string, any> = {
        driver_name: data.driverName,
        truck_number: data.truckNumber,
        from_location: data.from,
        to_location: data.to,
        material: materialName,
        amount: amountValue,
        trips: tripsValue,
        purchase_cost: data.purchaseCost,
        cess: data.cess,
        allowance: data.allowance,
        fuel_per_day: data.fuel,
        distance: data.distance,
        amount_paid: data.amountPaid,
        created_at: new Date().toISOString(),
      };

      const resp = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Supabase insert failed");
      }

      toast.success("✅ Report saved and synced to Supabase!");
      reset();
    } catch (err: any) {
      console.error("Report save error:", err);
      toast.error("Failed to save report. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // helper to know whether the next material requires amount (used when switching selection)
  const materialRequiresAmount = (val: string) =>
    val &&
    (
      val.toLowerCase().includes("foundation") ||
      val.toLowerCase().includes("6x9") ||
      val.toLowerCase().includes("9x9") ||
      val === "Other"
    );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
        <CardTitle className="text-2xl">NEW DELIVERY REPORT</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          FILL IN THE DELIVERY DETAILS BELOW
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Driver Info */}
          <div className="space-y-2">
            <Label>DRIVER NAME</Label>
            <Input {...register("driverName")} placeholder="Write your name" className="h-12" />
            {errors.driverName && <p className="text-sm text-destructive">{errors.driverName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>TRUCK NUMBER</Label>
            <Input {...register("truckNumber")} placeholder="e.g. KCD 123R" className="h-12" />
            {errors.truckNumber && <p className="text-sm text-destructive">{errors.truckNumber.message}</p>}
          </div>

          {/* Material */}
          <div className="space-y-2">
            <Label>MATERIALS</Label>
            <Select
              value={selectedMaterial || ""}
              onValueChange={(val) => {
                // set the selected material
                setValue("material", val);

                // only clear amount if the newly selected material does NOT require amount
                if (!materialRequiresAmount(val)) {
                  setValue("amount", undefined);
                }
                // keep amount if selecting Other or machine/foundation so driver doesn't lose typed value
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {ALL_MATERIALS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.material && <p className="text-sm text-destructive">{errors.material.message}</p>}
          </div>

          {selectedMaterial === "Other" && (
            <div className="space-y-2">
              <Label>Specify Other Material</Label>
              <Input {...register("otherMaterial")} placeholder="Enter material name" className="h-12" />
            </div>
          )}

          {/* Amount + Trips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showAmountField && (
              <div className="space-y-2">
                <Label>
                  QUANTITY {getUnit(selectedMaterial) ? `(${getUnit(selectedMaterial)})` : ""}
                </Label>
                <Input type="number" step="0.01" {...register("amount")} placeholder="Enter amount" className="h-12" />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Trips (optional)</Label>
              <Input type="number" step="1" {...register("trips")} placeholder="e.g. 2" className="h-12" />
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>FROM</Label>
              <Input {...register("from")} placeholder="Origin location" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>TO</Label>
              <Input {...register("to")} placeholder="Destination" className="h-12" />
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PURCHASE COST(KES)</Label>
              <Input type="number" {...register("purchaseCost")} placeholder="0.0" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>CESS (KES)</Label>
              <Input type="number" {...register("cess")} placeholder="0.0" className="h-12" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label>ALLOWANCE(KES)</Label>
            <Input type="number" {...register("allowance")} placeholder="0.0" className="h-12" />
          </div>
          <div className="space-y-2">
            <Label>FUEL PER DAY(Ltrs)</Label>
            <Input type="number" {...register("fuel")} placeholder="0.0" className="h-12" />
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DISTANCE (km)</Label>
              <Input type="number" {...register("distance")} placeholder="0.0" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>AMOUNT PAID BY CUSTOMER (KES)</Label>
              <Input type="number" {...register("amountPaid")} placeholder="0.0" className="h-12" />
            </div>
          </div>

          {/* Confirm */}
          <div className="flex items-start space-x-3 pt-4">
            <Checkbox checked={watch("confirmed")} onCheckedChange={(c) => setValue("confirmed", c as boolean)} />
            <Label className="text-sm font-normal leading-relaxed cursor-pointer">
              I COMFIRM THAT THE ABOVE REPORT IS ACCURATE
            </Label>
          </div>
          {errors.confirmed && <p className="text-sm text-destructive">{errors.confirmed.message}</p>}

          <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Report...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" /> Save Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
