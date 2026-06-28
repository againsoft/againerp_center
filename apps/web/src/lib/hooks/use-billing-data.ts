"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiInvoicesToCenterInvoices,
  apiMrrRowsToCenterSubscriptions,
  apiStatsToCenterBillingStats,
  findPastDueClients,
} from "@/lib/adapters/center-billing-adapter";
import {
  fetchBillingInvoices,
  fetchBillingStats,
  fetchFleetMrr,
} from "@/lib/api/billing";
import type { CenterBillingInvoice, CenterClientSubscription } from "@/lib/mock-data/center";

export type BillingStats = {
  totalMrr: number;
  openInvoices: number;
  pastDueAmount: number;
  paidThisMonth: number;
  invoiceCount: number;
};

const emptyStats: BillingStats = {
  totalMrr: 0,
  openInvoices: 0,
  pastDueAmount: 0,
  paidThisMonth: 0,
  invoiceCount: 0,
};

export function useBillingData() {
  const [invoices, setInvoices] = useState<CenterBillingInvoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<CenterClientSubscription[]>([]);
  const [stats, setStats] = useState<BillingStats>(emptyStats);
  const [pastDueClients, setPastDueClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, invoicesRes, mrrRes] = await Promise.all([
        fetchBillingStats(),
        fetchBillingInvoices(),
        fetchFleetMrr(),
      ]);
      const centerInvoices = apiInvoicesToCenterInvoices(invoicesRes);
      setStats(apiStatsToCenterBillingStats(statsRes));
      setInvoices(centerInvoices);
      setSubscriptions(apiMrrRowsToCenterSubscriptions(mrrRes));
      setPastDueClients(findPastDueClients(centerInvoices));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load billing data");
      setInvoices([]);
      setSubscriptions([]);
      setStats(emptyStats);
      setPastDueClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { invoices, subscriptions, stats, pastDueClients, loading, error, refresh: load };
}
