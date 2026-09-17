# RecoverAI 🚀

**Find revenue that's slipping away. Win it back.**

An AI-powered autonomous revenue recovery agent built for the **Razorpay AI Buildathon — Track 03: AI Revenue Recovery**.

🔗 [Live Demo](https://recover-ai-raviraj1.vercel.app)

---

## The Problem

Failed payments, expired cards, abandoned checkouts, overdue invoices — individually small, collectively significant revenue loss.

Dashboards tell merchants *"these payments failed."* They don't answer: Why? Is it worth retrying? When? Does this need approval? How likely is recovery? When do we stop?

RecoverAI turns that dashboard problem into an **agentic recovery workflow**.

---

## What It Does

```
Detect → Diagnose → Estimate → Recommend → Policy Check → Approve → Execute → Audit → Measure
```

For each revenue-risk case, the agent identifies the root cause, estimates recovery probability and recoverable value, recommends the least aggressive reasonable action, checks it against merchant policy, auto-executes or routes for approval, and records everything.

**Analytics says:** ₹1.2L is at risk.
**RecoverAI says:** ₹3,250 is at risk due to a transient network timeout. Recovery probability 88%. Action: retry payment. Policy: passed. Execution: auto-approved.

---

## Architecture

```
        Revenue Risk Events
                │
                ▼
         Gemini AI Reasoning
   (root cause · probability · action · confidence)
                │
                ▼
     Deterministic Policy Engine
          ┌─────┴─────┐
          ▼           ▼
    Auto-approved  Human Approval
          └─────┬─────┘
                ▼
         Bounded Action
                ▼
      Audit Trail → Metrics
```

**Key decision:** Gemini reasons; it never controls execution. A deterministic policy engine decides what is allowed to run.

---

## Guardrails

Merchant-configurable policies bound the agent:

- Maximum retry attempts
- Minimum AI confidence threshold
- Maximum auto-approval amount
- High-value transaction threshold
- Auto-approval on/off

Retries exhausted, low confidence, or high value → stop auto-execution, route to the **Approvals** page for human review.

---

## Recovery Actions

| Revenue Risk | Intervention |
|---|---|
| Temporary bank failure / network timeout | Retry payment |
| Insufficient funds | Retry after cooldown |
| Expired payment method | Request payment method update |
| Checkout abandonment | Send payment-link reminder |
| Overdue invoice | Send payment reminder |
| Uncertain | Review recovery options |

---

## Measuring Recovery

- **Revenue at Risk** — total exposed value
- **Estimated Recoverable** — `Amount at Risk × Recovery Probability`
- **Money Recovered** — value of actions actually executed in simulation
- **Recovery Rate** — recovered ÷ at risk

Estimated recovery ≠ actual recovery. The distinction is deliberate.

**Example run:** 6 cases · ₹1,56,099 at risk · ₹1,22,214 estimated recoverable · 4 high-confidence · 2 needing approval · ₹2,860 recovered (simulated).

### Sample Cases

| Case | Amount | Root Cause | Conf. | Action | Policy |
|---|---|---|---|---|---|
| REC-82820 Nimbus Retail | ₹3,250 | Transient network timeout | 93% | Retry payment | Auto-approved |
| REC-82854 Pixelworks Studio | ₹7,499 | Insufficient funds | 72% | Retry after cooldown | Approval required |
| REC-82871 Orbit Systems | ₹56,000 | — | — | Send payment reminder | Approval required (high value) |

---

## Product Surfaces

**Dashboard** overview · **Recovery** AI workspace · **Approvals** human-in-the-loop · **Batch Simulation** multi-case run · **Audit** full decision history · **Settings** policies and guardrails

---

## ⚠️ Synthetic Data

This prototype uses synthetic data only. No real customer information, no real transactions, no real money. Execution is simulated. The architecture is designed so the simulated execution layer can later be replaced by real Razorpay webhooks and payment APIs.

---

## Tech Stack

Next.js · React · TypeScript · Tailwind CSS · shadcn/ui · Lucide React · Google Gemini · Vercel

Core logic lives in `lib/`: `gemini-recovery.ts`, `recovery-engine.ts`, `recovery-policy.ts`, `recovery-store.ts`, `batch-simulator.ts`.

---

## Run Locally

```bash
git clone https://github.com/Ravirajghodake07/recover-ai.git
cd recover-ai
npm install
```

Create `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

Open http://localhost:3000. Never commit `.env.local`.

---

## Demo Path

`Dashboard → Recovery → Run Recovery → execute an auto-approved case → open an approval-required case → Approvals → Batch Simulation → Audit → Dashboard`
