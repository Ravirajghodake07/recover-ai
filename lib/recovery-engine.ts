import {
  checkApprovalStatus,
  getPolicy,
  type RecoveryPolicy,
} from "@/lib/recovery-policy";

export type RecoveryCaseInput = {
  id: string;
  type: string;
  amountValue: number;
  reason: string;
  confidence: number;
  attempts: number;
};

export type RecoveryPriority = "Low" | "Medium" | "High" | "Critical";

export type RecoveryDecision = {
  caseId: string;
  confidence: number;
  recoveryProbability: number;
  rootCause: string;
  recommendedAction: string;
  reason: string;
  requiresApproval: boolean;
  estimatedRecoveryAmount: number;
  priority: RecoveryPriority;
};

type RecoveryRule = {
  rootCause: string;
  recommendedAction: string;
  confidence: number;
  recoveryProbability: number;
  reason: string;
};

function clamp(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

function toNonNegativeNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function getRule(caseData: RecoveryCaseInput): RecoveryRule {
  const type = caseData.type.toLowerCase();
  const reason = caseData.reason.toLowerCase();

  if (reason.includes("temporary bank") || reason.includes("network timeout")) {
    return {
      rootCause: "Temporary payment processing issue",
      recommendedAction: "Retry payment",
      confidence: 92,
      recoveryProbability: 88,
      reason:
        "The failure appears transient, so a controlled retry is likely to succeed.",
    };
  }

  if (reason.includes("expired") || reason.includes("payment method")) {
    return {
      rootCause: "Expired or invalid payment method",
      recommendedAction: "Request payment method update",
      confidence: 91,
      recoveryProbability: 84,
      reason:
        "The customer needs to provide a valid payment method before collection can resume.",
    };
  }

  if (reason.includes("insufficient funds")) {
    return {
      rootCause: "Insufficient available funds",
      recommendedAction:
        caseData.attempts > 0 ? "Send payment link" : "Retry after cooldown",
      confidence: 78,
      recoveryProbability: 62,
      reason:
        "Waiting before the next attempt or offering a payment link reduces the risk of another immediate decline.",
    };
  }

  if (type.includes("checkout abandonment") || reason.includes("abandonment")) {
    return {
      rootCause: "High-intent checkout abandonment",
      recommendedAction: "Send payment-link recovery reminder",
      confidence: 85,
      recoveryProbability: 76,
      reason:
        "The customer reached checkout, indicating purchase intent that a timely reminder can recover.",
    };
  }

  if (type.includes("overdue invoice") || reason.includes("overdue")) {
    return {
      rootCause: "Overdue invoice",
      recommendedAction: "Send payment reminder",
      confidence: 80,
      recoveryProbability: 68,
      reason:
        "A measured reminder is appropriate before the invoice is escalated.",
    };
  }

  if (type.includes("payment failure")) {
    return {
      rootCause: "Payment failure",
      recommendedAction: "Send payment link",
      confidence: 76,
      recoveryProbability: 64,
      reason:
        "A payment link gives the customer a reliable path to complete the outstanding payment.",
    };
  }

  return {
    rootCause: caseData.reason,
    recommendedAction: "Review recovery options",
    confidence: 70,
    recoveryProbability: 55,
    reason:
      "The available case details do not match a specialized recovery pattern, so review is recommended.",
  };
}

function getPriority(
  amountValue: number,
  estimatedRecoveryAmount: number,
  recoveryProbability: number,
  highValueThreshold: number,
): RecoveryPriority {
  if (amountValue >= highValueThreshold) {
    return "Critical";
  }

  if (estimatedRecoveryAmount >= 20_000 || recoveryProbability >= 85) {
    return "High";
  }

  if (estimatedRecoveryAmount >= 5_000 || recoveryProbability >= 60) {
    return "Medium";
  }

  return "Low";
}

/**
 * Produces a deterministic recovery recommendation from a recovery case.
 * The input is structural, so the page's existing RecoveryCase values can be
 * passed directly without coupling this engine to UI-specific fields.
 */
export function analyzeRecoveryCase(
  caseData: RecoveryCaseInput,
  policy?: RecoveryPolicy,
): RecoveryDecision {
  const currentPolicy = policy ?? getPolicy();
  const normalizedAmount = toNonNegativeNumber(caseData.amountValue);
  const normalizedAttempts = toNonNegativeNumber(caseData.attempts);
  const rule = getRule({ ...caseData, attempts: normalizedAttempts });
  const historicalConfidence = clamp(caseData.confidence);
  const repeatPenalty = normalizedAttempts * 7;
  const confidence = Math.round(
    clamp(rule.confidence * 0.7 + historicalConfidence * 0.3 - repeatPenalty),
  );
  const recoveryProbability = Math.round(
    clamp(rule.recoveryProbability - normalizedAttempts * 9),
  );
  const estimatedRecoveryAmount = Math.round(
    normalizedAmount * (recoveryProbability / 100),
  );
  const approval = checkApprovalStatus(
    normalizedAmount,
    confidence,
    normalizedAttempts,
    currentPolicy,
  );
  const requiresApproval = approval.requiresApproval;
  const reason = requiresApproval
    ? `${rule.reason} ${approval.reason}.`
    : rule.reason;

  return {
    caseId: caseData.id,
    confidence,
    recoveryProbability,
    rootCause: rule.rootCause,
    recommendedAction: rule.recommendedAction,
    reason,
    requiresApproval,
    estimatedRecoveryAmount,
    priority: getPriority(
      normalizedAmount,
      estimatedRecoveryAmount,
      recoveryProbability,
      currentPolicy.highValueThreshold,
    ),
  };
}
