"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileSearch,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  getAuditRecords,
  type AuditRecord,
} from "@/lib/recovery-store";

type AuditEvent = {
  id: string;
  timestamp: string;
  caseId: string;
  customer: string;
  event: string;
  action: string;
  confidence: number;
  approval: "Auto-approved" | "Approval required" | "Blocked";
  amount: number;
};

const auditEvents: AuditEvent[] = [
  {
    id: "AUD-1001",
    timestamp: "11:15:15 am",
    caseId: "REC-82820",
    customer: "Nimbus Retail",
    event: "Case analyzed",
    action: "Retry payment",
    confidence: 93,
    approval: "Auto-approved",
    amount: 2860,
  },
  {
    id: "AUD-1002",
    timestamp: "11:15:15 am",
    caseId: "REC-82820",
    customer: "Nimbus Retail",
    event: "Root cause identified",
    action: "Temporary payment processing failure",
    confidence: 93,
    approval: "Auto-approved",
    amount: 2860,
  },
  {
    id: "AUD-1003",
    timestamp: "11:15:16 am",
    caseId: "REC-82854",
    customer: "Pixelworks Studio",
    event: "Recovery action recommended",
    action: "Send payment link",
    confidence: 71,
    approval: "Auto-approved",
    amount: 3974,
  },
  {
    id: "AUD-1004",
    timestamp: "11:15:16 am",
    caseId: "REC-82871",
    customer: "Orbit Systems",
    event: "Approval required",
    action: "Send payment reminder",
    confidence: 81,
    approval: "Approval required",
    amount: 38080,
  },
  {
    id: "AUD-1005",
    timestamp: "11:15:17 am",
    caseId: "REC-82931",
    customer: "Acme Technologies",
    event: "Recovery action executed",
    action: "Retry payment",
    confidence: 92,
    approval: "Auto-approved",
    amount: 42500,
  },
  {
    id: "AUD-1006",
    timestamp: "11:15:18 am",
    caseId: "REC-82918",
    customer: "Northstar Labs",
    event: "Recovery action blocked",
    action: "Request payment method update",
    confidence: 85,
    approval: "Blocked",
    amount: 18900,
  },
];

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function EventIcon({ event }: { event: string }) {
  const normalizedEvent = event.toLowerCase();

  if (normalizedEvent.includes("blocked")) {
    return <ShieldAlert size={17} />;
  }

  if (normalizedEvent.includes("approval")) {
    return <ShieldCheck size={17} />;
  }

  if (normalizedEvent.includes("executed")) {
    return <CheckCircle2 size={17} />;
  }

  if (normalizedEvent.includes("recommended")) {
    return <Zap size={17} />;
  }

  return <FileSearch size={17} />;
}

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [storedEvents] = useState<AuditRecord[]>(() => getAuditRecords());

  const events: AuditEvent[] =
    storedEvents.length > 0
      ? storedEvents.map((record) => ({
          id: record.id,
          timestamp: new Date(record.timestamp).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          }),
          caseId: record.caseId,
          customer: record.customer,
          event: record.event,
          action: record.action,
          confidence: record.confidence,
          approval: record.approvalStatus,
          amount: record.amountValue,
        }))
      : auditEvents;

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return events.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.customer.toLowerCase().includes(normalizedSearch) ||
        item.caseId.toLowerCase().includes(normalizedSearch) ||
        item.event.toLowerCase().includes(normalizedSearch) ||
        item.action.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "All" ||
        (filter === "Approval required" &&
          item.approval === "Approval required") ||
        (filter === "Auto-approved" && item.approval === "Auto-approved") ||
        (filter === "Blocked" && item.approval === "Blocked");

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  const totalRecovered = events.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const approvals = events.filter(
    (item) => item.approval === "Approval required",
  ).length;

  const executed = events.filter((item) =>
    item.event.toLowerCase().includes("executed"),
  ).length;

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm text-amber-400">
          <Clock3 size={16} />
          Recovery activity
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Audit trail
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Review every decision made by the RecoverAI recovery engine.
              Actions, approvals, and recovery recommendations are recorded
              for compliance and traceability.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#11100e] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-neutral-500">
              Latest activity
            </p>

            <p className="mt-1 text-sm font-medium">
              {events.length} events recorded
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-neutral-800 bg-[#11100e] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Events recorded
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {events.length}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#11100e] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Actions executed
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {executed}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#11100e] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Approval required
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {approvals}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#11100e] p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Value evaluated
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatAmount(totalRecovered)}
          </p>
        </div>
      </div>

      {/* Audit table */}
      <section className="overflow-hidden rounded-xl border border-neutral-800 bg-[#11100e]">
        <div className="border-b border-neutral-800 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Agent activity
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Immutable-style local records of recovery decisions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-[#0d0c0b] px-3 py-2">
                <Search
                  size={17}
                  className="text-neutral-500"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search audit events..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600 sm:w-56"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-[#0d0c0b] px-3 py-2">
                <Filter
                  size={16}
                  className="text-neutral-500"
                />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-[#0d0c0b] text-sm text-white outline-none"
                >
                  <option
                    value="All"
                    className="bg-[#0d0c0b] text-white"
                  >
                    All
                  </option>

                  <option
                    value="Auto-approved"
                    className="bg-[#0d0c0b] text-white"
                  >
                    Auto-approved
                  </option>

                  <option
                    value="Approval required"
                    className="bg-[#0d0c0b] text-white"
                  >
                    Approval required
                  </option>

                  <option
                    value="Blocked"
                    className="bg-[#0d0c0b] text-white"
                  >
                    Blocked
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop headings */}
        <div className="hidden grid-cols-[1.1fr_1fr_1.4fr_1.3fr_.7fr_1fr_.9fr] gap-4 border-b border-neutral-800 px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 lg:grid">
          <span>Time / Case</span>
          <span>Customer</span>
          <span>Event</span>
          <span>Action</span>
          <span>Confidence</span>
          <span>Approval</span>
          <span>Value</span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            No audit events match your search.
          </div>
        ) : (
          filteredEvents.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 border-b border-neutral-800 px-5 py-5 last:border-b-0 lg:grid-cols-[1.1fr_1fr_1.4fr_1.3fr_.7fr_1fr_.9fr] lg:items-center"
            >
              {/* Time / Case */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-amber-400">
                    <EventIcon event={item.event} />
                  </span>

                  {item.timestamp}
                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  {item.caseId}
                </p>
              </div>

              {/* Customer */}
              <div>
                <p className="text-sm font-medium">
                  {item.customer}
                </p>
              </div>

              {/* Event */}
              <div>
                <p className="text-sm">
                  {item.event}
                </p>
              </div>

              {/* Action */}
              <div>
                <p className="text-sm text-neutral-300">
                  {item.action}
                </p>
              </div>

              {/* Confidence */}
              <div>
                <p className="text-sm font-medium">
                  {item.confidence}%
                </p>
              </div>

              {/* Approval */}
              <div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
                    item.approval === "Auto-approved"
                      ? "border-amber-900/60 bg-amber-950/30 text-amber-400"
                      : item.approval === "Approval required"
                        ? "border-amber-700/60 bg-amber-950/40 text-amber-300"
                        : "border-neutral-700 bg-neutral-900 text-neutral-400"
                  }`}
                >
                  {item.approval}
                </span>
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm font-medium">
                  {formatAmount(item.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}