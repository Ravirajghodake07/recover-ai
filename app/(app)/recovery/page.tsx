"use client";

import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Filter,
  LoaderCircle,
  Search,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  analyzeRecoveryCase,
  type RecoveryDecision,
} from "@/lib/recovery-engine";

import {
  addAuditRecords,
  type AuditRecord,
} from "@/lib/recovery-store";

type RecoveryStatus = "High confidence" | "Needs approval" | "Queued";

type RecoveryCase = {
  id: string;
  customer: string;
  initials: string;
  type: string;
  amount: string;
  amountValue: number;
  reason: string;
  confidence: number;
  status: RecoveryStatus;
  recommendation: string;
  description: string;
  attempts: number;
};

type AgentActivity = {
  caseId: string;
  customer: string;
  amountAtRisk: string;
  amountValue: number;
  rootCause: string;
  confidence: number;
  recoveryProbability: number;
  recommendedAction: string;
  requiresApproval: boolean;
  estimatedRecoveryAmount: number;
  reason: string;
  timestamp: string;
};

const cases: RecoveryCase[] = [
  {
    id: "REC-82931",
    customer: "Acme Technologies",
    initials: "AT",
    type: "Payment failure",
    amount: "₹42,500",
    amountValue: 42500,
    reason: "Temporary bank failure",
    confidence: 91,
    status: "Needs approval",
    recommendation: "Retry payment",
    description:
      "The payment appears to have failed due to a temporary bank-side issue. The customer has a strong payment history and has not been retried recently.",
    attempts: 0,
  },
  {
    id: "REC-82918",
    customer: "Northstar Labs",
    initials: "NL",
    type: "Failed subscription",
    amount: "₹18,900",
    amountValue: 18900,
    reason: "Expired payment method",
    confidence: 94,
    status: "Needs approval",
    recommendation: "Request payment method update",
    description:
      "The customer's recurring payment method appears to be expired. A payment-method update has a high predicted recovery probability.",
    attempts: 1,
  },
  {
    id: "REC-82892",
    customer: "Vertex Commerce",
    initials: "VC",
    type: "Checkout abandonment",
    amount: "₹31,200",
    amountValue: 31200,
    reason: "High-intent abandonment",
    confidence: 87,
    status: "High confidence",
    recommendation: "Send recovery reminder",
    description:
      "The customer reached the final checkout stage and abandoned shortly before payment. Previous sessions indicate strong purchase intent.",
    attempts: 0,
  },
  {
    id: "REC-82871",
    customer: "Orbit Systems",
    initials: "OS",
    type: "Overdue invoice",
    amount: "₹56,000",
    amountValue: 56000,
    reason: "Invoice overdue by 7 days",
    confidence: 82,
    status: "Queued",
    recommendation: "Send payment reminder",
    description:
      "The invoice is overdue but the customer has historically paid within 10 days. A gentle reminder is recommended before escalation.",
    attempts: 0,
  },
  {
    id: "REC-82854",
    customer: "Pixelworks Studio",
    initials: "PS",
    type: "Payment failure",
    amount: "₹7,499",
    amountValue: 7499,
    reason: "Insufficient funds",
    confidence: 79,
    status: "Queued",
    recommendation: "Retry after cooldown",
    description:
      "The payment failed due to insufficient funds. A delayed retry is recommended instead of an immediate second attempt.",
    attempts: 1,
  },
  {
    id: "REC-82820",
    customer: "Nimbus Retail",
    initials: "NR",
    type: "Payment failure",
    amount: "₹3,250",
    amountValue: 3250,
    reason: "Network timeout",
    confidence: 96,
    status: "High confidence",
    recommendation: "Retry payment",
    description:
      "The transaction timed out before a final payment state was received. A retry has a high likelihood of succeeding.",
    attempts: 0,
  },
];

const statusStyles: Record<RecoveryStatus, string> = {
  "High confidence":
    "border-primary/20 bg-primary/10 text-primary",
  "Needs approval":
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Queued:
    "border-border bg-secondary text-muted-foreground",
};

function getRecoveryStatus(
  caseData: RecoveryCase,
  decision?: RecoveryDecision,
): RecoveryStatus {
  if (!decision) {
    return caseData.status;
  }

  if (decision.requiresApproval) {
    return "Needs approval";
  }

  return decision.confidence >= 85 ? "High confidence" : "Queued";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createAgentActivity(
  caseData: RecoveryCase,
  decision: RecoveryDecision,
): AgentActivity {
  return {
    caseId: decision.caseId,
    customer: caseData.customer,
    amountAtRisk: caseData.amount,
    amountValue: caseData.amountValue,
    rootCause: decision.rootCause,
    confidence: decision.confidence,
    recoveryProbability: decision.recoveryProbability,
    recommendedAction: decision.recommendedAction,
    requiresApproval: decision.requiresApproval,
    estimatedRecoveryAmount: decision.estimatedRecoveryAmount,
    reason: decision.reason,
    timestamp: new Date().toISOString(),
  };
}

function formatActivityTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

export default function RecoveryPage() {
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | RecoveryStatus>("All");
  const [isRecoveryRunning, setIsRecoveryRunning] = useState(false);
  const [recoveryDecisions, setRecoveryDecisions] = useState<
    Record<string, RecoveryDecision>
  >({});
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const agentActivityRef = useRef<HTMLElement>(null);

  const recoveryDecisionCount = Object.keys(recoveryDecisions).length;
  const highConfidenceActivityCount = agentActivities.filter(
    (activity) => activity.confidence >= 85,
  ).length;
  const approvalActivityCount = agentActivities.filter(
    (activity) => activity.requiresApproval,
  ).length;
  const estimatedRecoveryTotal = agentActivities.reduce(
    (sum, activity) => sum + activity.estimatedRecoveryAmount,
    0,
  );
  const selectedDecision = selectedCase
    ? recoveryDecisions[selectedCase.id]
    : undefined;
  const selectedStatus = selectedCase
    ? getRecoveryStatus(selectedCase, selectedDecision)
    : undefined;

  const handleRunRecovery = async () => {
    setIsRecoveryRunning(true);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const decisions = cases.reduce<Record<string, RecoveryDecision>>(
        (results, caseData) => {
          results[caseData.id] = analyzeRecoveryCase(caseData);
          return results;
        },
        {},
      );

      setRecoveryDecisions(decisions);

      const auditRecords: AuditRecord[] = [];

      cases.forEach((caseData) => {
        const decision = decisions[caseData.id];

        const approvalStatus = decision.requiresApproval
          ? "Approval required"
          : "Auto-approved";

        const now = new Date().toISOString();

        auditRecords.push(
          {
            id: `${decision.caseId}-${Date.now()}-analyzed`,
            timestamp: now,
            caseId: decision.caseId,
            customer: caseData.customer,
            event: "Case analyzed",
            action: decision.recommendedAction,
            confidence: decision.confidence,
            approvalStatus,
            amountValue: decision.estimatedRecoveryAmount,
            amount: formatCurrency(decision.estimatedRecoveryAmount),
          },
          {
            id: `${decision.caseId}-${Date.now()}-root-cause`,
            timestamp: now,
            caseId: decision.caseId,
            customer: caseData.customer,
            event: "Root cause identified",
            action: decision.recommendedAction,
            confidence: decision.confidence,
            approvalStatus,
            amountValue: decision.estimatedRecoveryAmount,
            amount: formatCurrency(decision.estimatedRecoveryAmount),
          },
          {
            id: `${decision.caseId}-${Date.now()}-recommended`,
            timestamp: now,
            caseId: decision.caseId,
            customer: caseData.customer,
            event: "Recovery action recommended",
            action: decision.recommendedAction,
            confidence: decision.confidence,
            approvalStatus,
            amountValue: decision.estimatedRecoveryAmount,
            amount: formatCurrency(decision.estimatedRecoveryAmount),
          },
          {
            id: `${decision.caseId}-${Date.now()}-approval`,
            timestamp: now,
            caseId: decision.caseId,
            customer: caseData.customer,
            event: decision.requiresApproval
              ? "Approval required"
              : "Auto-approval eligible",
            action: decision.recommendedAction,
            confidence: decision.confidence,
            approvalStatus,
            amountValue: decision.estimatedRecoveryAmount,
            amount: formatCurrency(decision.estimatedRecoveryAmount),
          },
        );
      });

      addAuditRecords(auditRecords);

      setAgentActivities(
        cases.map((caseData) =>
          createAgentActivity(caseData, decisions[caseData.id]),
        ),
      );
    } finally {
      setIsRecoveryRunning(false);
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch =
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        getRecoveryStatus(item, recoveryDecisions[item.id]) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [filter, recoveryDecisions, search]);

  const totalRecoverable = cases.reduce(
    (sum, item) => sum + item.amountValue,
    0,
  );

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
        {/* Header */}
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              AI-powered recovery
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Recovery opportunities
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review revenue at risk and the interventions RecoverAI
              recommends for each case.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <button
              type="button"
              onClick={handleRunRecovery}
              disabled={isRecoveryRunning}
              aria-busy={isRecoveryRunning}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRecoveryRunning ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Zap className="size-4" />
              )}
              {isRecoveryRunning ? "Running recovery..." : "Run recovery"}
            </button>

            {recoveryDecisionCount > 0 && !isRecoveryRunning && (
              <p className="flex items-center gap-1.5 text-xs text-primary">
                <CheckCircle2 className="size-3.5" />
                Recovery analysis complete · {recoveryDecisionCount} cases analyzed
              </p>
            )}
          </div>
        </section>

        {/* Metrics */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={TriangleAlert}
            label="Open cases"
            value="47"
            detail="12 added today"
          />

          <MetricCard
            icon={CircleDollarSign}
            label="Recoverable revenue"
            value="₹6.18L"
            detail="73.4% of at-risk revenue"
          />

          <MetricCard
            icon={Bot}
            label="High confidence"
            value="31"
            detail="AI confidence above 85%"
          />

          <MetricCard
            icon={ShieldAlert}
            label="Needs approval"
            value="12"
            detail="Outside auto-recovery limits"
          />
        </section>

        {/* Agent banner */}
        <section
          ref={agentActivityRef}
          id="agent-activity"
          tabIndex={-1}
          className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-5 outline-none sm:p-6"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="size-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">Recovery agent is active</h2>

                  <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    Monitoring
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  The agent has identified{" "}
                  <span className="font-medium text-foreground">
                    47 recovery opportunities
                  </span>{" "}
                  worth{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(totalRecoverable)}
                  </span>
                  . Recommendations are checked against merchant policies
                  before execution.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                agentActivityRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                agentActivityRef.current?.focus({ preventScroll: true });
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              View agent activity
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="relative mt-6 border-t border-border pt-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium">Agent activity</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Decisions generated by the local RecoverAI recovery engine.
                </p>
              </div>

              {agentActivities.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Latest run · {agentActivities.length} cases analyzed
                </span>
              )}
            </div>

            {agentActivities.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                Run recovery to see the agent&apos;s decisions.
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ActivityMetric
                    label="Cases analyzed"
                    value={agentActivities.length.toString()}
                  />
                  <ActivityMetric
                    label="High confidence"
                    value={highConfidenceActivityCount.toString()}
                  />
                  <ActivityMetric
                    label="Requires approval"
                    value={approvalActivityCount.toString()}
                  />
                  <ActivityMetric
                    label="Estimated recoverable"
                    value={formatCurrency(estimatedRecoveryTotal)}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {agentActivities
                    .slice()
                    .reverse()
                    .map((activity) => (
                      <article
                        key={`${activity.caseId}-${activity.timestamp}`}
                        className="rounded-lg border border-border bg-background/40 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {activity.customer}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {activity.caseId} · {activity.amountAtRisk} at risk
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatActivityTimestamp(activity.timestamp)}
                          </p>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <ActivityStep
                            icon={Bot}
                            label="Agent analyzed case"
                            value={`${activity.confidence}% confidence`}
                          />
                          <ActivityStep
                            icon={Search}
                            label="Root cause identified"
                            value={activity.rootCause}
                          />
                          <ActivityStep
                            icon={CircleDollarSign}
                            label="Recovery probability calculated"
                            value={`${activity.recoveryProbability}% · ${formatCurrency(activity.estimatedRecoveryAmount)}`}
                          />
                          <ActivityStep
                            icon={Zap}
                            label="Action recommended"
                            value={activity.recommendedAction}
                          />
                          <ActivityStep
                            icon={ShieldAlert}
                            label="Approval check"
                            value={
                              activity.requiresApproval
                                ? "Merchant approval required"
                                : "Eligible for auto-approval"
                            }
                          />
                        </div>

                        <p className="mt-4 text-xs leading-5 text-muted-foreground">
                          {activity.reason}
                        </p>
                      </article>
                    ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Cases */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-medium">Recovery queue</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cases prioritized by predicted recovery value and confidence.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cases..."
                  className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 sm:w-52"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value as "All" | RecoveryStatus,
                    )
                  }
                  className="h-9 w-full appearance-none rounded-lg border border-border bg-background pl-9 pr-8 text-xs outline-none focus:border-primary/50 sm:w-40"
                >
                  <option>All</option>
                  <option>High confidence</option>
                  <option>Needs approval</option>
                  <option>Queued</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredCases.map((item) => {
              const decision = recoveryDecisions[item.id];
              const caseStatus = getRecoveryStatus(item, decision);
              const confidence = decision?.confidence ?? item.confidence;
              const recommendedAction =
                decision?.recommendedAction ?? item.recommendation;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className="group flex w-full flex-col gap-4 p-5 text-left transition-colors hover:bg-secondary/40 sm:p-6 lg:flex-row lg:items-center"
                >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-xs font-medium">
                    {item.initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {item.customer}
                      </p>

                      <span className="text-[10px] text-muted-foreground">
                        {item.id}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.type} · {item.reason}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:w-[480px] lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      At risk
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.amount}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Confidence
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {confidence}%
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Recommended
                    </p>
                    <p className="mt-1 truncate text-sm font-medium">
                      {recommendedAction}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyles[caseStatus]}`}
                    >
                      {caseStatus === "High confidence" ? (
                        <CheckCircle2 className="size-3" />
                      ) : caseStatus === "Needs approval" ? (
                        <ShieldAlert className="size-3" />
                      ) : (
                        <Clock3 className="size-3" />
                      )}

                      {caseStatus}
                    </span>
                  </div>
                </div>

                <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground lg:block" />
                </button>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Search className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No cases found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="size-3.5 text-primary" />
          Every recovery action will be checked against merchant-defined
          guardrails before execution.
        </div>
      </div>

      {/* Case drawer */}
      {selectedCase && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
            onClick={() => setSelectedCase(null)}
            aria-label="Close recovery case"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs text-muted-foreground">
                  Recovery case
                </p>
                <p className="mt-0.5 font-medium">{selectedCase.id}</p>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    {selectedCase.customer}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedCase.type}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyles[selectedStatus ?? selectedCase.status]}`}
                >
                  {selectedStatus ?? selectedCase.status}
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">Revenue at risk</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {selectedCase.amount}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  {selectedDecision?.rootCause ?? selectedCase.reason}
                </div>
              </div>

              <div className="mt-6">
                <SectionTitle
                  icon={Bot}
                  title="AI diagnosis"
                  subtitle="Why RecoverAI believes this case is recoverable."
                />

                <div className="mt-4 rounded-xl border border-border bg-card p-5">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedDecision?.reason ?? selectedCase.description}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Recovery confidence
                      </span>
                      <span className="font-medium">
                        {selectedDecision?.confidence ?? selectedCase.confidence}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${selectedDecision?.confidence ?? selectedCase.confidence}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <SectionTitle
                  icon={Sparkles}
                  title="Recommended intervention"
                  subtitle="The next action suggested by the agent."
                />

                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="size-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {selectedDecision?.recommendedAction ?? selectedCase.recommendation}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        This recommendation will be evaluated against your
                        recovery policies before execution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <SectionTitle
                  icon={ShieldAlert}
                  title="Policy checks"
                  subtitle="Guardrails that must pass before execution."
                />

                <div className="mt-4 space-y-2">
                  <PolicyCheck
                    label="Customer is eligible for recovery"
                    passed
                  />
                  <PolicyCheck
                    label={`Retry limit: ${selectedCase.attempts}/2 attempts`}
                    passed={selectedCase.attempts < 2}
                  />
                  <PolicyCheck
                    label="Recovery action is within merchant auto-approval policy"
                    passed={selectedDecision ? !selectedDecision.requiresApproval : selectedCase.amountValue <= 10000}
                  />
                  <PolicyCheck
                    label="AI confidence meets minimum threshold"
                    passed={(selectedDecision?.confidence ?? selectedCase.confidence) >= 80}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />

                  <p className="text-xs leading-5 text-muted-foreground">
                    High-value recovery actions require merchant approval.
                    RecoverAI never bypasses configured recovery limits.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-background p-4 sm:p-5">
              {(selectedDecision?.requiresApproval ?? selectedCase.amountValue > 10000) ? (
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition-opacity hover:opacity-90">
                  <ShieldAlert className="size-4" />
                  Request merchant approval
                </button>
              ) : (
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <Zap className="size-4" />
                  Execute recovery
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function ActivityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function ActivityStep({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-[18px]" />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Bot;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="size-4 text-primary" />
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function PolicyCheck({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div
        className={`flex size-6 items-center justify-center rounded-full ${
          passed ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-400"
        }`}
      >
        {passed ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <ShieldAlert className="size-3.5" />
        )}
      </div>

      <span className="text-xs">{label}</span>

      <span className="ml-auto text-[10px] font-medium text-muted-foreground">
        {passed ? "PASS" : "REVIEW"}
      </span>
    </div>
  );
}
