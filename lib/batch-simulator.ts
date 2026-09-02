import {
  analyzeRecoveryCase,
  type RecoveryCaseInput,
  type RecoveryDecision,
} from "@/lib/recovery-engine";

import {
  addAuditRecords,
  type AuditRecord,
} from "@/lib/recovery-store";

import {
  saveBatchSimulationSummary,
} from "@/lib/batch-store";

export type BatchSimulationCase = RecoveryCaseInput & {
  customer: string;
};

export type BatchSimulationResult = {
  cases: BatchSimulationCase[];
  decisions: RecoveryDecision[];
  totalCases: number;
  totalAtRisk: number;
  estimatedRecoverable: number;
  highConfidence: number;
  needsApproval: number;
  autoApproved: number;
  blocked: number;
  simulatedRecovered: number;
  recoveryRate: number;
};

const CUSTOMERS = [
  "Acme Technologies",
  "Northstar Labs",
  "Vertex Commerce",
  "Orbit Systems",
  "Pixelworks Studio",
  "Nimbus Retail",
  "BluePeak Digital",
  "Cobalt Systems",
  "Aster Commerce",
  "Nova Labs",
];

const SCENARIOS = [
  {
    type: "Payment failure",
    reason: "Temporary bank failure",
    confidence: 94,
    attempts: 0,
  },
  {
    type: "Payment failure",
    reason: "Network timeout",
    confidence: 96,
    attempts: 0,
  },
  {
    type: "Payment failure",
    reason: "Expired payment method",
    confidence: 93,
    attempts: 0,
  },
  {
    type: "Payment failure",
    reason: "Insufficient funds",
    confidence: 79,
    attempts: 0,
  },
  {
    type: "Checkout abandonment",
    reason: "High-intent checkout abandonment",
    confidence: 88,
    attempts: 0,
  },
  {
    type: "Overdue invoice",
    reason: "Invoice is overdue",
    confidence: 82,
    attempts: 0,
  },
];

function randomAmount(index: number) {
  const amounts = [
    3250,
    7499,
    12500,
    18900,
    24750,
    31200,
    42500,
    56000,
    68000,
    84500,
  ];

  return amounts[index % amounts.length];
}

function createCase(index: number): BatchSimulationCase {
  const scenario = SCENARIOS[index % SCENARIOS.length];

  return {
    id: `BATCH-${Date.now()}-${index + 1}`,
    customer: CUSTOMERS[index % CUSTOMERS.length],
    type: scenario.type,
    amountValue: randomAmount(index),
    reason: scenario.reason,
    confidence: scenario.confidence,
    attempts: scenario.attempts,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function runBatchSimulation(
  count = 50,
): BatchSimulationResult {
  const cases = Array.from(
    { length: count },
    (_, index) => createCase(index),
  );

  const decisions = cases.map((item) =>
    analyzeRecoveryCase(item),
  );

  const totalAtRisk = cases.reduce(
    (sum, item) => sum + item.amountValue,
    0,
  );

  const estimatedRecoverable = decisions.reduce(
    (sum, decision) =>
      sum + decision.estimatedRecoveryAmount,
    0,
  );

  const highConfidence = decisions.filter(
    (decision) => decision.confidence >= 80,
  ).length;

  const needsApproval = decisions.filter(
    (decision) => decision.requiresApproval,
  ).length;

  const autoApproved = decisions.filter(
    (decision) => !decision.requiresApproval,
  ).length;

  const blocked = 0;

  /*
   * Only cases that pass the policy engine are considered
   * simulated recovered revenue.
   */
  const simulatedRecovered = decisions
    .filter((decision) => !decision.requiresApproval)
    .reduce(
      (sum, decision) =>
        sum + decision.estimatedRecoveryAmount,
      0,
    );

  const recoveryRate =
    totalAtRisk > 0
      ? (simulatedRecovered / totalAtRisk) * 100
      : 0;

  const timestamp = new Date().toISOString();

  /*
   * Write audit events for every simulated case.
   */
  const auditRecords: AuditRecord[] = decisions.flatMap(
    (decision, index) => {
      const item = cases[index];

      const analyzed: AuditRecord = {
        id: `${decision.caseId}-analyzed`,
        timestamp,
        caseId: decision.caseId,
        customer: item.customer,
        event: "Case analyzed",
        action: "Batch recovery analysis",
        confidence: decision.confidence,
        approvalStatus: decision.requiresApproval
          ? "Approval required"
          : "Auto-approved",
        amountValue: item.amountValue,
        amount: formatCurrency(item.amountValue),
      };

      const recommended: AuditRecord = {
        id: `${decision.caseId}-recommended`,
        timestamp,
        caseId: decision.caseId,
        customer: item.customer,
        event: "Recovery action recommended",
        action: decision.recommendedAction,
        confidence: decision.confidence,
        approvalStatus: decision.requiresApproval
          ? "Approval required"
          : "Auto-approved",
        amountValue: decision.estimatedRecoveryAmount,
        amount: formatCurrency(
          decision.estimatedRecoveryAmount,
        ),
      };

      return [analyzed, recommended];
    },
  );

  addAuditRecords(auditRecords);

  /*
   * Persist the latest batch summary so the Dashboard
   * can display the result after navigation.
   */
  saveBatchSimulationSummary({
    totalCases: cases.length,
    totalAtRisk,
    estimatedRecoverable,
    highConfidence,
    needsApproval,
    autoApproved,
    blocked,
    simulatedRecovered,
    recoveryRate,
    timestamp,
  });

  return {
    cases,
    decisions,
    totalCases: cases.length,
    totalAtRisk,
    estimatedRecoverable,
    highConfidence,
    needsApproval,
    autoApproved,
    blocked,
    simulatedRecovered,
    recoveryRate,
  };
}