import type { RecoveryPriority } from "@/lib/recovery-engine";

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

export type CustomerStatus = "Active" | "At risk" | "Recovered";

export type Customer = {
  id: string;
  name: string;
  email: string;
  status: CustomerStatus;
  totalPaid: number;
  totalAtRisk: number;
  totalRecovered: number;
  createdAt: string;
};

export type PaymentStatus =
  | "Paid"
  | "Failed"
  | "Overdue"
  | "Abandoned"
  | "Recovered"
  | "Blocked";

export type Payment = {
  id: string;
  customerId: string;
  amountValue: number;
  amount: string;
  status: PaymentStatus;
  failureReason: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  recoveryCaseId?: string;
};

export type StoredCaseStatus = "High confidence" | "Needs approval" | "Queued";

export type StoredCase = {
  id: string;
  customerId: string;
  customer: string;
  paymentId: string;
  type: string;
  amount: string;
  amountValue: number;
  reason: string;
  confidence: number;
  recoveryProbability: number;
  rootCause: string;
  status: StoredCaseStatus;
  recommendation: string;
  description: string;
  attempts: number;
  priority: RecoveryPriority;
  requiresApproval: boolean;
  executed: boolean;
  executedAt?: string;
  blocked?: boolean;
  estimatedRecoveryAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalRecord = {
  caseId: string;
  customerId: string;
  paymentId: string;
  status: "Pending" | "Approved" | "Rejected";
};
