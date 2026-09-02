export type AuditEventType =
  | "Case analyzed"
  | "Root cause identified"
  | "Recovery action recommended"
  | "Approval required"
  | "Auto-approval eligible"
  | "Recovery action executed"
  | "Recovery action blocked";

export type AuditRecord = {
  id: string;
  timestamp: string;
  caseId: string;
  customer: string;
  event: AuditEventType;
  action: string;
  confidence: number;
  approvalStatus: "Auto-approved" | "Approval required" | "Blocked";
  amountValue: number;
  amount: string;
};

const STORAGE_KEY = "recover-ai-audit";

export function getAuditRecords(): AuditRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored) as AuditRecord[];
  } catch {
    return [];
  }
}

export function saveAuditRecords(records: AuditRecord[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addAuditRecords(records: AuditRecord[]) {
  const existing = getAuditRecords();

  saveAuditRecords([...existing, ...records]);
}

export function clearAuditRecords() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
}

export type StoredCaseStatus =
  | "High confidence"
  | "Needs approval"
  | "Queued";

export type StoredCase = {
  id: string;
  customer: string;
  type: string;
  amount: string;
  amountValue: number;
  recoveryProbability: number;
  reason: string;
  confidence: number;
  status: StoredCaseStatus;
  recommendation: string;
  description: string;
  attempts: number;
  executed: boolean;
  executedAt?: string;
  blocked?: boolean;
  estimatedRecoveryAmount: number;
};

const CASES_STORAGE_KEY = "recover-ai-cases";

export function getStoredCases(): StoredCase[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CASES_STORAGE_KEY);

    if (!stored) return [];

    return JSON.parse(stored) as StoredCase[];
  } catch {
    return [];
  }
}

export function saveStoredCases(cases: StoredCase[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    CASES_STORAGE_KEY,
    JSON.stringify(cases),
  );
}

export function updateCase(
  id: string,
  patch: Partial<StoredCase>,
): StoredCase | undefined {
  const cases = getStoredCases();

  const index = cases.findIndex(
    (item) => item.id === id,
  );

  if (index === -1) return undefined;

  const updated = {
    ...cases[index],
    ...patch,
  };

  cases[index] = updated;

  saveStoredCases(cases);

  return updated;
}

export type RecoveryStats = {
  totalCases: number;
  executed: number;
  needsApproval: number;
  highConfidence: number;
  queued: number;

  totalAtRisk: number;
  estimatedRecoverable: number;
  actualRecovered: number;

  recoveryRate: number;
  auditCount: number;
};

export function getRecoveryStats(): RecoveryStats {
  const cases = getStoredCases();

  const executedCases = cases.filter(
    (item) => item.executed,
  );

  const blockedCases = cases.filter(
    (item) => item.blocked,
  );

  const unresolvedCases = cases.filter(
    (item) => !item.executed && !item.blocked,
  );

  const needsApproval = cases.filter(
    (item) =>
      item.status === "Needs approval" &&
      !item.executed &&
      !item.blocked,
  ).length;

  const highConfidence = cases.filter(
    (item) =>
      item.status === "High confidence" &&
      !item.executed &&
      !item.blocked,
  ).length;

  const queued = cases.filter(
    (item) =>
      item.status === "Queued" &&
      !item.executed &&
      !item.blocked,
  ).length;

  const totalAtRisk = unresolvedCases.reduce(
    (sum, item) => sum + item.amountValue,
    0,
  );

  const estimatedRecoverable = unresolvedCases.reduce(
    (sum, item) =>
      sum + (item.estimatedRecoveryAmount || 0),
    0,
  );

  const actualRecovered = executedCases.reduce(
    (sum, item) =>
      sum + (item.estimatedRecoveryAmount || 0),
    0,
  );

  const totalRecoverableExposure =
    totalAtRisk + actualRecovered;

  const recoveryRate =
    totalRecoverableExposure > 0
      ? (actualRecovered / totalRecoverableExposure) * 100
      : 0;

  return {
    totalCases: cases.length,

    executed: executedCases.length,

    needsApproval,

    highConfidence,

    queued,

    totalAtRisk,

    estimatedRecoverable,

    actualRecovered,

    recoveryRate,

    auditCount: getAuditRecords().length,
  };
}