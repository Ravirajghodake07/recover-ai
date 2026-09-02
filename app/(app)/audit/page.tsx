"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import {
  getAuditRecords,
  type AuditRecord,
} from "@/lib/recovery-store";
import { formatCurrency } from "@/lib/format";

function statusClasses(status: AuditRecord["approvalStatus"]) {
  switch (status) {
    case "Auto-approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";

    case "Blocked":
      return "border-red-500/20 bg-red-500/10 text-red-500";

    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
  }
}

function eventIcon(event: AuditRecord["event"]) {
  if (event === "Recovery action executed") {
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  }

  if (event === "Recovery action blocked") {
    return <XCircle className="size-4 text-red-500" />;
  }

  if (event === "Approval required") {
    return <ShieldAlert className="size-4 text-amber-500" />;
  }

  return <Activity className="size-4 text-primary" />;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | AuditRecord["approvalStatus"]>(
    "All",
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEvents(getAuditRecords());
      setIsMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesSearch =
          !query ||
          event.customer.toLowerCase().includes(query) ||
          event.caseId.toLowerCase().includes(query) ||
          event.event.toLowerCase().includes(query) ||
          event.action.toLowerCase().includes(query);

        const matchesFilter =
          filter === "All" || event.approvalStatus === filter;

        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime(),
      );
  }, [events, search, filter]);

  const executedCount = events.filter(
    (event) => event.event === "Recovery action executed",
  ).length;

  const blockedCount = events.filter(
    (event) => event.event === "Recovery action blocked",
  ).length;

  const approvalCount = events.filter(
    (event) => event.event === "Approval required",
  ).length;

  const executedValue = events
    .filter((event) => event.event === "Recovery action executed")
    .reduce((sum, event) => sum + event.amountValue, 0);

  if (!isMounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">
          Loading audit trail...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="size-3.5 text-primary" />
          Recovery governance
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Audit trail
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Every recovery decision is recorded so merchants can understand
          what the agent analyzed, recommended, approved, executed, or blocked.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Total audit events
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {events.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Actions executed
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {executedCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Clock3 className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Approval events
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {approvalCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <XCircle className="size-[18px]" />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Blocked actions
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {blockedCount}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-medium">Decision history</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(executedValue)} represented by executed recovery
              actions
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search audit events..."
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary sm:w-64"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as
                    | "All"
                    | AuditRecord["approvalStatus"],
                )
              }
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="All">All events</option>
              <option value="Auto-approved">Executed</option>
              <option value="Approval required">Approval required</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-secondary/20 sm:px-6 lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    {eventIcon(event.event)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {event.event}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {event.customer} · {event.caseId}
                    </p>
                  </div>
                </div>

                <div className="min-w-[190px]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Action
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {event.action}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Amount
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatCurrency(event.amountValue)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {event.confidence}%
                  </p>
                </div>

                <div className="lg:min-w-[190px]">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Time
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(
                    event.approvalStatus,
                  )}`}
                >
                  {event.approvalStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Activity className="mx-auto size-8 text-muted-foreground/50" />

            <p className="mt-4 text-sm font-medium">
              No audit events found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Run recovery analysis to create an auditable decision trail.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}