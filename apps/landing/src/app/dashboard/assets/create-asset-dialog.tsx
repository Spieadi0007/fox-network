"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createAsset, updateAsset } from "@fox/supabase/actions/assets";
import type { Asset, Location } from "@fox/supabase";
import { Package, Loader2 } from "lucide-react";

const assetTypes = [
  { label: "Cable", value: "cable" },
  { label: "Antenna", value: "antenna" },
  { label: "Power Supply", value: "power_supply" },
  { label: "Solar Panel", value: "solar_panel" },
  { label: "Battery", value: "battery" },
  { label: "Generator", value: "generator" },
  { label: "Server", value: "server" },
  { label: "Router", value: "router" },
  { label: "Sensor", value: "sensor" },
  { label: "Meter", value: "meter" },
  { label: "Tool", value: "tool" },
  { label: "Vehicle", value: "vehicle" },
  { label: "Other", value: "other" },
];

const assetStatuses = [
  { label: "Available", value: "available" },
  { label: "Deployed", value: "deployed" },
  { label: "In Maintenance", value: "in_maintenance" },
  { label: "Retired", value: "retired" },
];

const conditions = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];

export function CreateAssetDialog({
  open,
  onOpenChange,
  locations,
  asset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  asset?: Asset;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!asset;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const locationId = form.get("location_id") as string;
      const conditionVal = form.get("condition") as string;

      const values = {
        name: form.get("name") as string,
        asset_type: form.get("asset_type") as string,
        serial_number: form.get("serial_number") as string,
        status: form.get("status") as string,
        condition: conditionVal || null,
        location_id: locationId || null,
        manufacturer: (form.get("manufacturer") as string) || null,
        model: (form.get("model") as string) || null,
        description: (form.get("description") as string) || null,
        install_date: (form.get("install_date") as string) || null,
        warranty_end: (form.get("warranty_end") as string) || null,
        notes: (form.get("notes") as string) || null,
      };

      if (isEdit) {
        await updateAsset(asset!.id, values);
      } else {
        await createAsset(values);
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
              <Package className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <DialogTitle className="font-[family-name:var(--font-heading)]">
                {isEdit ? "Edit Asset" : "New Asset"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update asset details below."
                  : "Register a piece of equipment or hardware."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Identity</h3>
            <div className="space-y-1.5">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Commscope 48-Port Panel"
                defaultValue={asset?.name}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="asset_type">Type</Label>
                <Select name="asset_type" defaultValue={asset?.asset_type ?? "other"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  required
                  placeholder="e.g. SN-2024-00123"
                  defaultValue={asset?.serial_number}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status & Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Status & Location</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={asset?.status ?? "available"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="condition">Condition</Label>
                <Select name="condition" defaultValue={asset?.condition ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location_id">Location</Label>
                <Select name="location_id" defaultValue={asset?.location_id ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Manufacturer Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Manufacturer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  placeholder="e.g. Commscope"
                  defaultValue={asset?.manufacturer ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="e.g. FDH-48"
                  defaultValue={asset?.model ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Brief description of the asset..."
                defaultValue={asset?.description ?? ""}
              />
            </div>
          </div>

          <Separator />

          {/* Dates & Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Dates & Notes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="install_date">Install Date</Label>
                <Input
                  id="install_date"
                  name="install_date"
                  type="date"
                  defaultValue={asset?.install_date ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="warranty_end">Warranty End</Label>
                <Input
                  id="warranty_end"
                  name="warranty_end"
                  type="date"
                  defaultValue={asset?.warranty_end ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Any additional details..."
                defaultValue={asset?.notes ?? ""}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
