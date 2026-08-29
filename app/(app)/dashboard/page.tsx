import {
  ArrowDownRight,
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
} from "lucide-react";

const metrics = [
  {
    label: "Revenue at risk",
    value: "₹8.42L",
    change: "+12.4%",
    direction: "up",
    description: "vs. previous 30 days",
    icon: TriangleAlert,
  },
  {
    label: "Recoverable revenue",
    value: "₹6.18L",
    change: "73.4%",
    direction: "up",
    description: "of revenue at risk",
    icon: CircleDollarSign,
  },
  {
    label: "Money recovered",
    value: "₹4.76L",
    change: "+18.7%",
    direction: "up",
    description: "this month",
    icon: WalletCards,
  },
  {
    label: "Recovery rate",
    value: "77.0%",
    change: "+5.2%",
    direction: "up",
    description: "vs. previous month",
    icon: TrendingUp,
  },
];

const pipeline = [
  {
    label: "Payment failures",
    amount: "₹3.20L",
    count: "47 cases",
    progress: 76,
  },
  {
    label: "Checkout abandonment",
    amount: "₹2.10L",
    count: "128 sessions",
    progress: 61,
  },
  {
    label: "Failed subscriptions",
    amount: "₹1.80L",
    count: "31 customers",
    progress: 48,
  },
  {
    label: "Overdue invoices",
    amount: "₹1.32L",
    count: "18 invoices",
    progress: 34,
  },
];

const recentCases = [
  {
    customer: "Acme Technologies",
    type: "Payment failure",
    amount: "₹42,500",
    status: "Recovered",
    time: "8 min ago",
  },
  {
    customer: "Northstar Labs",
    type: "Failed subscription",
    amount: "₹18,900",
    status: "In progress",
    time: "21 min ago",
  },
  {
    customer: "Vertex Commerce",
    type: "Checkout abandonment",
    amount: "₹31,200",
    status: "Queued",
    time: "34 min ago",
  },
  {
    customer: "Orbit Systems",
    type: "Overdue invoice",
    amount: "₹56,000",
    status: "Recovered",
    time: "1 hr ago",
  },
];

const chartPoints = [
  38, 43, 40, 47, 44, 53, 50, 58, 55, 63, 61, 68, 64, 72, 69, 77,
  73, 81, 79, 86, 82, 89, 87, 94, 91, 97, 93, 100, 96, 104,
];

function formatDate(index: number) {
  const date = new Date();
  date.setDate(date.getDate() - (29 - index));

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Demo workspace
            <span className="text-border">•</span>
            Last synced 2 min ago
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Revenue recovery overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor revenue at risk, understand why it is slipping, and let
            RecoverAI recommend the next best recovery action.
          </p>
        </div>

        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary">
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

      {/* Main chart + AI agent */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-medium">Revenue recovery</h2>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  +18.7%
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Recovered revenue over the last 30 days
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-semibold">₹4.76L</p>
              <p className="text-xs text-muted-foreground">total recovered</p>
            </div>
          </div>

          <div className="mt-7">
            <div className="relative h-64 w-full overflow-hidden">
              {/* Horizontal grid */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="border-t border-border/60"
                  />
                ))}
              </div>

              {/* Chart */}
              <svg
                viewBox="0 0 1000 260"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-label="Revenue recovery trend"
                role="img"
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
                  d={`M 0 210 ${chartPoints
                    .map((point, index) => {
                      const x = (index / (chartPoints.length - 1)) * 1000;
                      const y = 235 - point * 1.85;
                      return `L ${x} ${y}`;
                    })
                    .join(" ")} L 1000 260 L 0 260 Z`}
                  fill="url(#recoveryFill)"
                  className="text-primary"
                />

                <path
                  d={chartPoints
                    .map((point, index) => {
                      const x = (index / (chartPoints.length - 1)) * 1000;
                      const y = 235 - point * 1.85;

                      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
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
              {chartPoints
                .filter((_, index) => index % 5 === 0)
                .map((_, index) => (
                  <span key={index}>
                    {formatDate(index * 5)}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* AI Agent card */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="size-5" />
                </div>

                <div>
                  <p className="font-medium">Recovery agent</p>
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
                47 failed payments need attention.
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Most failures appear linked to expired cards. The agent has
                identified 31 customers with a strong recovery probability.
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-background/50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Sparkles className="size-3.5 text-primary" />
                Recommended action
              </div>

              <p className="mt-2 text-sm">
                Retry payment with a fallback method, then notify the customer
                if the retry fails.
              </p>
            </div>

            <button className="mt-5 flex w-full items-center justify-between rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Review recovery queue
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium">Recovery pipeline</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Where recoverable revenue is currently sitting.
            </p>
          </div>

          <button className="hidden items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex">
            View all
            <ChevronRight className="size-3.5" />
          </button>
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
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`More options for ${item.label}`}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>

              <p className="mt-4 text-sm font-medium">{item.label}</p>

              <div className="mt-1 flex items-baseline justify-between gap-2">
                <p className="text-lg font-semibold">{item.amount}</p>
                <p className="text-xs text-muted-foreground">{item.count}</p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent cases */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-medium">Recent recovery activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest cases processed by RecoverAI.
            </p>
          </div>

          <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            View activity
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="divide-y divide-border">
          {recentCases.map((item) => (
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
                  <p className="text-sm font-medium">{item.amount}</p>
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
                        : "flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                  }
                >
                  {item.status === "Recovered" ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <Clock3 className="size-3" />
                  )}
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom trust strip */}
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          Recovery actions are policy-checked before execution.
        </div>

        <div className="flex items-center gap-1">
          <span>Demo environment</span>
          <span className="text-border">•</span>
          <span>No live payments are affected</span>
        </div>
      </section>
    </div>
  );
}