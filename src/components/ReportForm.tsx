import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Send, Trash2, PlusCircle } from "lucide-react";
import { saveReport } from "@/lib/storage";

// -------------------- MATERIALS --------------------
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
];

const getUnit = (material: string) => {
  if (material === "Foundation Stones") return "ft";
  if (material.includes("Machine Block")) return "pieces";
  return "tons";
};

// -------------------- FORM SCHEMA --------------------
const materialSchema = z.object({
  name: z.string().min(1, "Select a material"),
  amount: z.coerce.number().min(0.1, "Enter valid amount"),
  unit: z.string(),
});

const formSchema = z.object({
  driverName: z.string().trim().min(1, "Driver name is required").max(100),
  truckNumber: z.string().trim().min(1, "Truck number is required").max(50),
  from: z.string().trim().min(1, "Origin location is required").max(100),
  to: z.string().trim().min(1, "Destination is required").max(100),
  materials: z.array(materialSchema).min(1, "Add at least one material"),
  purchaseCost: z.coerce.number().min(0, "Must be positive"),
  cess: z.coerce.number().min(0, "Must be positive"),
  allowance: z.coerce.number().min(0, "Must be positive"),
  mileage: z.coerce.number().min(0, "Must be positive"),
  amountPaid: z.coerce.number().min(0, "Must be positive"),
  confirmed: z.boolean().refine((val) => val === true, "You must confirm accuracy"),
});

type FormValues = z.infer<typeof formSchema>;

// -------------------- REPORT FORM COMPONENT --------------------
export const ReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { materials: [{ name: "", amount: 0, unit: "" }], confirmed: false },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "materials" });
  const confirmed = watch("confirmed");
  const materials = watch("materials");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const materialsArray = data.materials.map((m) => ({
        name: m.name,
        amount: m.amount,
        unit: m.unit,
      }));

      // ✅ Local storage (camelCase)
      const localReport = {
        id: `report_${Date.now()}`,
        driverName: data.driverName,
        truckNumber: data.truckNumber,
        from: data.from,
        to: data.to,
        purchaseCost: data.purchaseCost,
        cess: data.cess,
        allowance: data.allowance,
        mileage: data.mileage,
        amountPaid: data.amountPaid,
        materials: materialsArray,
        material: materialsArray.map((m) => `${m.amount}${m.unit} ${m.name}`).join(", "),
        timestamp: new Date().toISOString(),
      };

      saveReport(localReport);

      // ✅ Supabase (snake_case)
      const SUPABASE_URL = "https://gyqrhyjmilcogdggdnal.supabase.co";
      const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cXJoeWptaWxjb2dkZ2dkbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzM4ODksImV4cCI6MjA3NjMwOTg4OX0.E9_z2ER7idyKDIL1u_XmxvdssfFa5QTaQ9iMs0aRcSk";

const report = {
  driver_name: data.driverName,
  truck_number: data.truckNumber,
  from_location: data.from,
  to_location: data.to,
  purchase_cost: data.purchaseCost,
  cess: data.cess,
  allowance: data.allowance,
  distance: data.mileage, // ✅ rename from mileage → distance
  amount_paid: data.amountPaid,
  materials: materialsArray,
  material: materialsArray.map((m) => `${m.amount}${m.unit} ${m.name}`).join(", "),
  created_at: new Date().toISOString(), // ✅ replace timestamp with your actual Supabase column name
};


      const response = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Supabase insert failed: ${errText}`);
      }

      toast.success("✅ Report saved locally and synced to Supabase!");
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Failed to save report: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
        <CardTitle className="text-2xl">NEW DELIVERY REPORT</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          FILL IN THE DETAILS BELOW
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Driver Info */}
          <div className="space-y-2">
            <Label htmlFor="driverName">DRIVER NAME</Label>
            <Input id="driverName" placeholder="Enter your Name" {...register("driverName")} className="h-12" />
            {errors.driverName && <p className="text-sm text-destructive">{errors.driverName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="truckNumber">TRUCK NUMBER</Label>
            <Input id="truckNumber" placeholder="Eg. KBN 123E" {...register("truckNumber")} className="h-12" />
            {errors.truckNumber && <p className="text-sm text-destructive">{errors.truckNumber.message}</p>}
          </div>

          {/* Materials Section */}
          <div className="space-y-3">
            <Label>MATERIALS</Label>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end border p-3 rounded-lg relative"
              >
                <div className="space-y-1">
                  <Label>MATERIAL</Label>
                  <Select
                    value={materials[index]?.name || ""}
                    onValueChange={(val) => {
                      setValue(`materials.${index}.name`, val);
                      setValue(`materials.${index}.unit`, getUnit(val));
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_MATERIALS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.materials?.[index]?.name && (
                    <p className="text-sm text-destructive">
                      {errors.materials[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>AMOUNT ({materials[index]?.unit || "-"})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`materials.${index}.amount` as const)}
                    className="h-10"
                  />
                  {errors.materials?.[index]?.amount && (
                    <p className="text-sm text-destructive">
                      {errors.materials[index]?.amount?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end pt-5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => append({ name: "", amount: 0, unit: "" })}
            >
              <PlusCircle className="h-4 w-4" /> Add Material
            </Button>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>FROM</Label>
              <Input placeholder="Enter starting location" {...register("from")} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>TO</Label>
              <Input placeholder="Enter destination" {...register("to")} className="h-12" />
            </div>
          </div>

          {/* Financial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PURCHASE COST</Label>
              <Input type="number" step="0.01" {...register("purchaseCost")} />
            </div>
            <div className="space-y-2">
              <Label>CESS</Label>
              <Input type="number" step="0.01" {...register("cess")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ALLOWANCE</Label>
            <Input type="number" step="0.01" {...register("allowance")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DISTANCE (KM)</Label>
              <Input type="number" step="0.1" {...register("mileage")} />
            </div>
            <div className="space-y-2">
              <Label>AMOUNT PAID BY CUSTOMER</Label>

              <Input type="number" step="0.01" {...register("amountPaid")} />
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(c) => setValue("confirmed", c as boolean)}
            />
            <Label>I confirm the information is accurate</Label>
          </div>

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
