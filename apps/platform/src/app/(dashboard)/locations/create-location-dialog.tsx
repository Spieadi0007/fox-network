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
import { createLocation, updateLocation } from "@fox/supabase/actions/locations";
import type { Location } from "@fox/supabase";
import { MapPin, Loader2 } from "lucide-react";

const locationTypes = [
  { label: "Commercial", value: "commercial" },
  { label: "Industrial", value: "industrial" },
  { label: "Residential", value: "residential" },
  { label: "Government", value: "government" },
  { label: "Data Center", value: "data_center" },
  { label: "Tower Site", value: "tower_site" },
  { label: "Other", value: "other" },
];

const locationStatuses = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Planned", value: "planned" },
  { label: "Decommissioned", value: "decommissioned" },
];

export function CreateLocationDialog({
  open,
  onOpenChange,
  location,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!location;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const values = {
        name: form.get("name") as string,
        address: form.get("address") as string,
        city: form.get("city") as string,
        state: form.get("state") as string,
        zip_code: form.get("zip_code") as string,
        location_type: form.get("location_type") as string,
        status: form.get("status") as string,
        notes: (form.get("notes") as string) || null,
        contact_name: (form.get("contact_name") as string) || null,
        contact_phone: (form.get("contact_phone") as string) || null,
      };

      if (isEdit) {
        await updateLocation(location!.id, values);
      } else {
        await createLocation(values);
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
              <MapPin className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <DialogTitle className="font-[family-name:var(--font-heading)]">
                {isEdit ? "Edit Location" : "New Location"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update location details below."
                  : "Add a physical site to your organization."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Basic Information</h3>
            <div className="space-y-1.5">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Downtown Tower Site"
                defaultValue={location?.name}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location_type">Type</Label>
                <Select name="location_type" defaultValue={location?.location_type ?? "other"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={location?.status ?? "active"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Address</h3>
            <div className="space-y-1.5">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                required
                placeholder="123 Main St"
                defaultValue={location?.address}
              />
            </div>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required placeholder="San Francisco" defaultValue={location?.city} />
              </div>
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required placeholder="CA" defaultValue={location?.state} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="zip_code">Zip Code</Label>
                <Input id="zip_code" name="zip_code" required placeholder="94105" defaultValue={location?.zip_code} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Contact (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Name</Label>
                <Input id="contact_name" name="contact_name" placeholder="Jane Doe" defaultValue={location?.contact_name ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input id="contact_phone" name="contact_phone" placeholder="(555) 123-4567" defaultValue={location?.contact_phone ?? ""} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any additional details about this location..."
              defaultValue={location?.notes ?? ""}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
