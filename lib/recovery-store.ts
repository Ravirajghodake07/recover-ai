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
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as AuditRecord[];
  } catch {
    return [];
  }
}

export function saveAuditRecords(records: AuditRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addAuditRecords(records: AuditRecord[]) {
  const existing = getAuditRecords();

  saveAuditRecords([...existing, ...records]);
}

export function clearAuditRecords() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}