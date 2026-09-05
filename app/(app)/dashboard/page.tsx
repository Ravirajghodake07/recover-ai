"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Users,
  WalletCards,
  Activity,
  ShieldAlert,
} from "lucide-react";

import {
  getRecoveryStats,
  getStoredCases,
} from "@/lib/recovery-store";

import {
  getLatestBatchSimulation,
  type BatchSimulationSummary,
} from "@/lib/batch-store";

import { formatCurrency } from "@/lib/format";

type RecentCaseRow = {
  customer: string;
  type: string;
  amount: string;
  status: string;
  time: string;
};

type PipelineItem = {
  label: string;
  amount: string;
  count: string;
  progress: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalCases: 0,
    executed: 0,
    needsApproval: 0,
    highConfidence: 0,
    queued: 0,
    totalAtRisk: 0,
    estimatedRecoverable: 0,
    recoveryRate: 0,
    auditCount: 0,
  });

  const [recentCases, setRecentCases] =
    useState<RecentCaseRow[]>([]);

  const [pipeline, setPipeline] =
    useState<PipelineItem[]>([]);

  const [batchResult, setBatchResult] =
    useState<BatchSimulationSummary | null>(null);

  const [actualRecovered, setActualRecovered] =
    useState(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);

      const realStats = getRecoveryStats();

      setStats(realStats);

      const cases = getStoredCases();

      /*
       * Actual recovered value:
       * only count cases that were actually executed.
       */
      const recoveredAmount = cases
        .filter((item) => item.executed)
        .reduce(
          (sum, item) =>
            sum + (item.estimatedRecoveryAmount || 0),
          0,
        );

      setActualRecovered(recoveredAmount);

      /*
       * Load latest batch simulation.
       */
      setBatchResult(getLatestBatchSimulation());

      /*
       * Recent cases.
       */
      const recent = cases.slice(0, 4).map((c) => ({
        customer: c.customer,
        type: c.type,
        amount: c.amount,
        status: c.executed
          ? "Recovered"
          : c.blocked
            ? "Blocked"
            : c.status === "Needs approval"
              ? "In progress"
              : "Queued",
        time: c.executedAt
          ? new Date(c.executedAt).toLocaleTimeString()
          : "Just now",
      }));

      setRecentCases(recent);

      /*
       * Recovery pipeline.
       */
      const paymentFailures = cases.filter(
        (c) =>
          c.type
            .toLowerCase()
            .includes("payment"),
      );

      const subscriptions = cases.filter((c) =>
        c.type
          .toLowerCase()
          .includes("subscription"),
      );

      const invoices = cases.filter((c) =>
        c.type
          .toLowerCase()
          .includes("invoice"),
      );

      const abandonments = cases.filter((c) =>
        c.type
          .toLowerCase()
          .includes("abandonment"),
      );

      setPipeline([
        {
          label: "Payment failures",
          amount: formatCurrency(
            paymentFailures.reduce(
              (sum, c) => sum + c.amountValue,
              0,
            ),
          ),
          count: `${paymentFailures.length} cases`,
          progress: Math.min(
            100,
            paymentFailures.length * 20,
          ),
        },
        {
          label: "Checkout abandonment",
          amount: formatCurrency(
            abandonments.reduce(
              (sum, c) => sum + c.amountValue,
              0,
            ),
          ),
          count: `${abandonments.length} sessions`,
          progress: Math.min(
            100,
            abandonments.length * 18,
          ),
        },
        {
          label: "Failed subscriptions",
          amount: formatCurrency(
            subscriptions.reduce(
              (sum, c) => sum + c.amountValue,
              0,
            ),
          ),
          count: `${subscriptions.length} customers`,
          progress: Math.min(
            100,
            subscriptions.length * 15,
          ),
        },
        {
          label: "Overdue invoices",
          amount: formatCurrency(
            invoices.reduce(
              (sum, c) => sum + c.amountValue,
              0,
            ),
          ),
          count: `${invoices.length} invoices`,
          progress: Math.min(
            100,
            invoices.length * 12,
          ),
        },
      ]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Revenue at risk",
      value: formatCurrency(stats.totalAtRisk),
      change: `${stats.totalCases} cases`,
      description: "Revenue currently exposed",
      icon: TriangleAlert,
    },
    {
      label: "Recoverable revenue",
      value: formatCurrency(
        stats.estimatedRecoverable,
      ),
      change: `${stats.recoveryRate.toFixed(1)}%`,
      description: "Estimated recovery opportunity",
      icon: CircleDollarSign,
    },
    {
      label: "Money recovered",
      value: formatCurrency(actualRecovered),
      change: `${stats.executed} executed`,
      description: "Actions actually executed",
      icon: WalletCards,
    },
    {
      label: "Recovery rate",
      value: `${stats.recoveryRate.toFixed(1)}%`,
      change: `${stats.auditCount} events`,
      description: "Estimated recovery / at-risk",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">

      {/* Header */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            RecoverAI Workspace

            <span className="text-border">•</span>

            {stats.auditCount} actions logged
          </div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Gemini AI Agent
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Revenue recovery overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor revenue at risk, understand why it is
            slipping, and let RecoverAI recommend the next
            best recovery action.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <Clock3 className="size-4" />
          Last 30 days
        </button>
      </section>

      {/* Metrics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-[18px]" />
                </div>

                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <ArrowUpRight className="size-3.5" />
                  {metric.change}
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                {metric.label}
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {metric.value}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Latest batch simulation */}
      {batchResult && (
        <section className="overflow-hidden rounded-xl border border-primary/20 bg-card">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />

                <h2 className="font-medium">
                  Latest recovery batch
                </h2>

                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Synthetic demo
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                RecoverAI processed{" "}
                <span className="font-medium text-foreground">
                  {batchResult.totalCases} cases
                </span>{" "}
                through diagnosis, recovery scoring and policy
                checks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/recovery")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-secondary"
            >
              Run another batch
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-5">
            <BatchMetric
              label="Cases analyzed"
              value={batchResult.totalCases.toString()}
            />

            <BatchMetric
              label="Revenue at risk"
              value={formatCurrency(
                batchResult.totalAtRisk,
              )}
            />

            <BatchMetric
              label="Estimated recoverable"
              value={formatCurrency(
                batchResult.estimatedRecoverable,
              )}
            />

            <BatchMetric
              label="Simulated recovered"
              value={formatCurrency(
                batchResult.simulatedRecovered,
              )}
              emphasis
            />

            <BatchMetric
              label="Recovery rate"
              value={`${batchResult.recoveryRate.toFixed(1)}%`}
              emphasis
            />
          </div>

          <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-2 xl:grid-cols-4">
            <BatchDetail
              label="High confidence"
              value={batchResult.highConfidence.toString()}
            />

            <BatchDetail
              label="Auto-approved"
              value={batchResult.autoApproved.toString()}
            />

            <BatchDetail
              label="Needs approval"
              value={batchResult.needsApproval.toString()}
            />

            <BatchDetail
              label="Audit events"
              value={(batchResult.totalCases * 2).toString()}
            />
          </div>

          <div className="flex items-start gap-2 border-t border-border px-5 py-4 sm:px-6">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-400" />

            <p className="text-xs leading-5 text-muted-foreground">
              Batch figures are synthetic demo results. They
              demonstrate RecoverAI decision and policy
              workflow and do not represent real merchant
              revenue.
            </p>
          </div>
        </section>
      )}

      {/* Main content */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">

        {/* Recovery chart */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-medium">
                  Revenue recovery
                </h2>

                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {stats.recoveryRate.toFixed(1)}%
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Estimated recoverable revenue
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-semibold">
                {formatCurrency(
                  stats.estimatedRecoverable,
                )}
              </p>

              <p className="text-xs text-muted-foreground">
                estimated recoverable
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div className="relative h-64 w-full overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="border-t border-border/60"
                  />
                ))}
              </div>

              <svg
                viewBox="0 0 1000 260"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="recoveryFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.18"
                    />

                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d={`M 0 210 ${[
                    30,
                    45,
                    35,
                    50,
                    40,
                    60,
                    55,
                    70,
                    65,
                    75,
                    70,
                    80,
                    75,
                    85,
                    80,
                    88,
                    82,
                    90,
                    85,
                    92,
                    88,
                    95,
                    90,
                    96,
                    92,
                    98,
                    95,
                    100,
                    98,
                    100,
                  ]
                    .map((point, index) => {
                      const x =
                        (index / 29) * 1000;

                      const y =
                        235 - point * 1.85;

                      return `L ${x} ${y}`;
                    })
                    .join(" ")} L 1000 260 L 0 260 Z`}
                  fill="url(#recoveryFill)"
                  className="text-primary"
                />

                <path
                  d={[
                    30,
                    45,
                    35,
                    50,
                    40,
                    60,
                    55,
                    70,
                    65,
                    75,
                    70,
                    80,
                    75,
                    85,
                    80,
                    88,
                    82,
                    90,
                    85,
                    92,
                    88,
                    95,
                    90,
                    96,
                    92,
                    98,
                    95,
                    100,
                    98,
                    100,
                  ]
                    .map((point, index) => {
                      const x =
                        (index / 29) * 1000;

                      const y =
                        235 - point * 1.85;

                      return `${
                        index === 0 ? "M" : "L"
                      } ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                />
              </svg>
            </div>

            <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
              {[0, 5, 10, 15, 20, 25, 29].map(
                (index) => {
                  const date = new Date();

                  date.setDate(
                    date.getDate() -
                      (29 - index),
                  );

                  return (
                    <span key={index}>
                      {date.toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                    </span>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* AI Agent */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="size-5" />
                </div>

                <div>
                  <p className="font-medium">
                    Recovery agent
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Autonomous decision engine
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                Active
              </span>
            </div>

            <div className="mt-7">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Current observation
              </p>

              <p className="mt-3 text-lg font-medium leading-7">
                {stats.totalCases} cases need attention.
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {stats.needsApproval} cases require approval.
                {" "}
                {stats.highConfidence} cases have high
                confidence for recovery.
                {" "}
                {stats.executed} cases already recovered.
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-background/50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Sparkles className="size-3.5 text-primary" />
                Recommended action
              </div>

              <p className="mt-2 text-sm">
                {stats.needsApproval > 0
                  ? `${stats.needsApproval} approvals needed. Review the approval queue.`
                  : "All cases processed. Run recovery analysis for new cases."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/recovery")}
              className="mt-5 flex w-full items-center justify-between rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Review recovery queue
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div>
          <h2 className="font-medium">
            Recovery pipeline
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Where recoverable revenue is currently sitting.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pipeline.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border/80 bg-background/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                  <CreditCard className="size-4 text-muted-foreground" />
                </div>

                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>

              <p className="mt-4 text-sm font-medium">
                {item.label}
              </p>

              <div className="mt-1 flex items-baseline justify-between gap-2">
                <p className="text-lg font-semibold">
                  {item.amount}
                </p>

                <p className="text-xs text-muted-foreground">
                  {item.count}
                </p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-medium">
              Recent recovery activity
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Latest cases processed by RecoverAI.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/recovery")}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View activity
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="divide-y divide-border">
          {recentCases.length > 0 ? (
            recentCases.map((item) => (
              <div
                key={`${item.customer}-${item.amount}`}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Users className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.customer}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium">
                      {item.amount}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>

                  <span
                    className={
                      item.status === "Recovered"
                        ? "flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary"
                        : item.status === "In progress"
                          ? "flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-foreground"
                          : item.status === "Blocked"
                            ? "flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400"
                            : "flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                    }
                  >
                    {item.status === "Recovered" ? (
                      <CheckCircle2 className="size-3" />
                    ) : item.status === "Blocked" ? (
                      <ShieldAlert className="size-3" />
                    ) : (
                      <Clock3 className="size-3" />
                    )}

                    {item.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No recovery activity yet. Run recovery analysis
              on the Recovery page.
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          Recovery actions are policy-checked before execution.
        </div>

        <div className="flex items-center gap-1">
          <span>Demo environment</span>

          <span className="text-border">•</span>

          <span>No live payments are affected</span>

          <span className="text-border">•</span>

          <span>{stats.auditCount} audit records</span>
        </div>
      </section>
    </div>
  );
}

function BatchMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="bg-card p-5">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${
          emphasis ? "text-emerald-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BatchDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}