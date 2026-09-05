import { NextResponse } from "next/server";
import {
  analyzeWithGemini,
  type GeminiRecoveryInput,
} from "@/lib/gemini-recovery";
import {
  analyzeRecoveryCase,
  type RecoveryDecision,
} from "@/lib/recovery-engine";

type RequestBody = GeminiRecoveryInput;

function isValidRequest(body: unknown): body is RequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const value = body as Record<string, unknown>;

  return (
    typeof value.id === "string" &&
    typeof value.customer === "string" &&
    typeof value.type === "string" &&
    typeof value.amountValue === "number" &&
    typeof value.reason === "string" &&
    typeof value.attempts === "number" &&
    typeof value.historicalConfidence === "number"
  );
}

function mergeAiDecision(
  input: RequestBody,
  aiAnalysis: Awaited<ReturnType<typeof analyzeWithGemini>>,
): RecoveryDecision {
  /*
   * The deterministic recovery engine remains the safety layer.
   *
   * Gemini supplies the diagnosis/recommendation.
   * The existing engine calculates policy approval,
   * estimated recovery, priority, and retry safeguards.
   */

  const baseDecision = analyzeRecoveryCase({
    id: input.id,
    type: input.type,
    amountValue: input.amountValue,
    reason: input.reason,
    confidence: input.historicalConfidence,
    attempts: input.attempts,
  });

  const confidence = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        aiAnalysis.confidence * 0.7 +
          input.historicalConfidence * 0.3 -
          input.attempts * 7,
      ),
    ),
  );

  const recoveryProbability = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        aiAnalysis.recoveryProbability -
          input.attempts * 9,
      ),
    ),
  );

  const estimatedRecoveryAmount = Math.round(
    input.amountValue * (recoveryProbability / 100),
  );

  /*
   * Re-run the existing policy engine by feeding the AI-derived
   * confidence into the deterministic engine.
   *
   * This prevents the LLM from bypassing merchant guardrails.
   */
  const policyDecision = analyzeRecoveryCase({
    id: input.id,
    type: input.type,
    amountValue: input.amountValue,
    reason: input.reason,
    confidence,
    attempts: input.attempts,
  });

  return {
    ...baseDecision,
    confidence,
    recoveryProbability,
    rootCause: aiAnalysis.rootCause,
    recommendedAction: aiAnalysis.recommendedAction,
    reason: policyDecision.requiresApproval
      ? `${aiAnalysis.reason} ${policyDecision.reason.split(".").slice(-1)[0]?.trim() ?? ""}`.trim()
      : aiAnalysis.reason,
    requiresApproval: policyDecision.requiresApproval,
    estimatedRecoveryAmount,
    priority: policyDecision.priority,
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isValidRequest(body)) {
      return NextResponse.json(
        {
          error: "Invalid recovery case.",
        },
        {
          status: 400,
        },
      );
    }

    const aiAnalysis = await analyzeWithGemini(body);

    const decision = mergeAiDecision(
      body,
      aiAnalysis,
    );

    return NextResponse.json({
      success: true,
      provider: "Gemini",
      model: "gemini-3.6-flash",
      decision,
      aiAnalysis,
    });
  } catch (error) {
  console.error("Gemini recovery API error:", error);

  return NextResponse.json(
    {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    },
    { status: 500 },
  );
}
}