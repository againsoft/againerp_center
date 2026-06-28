"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createRegistration, type CreateRegistrationPayload } from "@/lib/api/registrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const EMPTY: CreateRegistrationPayload = {
  business_name: "",
  contact_name: "",
  contact_email: "",
  phone: "",
  requested_plan: "starter",
  requested_modules: ["catalog", "orders", "customers", "inventory"],
  wants_ai: false,
  industry: "",
  deployment_mode: "saas",
  region: "Asia/Dhaka",
  website: "",
  employee_count: "",
  referral_source: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function CenterRegistrationFormDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState<CreateRegistrationPayload>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateRegistrationPayload>(key: K, value: CreateRegistrationPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createRegistration(form);
      setForm({ ...EMPTY });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto" title="Manual registration">
        <SheetTitle>Manual registration</SheetTitle>
        <SheetDescription>
          Create an intake record for operator review before client provisioning.
        </SheetDescription>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <Field label="Business name *">
            <Input required value={form.business_name} onChange={(e) => set("business_name", e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact name *">
              <Input required value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
            </Field>
            <Field label="Contact email *">
              <Input required type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
            </Field>
          </div>
          <Field label="Phone">
            <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Plan">
              <Select value={form.requested_plan} onValueChange={(v) => set("requested_plan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Deployment">
              <Select value={form.deployment_mode ?? "saas"} onValueChange={(v) => set("deployment_mode", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Industry">
            <Input value={form.industry ?? ""} onChange={(e) => set("industry", e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="text-sm">AI OS requested</Label>
            <Switch checked={form.wants_ai ?? false} onCheckedChange={(v) => set("wants_ai", v)} />
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Submit registration
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
