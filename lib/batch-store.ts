export type BatchSimulationSummary = {
  totalCases: number;
  totalAtRisk: number;
  estimatedRecoverable: number;
  highConfidence: number;
  needsApproval: number;
  autoApproved: number;
  blocked: number;
  simulatedRecovered: number;
  recoveryRate: number;
  timestamp: string;
};

const STORAGE_KEY = "recover-ai-latest-batch";

export function saveBatchSimulationSummary(
  summary: BatchSimulationSummary,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(summary),
  );
}

export function getLatestBatchSimulation():
  | BatchSimulationSummary
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as BatchSimulationSummary;
  } catch {
    return null;
  }
}

export function clearBatchSimulationSummary() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}