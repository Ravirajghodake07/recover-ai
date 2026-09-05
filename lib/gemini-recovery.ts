import { GoogleGenAI } from "@google/genai";

export type GeminiRecoveryInput = {
  id: string;
  customer: string;
  type: string;
  amountValue: number;
  reason: string;
  attempts: number;
  historicalConfidence: number;
};

export type GeminiRecoveryAnalysis = {
  rootCause: string;
  recommendedAction: string;
  reason: string;
  confidence: number;
  recoveryProbability: number;
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({
    apiKey,
  });
}

const recoverySchema = {
  type: "object",
  properties: {
    rootCause: {
      type: "string",
      description:
        "The most likely underlying cause of the revenue risk.",
    },
    recommendedAction: {
      type: "string",
      enum: [
        "Retry payment",
        "Retry after cooldown",
        "Request payment method update",
        "Send payment link",
        "Send payment-link recovery reminder",
        "Send payment reminder",
        "Review recovery options",
      ],
      description:
        "The safest recovery intervention for this case.",
    },
    reason: {
      type: "string",
      description:
        "Short explanation of why this intervention is appropriate.",
    },
    confidence: {
      type: "number",
      description:
        "Confidence in the diagnosis and recommendation, from 0 to 100.",
    },
    recoveryProbability: {
      type: "number",
      description:
        "Estimated probability that the recommended intervention will recover the payment, from 0 to 100.",
    },
  },
  required: [
    "rootCause",
    "recommendedAction",
    "reason",
    "confidence",
    "recoveryProbability",
  ],
};

function clamp(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function normalizeAnalysis(
  analysis: GeminiRecoveryAnalysis,
): GeminiRecoveryAnalysis {
  return {
    rootCause: analysis.rootCause?.trim() || "Payment risk detected",
    recommendedAction:
      analysis.recommendedAction?.trim() || "Review recovery options",
    reason:
      analysis.reason?.trim() ||
      "The AI could not determine a more specific recovery explanation.",
    confidence: Math.round(clamp(analysis.confidence)),
    recoveryProbability: Math.round(
      clamp(analysis.recoveryProbability),
    ),
  };
}

export async function analyzeWithGemini(
  caseData: GeminiRecoveryInput,
): Promise<GeminiRecoveryAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
You are RecoverAI, an autonomous revenue recovery agent for merchants.

Your job is to analyze a payment or revenue-risk event and recommend the safest
bounded recovery intervention.

You are NOT allowed to execute payments.
You only diagnose the situation and recommend an intervention.

Merchant recovery policy:
- Avoid unnecessary retries.
- Respect previous retry attempts.
- High-value cases may require human approval.
- Prefer the least aggressive intervention that has a reasonable chance of recovery.
- Never invent customer facts that are not present in the case.

Case:
- Case ID: ${caseData.id}
- Customer: ${caseData.customer}
- Event type: ${caseData.type}
- Amount at risk: ₹${caseData.amountValue}
- Failure/revenue-risk reason: ${caseData.reason}
- Previous attempts: ${caseData.attempts}
- Historical confidence: ${caseData.historicalConfidence}%

Analyze the case and return:
1. The most likely root cause.
2. The best recovery intervention.
3. A concise explanation.
4. Confidence from 0-100.
5. Recovery probability from 0-100.

Be conservative with confidence and recovery probability.
Do not claim that money has already been recovered.
`;

  const ai = getGeminiClient();
const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recoverySchema,
      temperature: 0.2,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed: GeminiRecoveryAnalysis;

  try {
    parsed = JSON.parse(response.text) as GeminiRecoveryAnalysis;
  } catch {
    throw new Error("Gemini returned invalid structured output.");
  }

  return normalizeAnalysis(parsed);
}