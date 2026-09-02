// lib/recovery-policy.ts
export type RecoveryPolicy = {
  autoApprovalEnabled: boolean;
  maxAutoApprovalAmount: number;
  minConfidenceThreshold: number;
  maxRetryAttempts: number;
  highValueThreshold: number;
};

const DEFAULT_POLICY: RecoveryPolicy = {
  autoApprovalEnabled: true,
  maxAutoApprovalAmount: 50000,
  minConfidenceThreshold: 80,
  maxRetryAttempts: 2,
  highValueThreshold: 50000,
};

const POLICY_STORAGE_KEY = "recover-ai-policy";

export function getPolicy(): RecoveryPolicy {
  if (typeof window === "undefined") {
    return DEFAULT_POLICY;
  }

  try {
    const stored = window.localStorage.getItem(POLICY_STORAGE_KEY);
    if (!stored) return DEFAULT_POLICY;
    return { ...DEFAULT_POLICY, ...JSON.parse(stored) } as RecoveryPolicy;
  } catch {
    return DEFAULT_POLICY;
  }
}

export function savePolicy(policy: RecoveryPolicy): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(policy));
}

export function resetPolicy(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(POLICY_STORAGE_KEY);
}

export function checkApprovalStatus(
  amountValue: number,
  confidence: number,
  attempts: number,
  policy?: RecoveryPolicy,
): { requiresApproval: boolean; reason: string } {
  const currentPolicy = policy ?? getPolicy();

  if (!currentPolicy.autoApprovalEnabled) {
    return {
      requiresApproval: true,
      reason: "Auto-approval is disabled in settings",
    };
  }

  if (amountValue >= currentPolicy.highValueThreshold) {
    return {
      requiresApproval: true,
      reason: `Amount meets the high-value threshold of ₹${currentPolicy.highValueThreshold.toLocaleString()}`,
    };
  }

  if (amountValue > currentPolicy.maxAutoApprovalAmount) {
    return {
      requiresApproval: true,
      reason: `Amount exceeds auto-approval limit of ₹${currentPolicy.maxAutoApprovalAmount.toLocaleString()}`,
    };
  }

  if (confidence < currentPolicy.minConfidenceThreshold) {
    return {
      requiresApproval: true,
      reason: `Confidence below minimum threshold of ${currentPolicy.minConfidenceThreshold}%`,
    };
  }

  if (attempts >= currentPolicy.maxRetryAttempts) {
    return {
      requiresApproval: true,
      reason: `Retry limit exceeded (${currentPolicy.maxRetryAttempts} attempts)`,
    };
  }

  return {
    requiresApproval: false,
    reason: "All policy checks passed",
  };
}