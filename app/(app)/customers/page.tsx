"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import { getStoredCases, type StoredCase } from "@/lib/recovery-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type CustomerSummary = {
  name: string;
  cases: StoredCase[];
  totalAtRisk: number;
  estimatedRecoverable: number;
  executed: number;
  pending: number;
};

export default function CustomersPage() {
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCases(getStoredCases());
      setIsMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const customers = useMemo<CustomerSummary[]>(() => {
    const grouped = new Map<string, StoredCase[]>();

    for (const item of cases) {
      const existing = grouped.get(item.customer) ?? [];
      existing.push(item);
      grouped.set(item.customer, existing);
    }

    return Array.from(grouped.entries())
      .map(([name, customerCases]) => ({
        name,
        cases: customerCases,
        totalAtRisk: customerCases.reduce(
          (sum, item) => sum + item.amountValue,
          0,
        ),
        estimatedRecoverable: customerCases.reduce(
          (sum, item) => sum + (item.estimatedRecoveryAmount || 0),
          0,
        ),
        executed: customerCases.filter((item) => item.executed).length,
        pending: customerCases.filter(
          (item) =>
            item.status === "Needs approval" &&
            !item.executed &&
            !item.blocked,
        ).length,
      }))
      .sort((a, b) => b.totalAtRisk - a.totalAtRisk);
  }, [cases]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      if (customer.name.toLowerCase().includes(query)) {
        return true;
      }

      return customer.cases.some(
        (item) =>
          item.id.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query),
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;

  const totalAtRisk = customers.reduce(
    (sum, customer) => sum + customer.totalAtRisk,
    0,
  );

  const totalRecoverable = customers.reduce(
    (sum, customer) => sum + customer.estimatedRecoverable,
    0,
  );

  const customersWithPending = customers.filter(
    (customer) => customer.pending > 0,
  ).length;

  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading customers...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
      {/* Header */}
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="size-3.5 text-primary" />
          Customer recovery
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Customers
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review customers with recovery cases, payment risk, and outstanding
          recovery opportunities.
        </p>
      </section>

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Customers
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {totalCustomers}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Total at risk
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCurrency(totalAtRisk)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Estimated recoverable
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCurrency(totalRecoverable)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <AlertCircle className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Customers needing approval
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {customersWithPending}
          </p>
        </div>
      </section>

      {/* Customer table */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-medium">Customer recovery cases</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Customers are grouped from the recovery cases currently stored
              by RecoverAI.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-border px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground sm:px-6">
              <div>Customer</div>
              <div>Cases</div>
              <div>At risk</div>
              <div>Recoverable</div>
              <div>Status</div>
            </div>

            {filteredCustomers.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredCustomers.map((customer) => {
                  const hasPending = customer.pending > 0;
                  const allExecuted =
                    customer.cases.length > 0 &&
                    customer.executed === customer.cases.length;

                  return (
                    <div
                      key={customer.name}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-5 py-5 sm:px-6"
                    >
                      {/* Customer */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                          <User className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {customer.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {customer.cases.length} recovery{" "}
                            {customer.cases.length === 1
                              ? "case"
                              : "cases"}
                          </p>
                        </div>
                      </div>

                      {/* Cases */}
                      <div>
                        <p className="text-sm font-medium">
                          {customer.cases.length}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {customer.executed} executed
                        </p>
                      </div>

                      {/* At risk */}
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(customer.totalAtRisk)}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          payment exposure
                        </p>
                      </div>

                      {/* Recoverable */}
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(customer.estimatedRecoverable)}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          estimated
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        {hasPending ? (
                          <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Needs approval
                          </span>
                        ) : allExecuted ? (
                          <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">
                            Recovered
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <Users className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No customers found
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {search
                    ? "Try a different search."
                    : "Run recovery analysis to populate customer data."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Data source note */}
      <p className="text-xs text-muted-foreground">
        Customer information currently comes from the local recovery store.
        This will be replaced by real customer/payment data when we connect
        the production data source.
      </p>
    </div>
  );
}