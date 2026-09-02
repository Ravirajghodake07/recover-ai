"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  X,
  DollarSign,
  AlertCircle,
  User,
  Clock3,
} from "lucide-react";

import {
  getStoredCases,
  updateCase,
  addAuditRecords,
  type AuditRecord,
  type StoredCase,
} from "@/lib/recovery-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Only cases that:
 * - require merchant approval
 * - have not already been executed
 * - have not been blocked
 */
function pendingApprovals(cases: StoredCase[]) {
  return cases.filter(
    (item) =>
      item.status === "Needs approval" &&
      item.executed !== true &&
      item.blocked !== true,
  );
}

export default function ApprovalsPage() {
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /**
   * Load the approval queue from localStorage.
   */
  const refresh = useCallback(() => {
    const storedCases = getStoredCases();
    setCases(pendingApprovals(storedCases));
  }, []);

  /**
   * Initial load.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);
      refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  /**
   * Refresh if another part of the app changes localStorage.
   */
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "recover-ai-cases") {
        refresh();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [isMounted, refresh]);

  /**
   * MERCHANT APPROVES THE RECOVERY ACTION
   */
  const handleApprove = (item: StoredCase) => {
    if (processingId) {
      return;
    }

    setProcessingId(item.id);

    const executedAt = new Date().toISOString();

    /**
     * Important:
     * Approval means the recommended recovery action is now executed.
     */
    const updated = updateCase(item.id, {
      executed: true,
      executedAt,
      blocked: false,
      status: "Needs approval",
    });

    if (!updated) {
      setProcessingId(null);
      refresh();
      return;
    }

    const auditRecord: AuditRecord = {
      id: `${item.id}-${executedAt}-approved`,
      timestamp: executedAt,
      caseId: item.id,
      customer: item.customer,
      event: "Recovery action executed",
      action: item.recommendation,
      confidence: item.confidence,

      /**
       * The merchant approved it manually.
       * "Auto-approved" here is being used by your existing
       * AuditRecord type for an approved/executed action.
       */
      approvalStatus: "Auto-approved",

      amountValue: item.estimatedRecoveryAmount,
      amount: formatCurrency(item.estimatedRecoveryAmount),
    };

    addAuditRecords([auditRecord]);

    refresh();
    setProcessingId(null);
  };

  /**
   * MERCHANT REJECTS THE RECOVERY ACTION
   */
  const handleReject = (item: StoredCase) => {
    if (processingId) {
      return;
    }

    setProcessingId(item.id);

    const blockedAt = new Date().toISOString();

    /**
     * Block the case so it disappears from the approval queue.
     */
    const updated = updateCase(item.id, {
      blocked: true,
      executed: false,
      executedAt: undefined,
    });

    if (!updated) {
      setProcessingId(null);
      refresh();
      return;
    }

    const auditRecord: AuditRecord = {
      id: `${item.id}-${blockedAt}-blocked`,
      timestamp: blockedAt,
      caseId: item.id,
      customer: item.customer,
      event: "Recovery action blocked",
      action: item.recommendation,
      confidence: item.confidence,
      approvalStatus: "Blocked",
      amountValue: item.estimatedRecoveryAmount,
      amount: formatCurrency(item.estimatedRecoveryAmount),
    };

    addAuditRecords([auditRecord]);

    refresh();
    setProcessingId(null);
  };

  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading approvals...
        </div>
      </div>
    );
  }

  const totalValue = cases.reduce(
    (sum, item) => sum + item.amountValue,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
      {/* HEADER */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5 text-primary" />
            Merchant approval queue
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Approvals
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review recovery actions that sit outside auto-approval limits
            before they are executed.
          </p>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid gap-3 sm:grid-cols-3">
        {/* Pending */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <AlertCircle className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Pending approvals
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {cases.length}
          </p>
        </div>

        {/* Value */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Value awaiting review
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCurrency(totalValue)}
          </p>
        </div>

        {/* Queue status */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock3 className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Queue status
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {cases.length > 0 ? "Action needed" : "Clear"}
          </p>
        </div>
      </section>

      {/* APPROVAL QUEUE */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="font-medium">
            Cases requiring approval
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Approve to execute the recommended recovery action, or reject to
            block it.
          </p>
        </div>

        <div className="divide-y divide-border">
          {cases.length > 0 ? (
            cases.map((item) => {
              const isProcessing = processingId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center"
                >
                  {/* CUSTOMER */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <User className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.customer}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.id} · {item.type}
                      </p>
                    </div>
                  </div>

                  {/* CASE DETAILS */}
                  <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        At risk
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {item.amount}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Recommended
                      </p>

                      <p className="mt-1 truncate text-sm font-medium">
                        {item.recommendation}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Confidence
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {item.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 gap-2">
                    {/* REJECT */}
                    <button
                      type="button"
                      disabled={!!processingId}
                      onClick={() => handleReject(item)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
                    >
                      <X className="size-4" />
                      {isProcessing ? "Processing..." : "Reject"}
                    </button>

                    {/* APPROVE */}
                    <button
                      type="button"
                      disabled={!!processingId}
                      onClick={() => handleApprove(item)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-4" />

                      {isProcessing ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </div>

              <p className="mt-4 text-sm font-medium">
                No pending approvals
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No cases are currently waiting for merchant approval.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}