"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Clock3,
  Search,
  XCircle,
} from "lucide-react";

import { getStoredCases, type StoredCase } from "@/lib/recovery-store";
import { formatCurrency } from "@/lib/format";

type PaymentView = {
  id: string;
  customer: string;
  type: string;
  amountValue: number;
  amount: string;
  status: "Failed" | "Recovered" | "Overdue" | "Abandoned" | "Blocked";
  reason: string;
  attempts: number;
  caseId: string;
  recoveryProbability: number;
  confidence: number;
};

function getPaymentStatus(item: StoredCase): PaymentView["status"] {
  if (item.blocked) {
    return "Blocked";
  }

  if (item.executed) {
    return "Recovered";
  }

  if (
    item.type.toLowerCase().includes("overdue") ||
    item.reason.toLowerCase().includes("overdue")
  ) {
    return "Overdue";
  }

  if (
    item.type.toLowerCase().includes("abandon") ||
    item.reason.toLowerCase().includes("abandon")
  ) {
    return "Abandoned";
  }

  return "Failed";
}

function statusClasses(status: PaymentView["status"]) {
  switch (status) {
    case "Recovered":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
    case "Blocked":
      return "border-red-500/20 bg-red-500/10 text-red-500";
    case "Overdue":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
    case "Abandoned":
      return "border-violet-500/20 bg-violet-500/10 text-violet-500";
    default:
      return "border-orange-500/20 bg-orange-500/10 text-orange-500";
  }
}

export default function PaymentsPage() {
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | PaymentView["status"]>("All");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCases(getStoredCases());
      setIsMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const payments = useMemo<PaymentView[]>(() => {
    return cases.map((item) => ({
      id: `PAY-${item.id.replace("REC-", "")}`,
      customer: item.customer,
      type: item.type,
      amountValue: item.amountValue,
      amount: formatCurrency(item.amountValue),
      status: getPaymentStatus(item),
      reason: item.reason,
      attempts: item.attempts,
      caseId: item.id,
      recoveryProbability: item.recoveryProbability,
      confidence: item.confidence,
    }));
  }, [cases]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.customer.toLowerCase().includes(query) ||
        payment.id.toLowerCase().includes(query) ||
        payment.caseId.toLowerCase().includes(query) ||
        payment.reason.toLowerCase().includes(query);

      const matchesFilter = filter === "All" || payment.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  const totalAtRisk = payments
    .filter((item) => item.status !== "Recovered")
    .reduce((sum, item) => sum + item.amountValue, 0);

  const recoveredValue = payments
    .filter((item) => item.status === "Recovered")
    .reduce((sum, item) => sum + item.amountValue, 0);

  const failedCount = payments.filter(
    (item) => item.status === "Failed",
  ).length;

  const recoveredCount = payments.filter(
    (item) => item.status === "Recovered",
  ).length;

  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">
          Loading payments...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="size-3.5 text-primary" />
            Payment intelligence
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Payments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor payment outcomes and see which failed transactions are
            being recovered by the AI recovery engine.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Total payments
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {payments.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <AlertCircle className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Revenue at risk
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCurrency(totalAtRisk)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Recovered revenue
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCurrency(recoveredValue)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <XCircle className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Failed payments
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {failedCount}
          </p>
        </div>
      </section>

      {/* Payment table */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-medium">Payment activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {recoveredCount} recovered · {failedCount} failed ·{" "}
              {payments.length} total
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search payments..."
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary sm:w-64"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as "All" | PaymentView["status"])
              }
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="All">All statuses</option>
              <option value="Failed">Failed</option>
              <option value="Recovered">Recovered</option>
              <option value="Overdue">Overdue</option>
              <option value="Abandoned">Abandoned</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Payment
                  </th>

                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>

                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Reason
                  </th>

                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Recovery
                  </th>

                  <th className="px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Attempts
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{payment.id}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {payment.caseId}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">
                          {payment.customer}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {payment.type}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      {payment.amount}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(
                          payment.status,
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="max-w-[240px] px-6 py-4">
                      <p className="truncate text-sm">{payment.reason}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="min-w-[110px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Probability
                          </span>
                          <span className="font-medium">
                            {payment.recoveryProbability}%
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${payment.recoveryProbability}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock3 className="size-3.5 text-muted-foreground" />
                        {payment.attempts}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <CreditCard className="mx-auto size-8 text-muted-foreground/50" />

            <p className="mt-4 text-sm font-medium">
              No payments found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Run recovery analysis or change your search/filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}