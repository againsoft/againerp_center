"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient, type CreateClientPayload } from "@/lib/api/clients";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

const EMPTY: CreateClientPayload = {
  name: "",
  slug: "",
  domain: "",
  db_host: "localhost",
  db_port: 5432,
  db_name: "",
  db_user: "postgres",
  db_password: "",
  api_url: "",
  plan: "starter",
  notes: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function CenterClientFormDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState<CreateClientPayload>({ ...EMPTY });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentToken, setAgentToken] = useState<string | null>(null);

  const set = <K extends keyof CreateClientPayload>(key: K, value: CreateClientPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setAgentToken(null);
    try {
      const created = await createClient(form);
      if (created.agent_token) {
        setAgentToken(created.agent_token);
      } else {
        setForm({ ...EMPTY });
        onOpenChange(false);
        onCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDone() {
    setForm({ ...EMPTY });
    setAgentToken(null);
    onOpenChange(false);
    onCreated();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto" title="Add client">
        <SheetTitle>Add client store</SheetTitle>
        <SheetDescription>
          Register a new ERP client — database credentials are stored encrypted in Control Center.
        </SheetDescription>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          {agentToken ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Client created successfully</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Save this Edge Agent token — it is shown only once.
                </p>
                <code className="mt-3 block break-all rounded-md bg-background p-3 font-mono text-xs">
                  {agentToken}
                </code>
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={handleDone}>Done</Button>
              </div>
            </div>
          ) : (
          <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Store name *">
              <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="MoharazNX" />
            </Field>
            <Field label="Slug *">
              <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="moharaznx" />
            </Field>
            <Field label="Domain">
              <Input value={form.domain ?? ""} onChange={(e) => set("domain", e.target.value)} placeholder="https://moharaznx.com" />
            </Field>
            <Field label="Plan">
              <select
                value={form.plan}
                onChange={(e) => set("plan", e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-xs"
              >
                {["starter", "pro", "enterprise"].map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-lg border border-input bg-muted/30 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Database</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Host *" className="sm:col-span-2">
                <Input required value={form.db_host} onChange={(e) => set("db_host", e.target.value)} />
              </Field>
              <Field label="Port *">
                <Input required type="number" value={form.db_port} onChange={(e) => set("db_port", Number(e.target.value))} />
              </Field>
              <Field label="Database *">
                <Input required value={form.db_name} onChange={(e) => set("db_name", e.target.value)} />
              </Field>
              <Field label="Username *">
                <Input required value={form.db_user} onChange={(e) => set("db_user", e.target.value)} />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={form.db_password}
                    onChange={(e) => set("db_password", e.target.value)}
                    className="pr-8"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </Field>
            </div>
          </div>

          <Field label="API URL">
            <Input value={form.api_url ?? ""} onChange={(e) => set("api_url", e.target.value)} placeholder="https://api.example.com" />
          </Field>
          <Field label="Notes">
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
            />
          </Field>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Save client
            </Button>
          </div>
          </>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
