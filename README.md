# RecoverAI 🚀

> ## Find revenue that's slipping away. Win it back.

**RecoverAI** is an AI-powered autonomous revenue recovery agent built for the **Razorpay AI Buildathon — Track 03: AI Revenue Recovery**.

RecoverAI doesn't just tell merchants that revenue is at risk.

It **detects the risk, diagnoses the cause, predicts the chance of recovery, chooses the safest intervention, checks merchant policies, requests approval when necessary, simulates execution, and records every decision in an audit trail.**

---

## 💰 The Problem

Revenue leakage doesn't always look dramatic.

A payment fails because of a temporary bank issue.

A customer's payment method expires.

A high-intent customer abandons checkout.

An invoice becomes overdue.

Individually, these look like small operational problems.

At scale, they become **lost revenue**.

Traditional dashboards can tell merchants:

> "These payments failed."

But merchants still have to figure out:

- Why did it fail?
- Is it worth retrying?
- When should it be retried?
- Should we send a payment link?
- Does this case need human approval?
- How likely are we to recover the money?
- When should we stop trying?
- What actually happened after the intervention?

**RecoverAI turns this from a dashboard problem into an agentic recovery workflow.**

---

# 🤖 What RecoverAI Does

RecoverAI follows a bounded decision loop:

**Detect → Diagnose → Estimate → Recommend → Policy Check → Approve → Execute → Audit → Measure**

For every revenue-risk case, RecoverAI:

1. Detects a revenue-risk event
2. Identifies the most likely root cause
3. Estimates recovery probability
4. Calculates estimated recoverable revenue
5. Recommends the safest recovery action
6. Checks the recommendation against merchant policies
7. Automatically executes eligible actions
8. Routes higher-risk cases to human approval
9. Applies retry and stopping limits
10. Records the complete decision trail
11. Measures recovery performance across a batch

---

# 🧠 The AI Agent

RecoverAI uses **Google Gemini** to reason about each revenue-risk case.

The AI produces a structured decision containing:

### Root Cause

The most likely underlying reason behind the revenue risk.

Examples:

- Temporary bank/network failure
- Expired payment method
- Insufficient funds
- Checkout abandonment
- Overdue invoice

### Recovery Probability

The estimated likelihood that the recommended intervention will recover the payment.

Example:

**₹7,499 at risk**

**Recovery probability: 56%**

**Estimated recovery: ₹4,199**

### Recommended Action

The agent selects the safest appropriate intervention.

Possible actions include:

- Retry payment
- Retry after cooldown
- Request payment method update
- Send payment link
- Send payment-link recovery reminder
- Send payment reminder
- Review recovery options

### Confidence

The AI provides a confidence score for its diagnosis and recommendation.

---

# ⚡ Why This Is an Agent — Not Just AI Analytics

A normal analytics dashboard might say:

> **₹1.2L revenue is at risk.**

RecoverAI goes further:

> **₹3,250 is at risk because of a transient network timeout. Recovery probability: 88%. Recommended action: Retry payment. Policy check: Passed. Execution: Auto-approved.**

That's the difference.

### Detect → Decide → Act → Measure

RecoverAI closes the loop.

The goal is not simply to identify revenue leakage.

The goal is to **recover revenue safely and prove the outcome.**

---

# 🛡️ AI + Deterministic Guardrails

RecoverAI does not allow the AI model to directly control execution.

The architecture deliberately separates **AI reasoning** from **execution policy**.

```text
                    Gemini AI
                       │
                       ▼
             Diagnosis + Recommendation
                       │
                       ▼
              Deterministic Policy
                    Engine
                       │
              ┌────────┴────────┐
              ▼                 ▼
        Auto-approved      Human Approval
              │                 │
              └────────┬────────┘
                       ▼
                Bounded Action
                       │
                       ▼
                  Audit Trail
                       │
                       ▼
                Recovery Metrics
```

---

# 🏗️ Main Architecture

RecoverAI is built around a simple agent architecture:

```text
                    Revenue Risk Events
                           │
                           ▼
                  ┌─────────────────┐
                  │ Risk Detection  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Gemini AI      │
                  │   Reasoning     │
                  └────────┬────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Root Cause    Recovery %    Recommendation
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                  ┌─────────────────┐
                  │ Decision Engine │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Policy / Rules  │
                  └────────┬────────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
           Auto-approved       Human Approval
                 │                   │
                 └─────────┬─────────┘
                           ▼
                  ┌─────────────────┐
                  │ Bounded Action  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Audit Trail   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Recovery Metrics│
                  └─────────────────┘
```

The key architectural decision is that Gemini does not directly control execution.

- Gemini reasons about the case.
- The deterministic policy engine decides whether the recommendation is allowed to execute.

---

## 🔄 End-to-End Workflow

For every revenue-risk case, RecoverAI follows this workflow:

1. Detect
2. Diagnose
3. Estimate recovery probability
4. Recommend recovery action
5. Check merchant policy
6. Auto-approve OR request human approval
7. Execute bounded recovery action
8. Record audit event
9. Measure recovery outcome

This creates a complete:

**Detect → Decide → Act → Measure**

loop.

---

## 🧠 AI Decision Flow

The AI receives structured case information such as:

- Case ID
- Customer
- Event type
- Amount at risk
- Failure / risk reason
- Previous attempts
- Historical confidence

Gemini then produces:

**Root Cause + Recommended Action + Confidence + Recovery Probability**

For example:

```
Case: REC-82820
Amount: ₹3,250
Root Cause: Transient network timeout
Confidence: 93%
Recovery Probability: 88%
Recommended Action: Retry payment
```

The result is then passed to the deterministic recovery engine.

---

## 🛡️ Policy Decision Flow

The policy engine checks whether the AI recommendation is safe to execute.

```text
             AI Recommendation
                     │
                     ▼
              Auto Approval?
                     │
             ┌───────┴───────┐
             ▼               ▼
            Yes              No
             │               │
             ▼               ▼
      Amount Allowed?    Human Approval
             │
       ┌─────┴─────┐
       ▼           ▼
      Yes          No
       │           │
       ▼           ▼
 Confidence     Human Approval
    Valid?
       │
   ┌───┴───┐
   ▼       ▼
  Yes      No
   │       │
   ▼       ▼
Execute   Approval
```

Additional stopping rules prevent unnecessary retries.

---

## 🛑 Stopping Rules

RecoverAI is designed as a **bounded agent**.

The system does not continuously retry payments without limits.

Merchant policies can define:

- Maximum retry attempts
- Minimum AI confidence
- Maximum auto-approval amount
- High-value transaction threshold
- Whether auto-approval is enabled

Examples:

```
Retry attempts exceeded → STOP → Human review
Confidence below threshold → STOP → Human review
High-value case → STOP AUTO-EXECUTION → Human approval
```

This ensures that automation remains controlled.

---

## 👤 Human Approval

RecoverAI includes a human-in-the-loop workflow.

Cases that exceed configured safety boundaries are routed to the **Approvals** page.

The merchant can review:

- Customer
- Amount at risk
- Root cause
- AI confidence
- Recovery probability
- Recommended action
- Reason for approval requirement

The merchant can then approve or reject the proposed recovery action.

This creates a balance between:

**AI Automation + Merchant Control**

---

## ⚙️ Recovery Actions

RecoverAI can recommend different interventions depending on the situation.

| Revenue Risk | Example Intervention |
|---|---|
| Temporary bank failure | Retry payment |
| Network timeout | Retry payment |
| Insufficient funds | Retry after cooldown |
| Expired payment method | Request payment method update |
| Checkout abandonment | Send payment-link recovery reminder |
| Overdue invoice | Send payment reminder |
| Uncertain situation | Review recovery options |

The least aggressive reasonable intervention is preferred.

---

## 📊 Measuring Recovery

RecoverAI separates **potential recovery** from **actual recovery**.

**Revenue at Risk**
The total value exposed across revenue-risk cases.

**Estimated Recoverable Revenue**
The amount that the agent estimates could potentially be recovered.

The calculation is:

```
Estimated Recovery = Amount at Risk × Recovery Probability
```

**Money Recovered**
The value associated with recovery actions that have actually been executed in the demo simulation.

**Recovery Rate**
The percentage of revenue at risk represented by recovered revenue.

This distinction is important because:

> Estimated recovery is not the same as actual recovery.

---

## 📦 Batch Simulation

RecoverAI can process a synthetic batch of revenue-risk cases.

The batch simulator demonstrates how the agent performs across multiple opportunities instead of only one payment.

```text
Synthetic Revenue Cases
          ↓
       AI Analysis
          ↓
    Recovery Decisions
          ↓
     Policy Checks
          ↓
 ┌────────┼─────────┐
 ▼        ▼         ▼
Auto    Approval   Blocked
          │
          ▼
    Simulated Actions
          │
          ▼
   Recovery Metrics
```

The batch results include:

- Total cases analyzed
- Total revenue at risk
- Estimated recoverable revenue
- High-confidence cases
- Cases requiring approval
- Auto-approved cases
- Blocked cases
- Simulated recovered revenue
- Recovery rate

This demonstrates the buildathon requirement to show measured money recovery across a batch.

---

## 🧾 Audit Trail

Every important recovery decision is recorded.

The audit trail contains information such as:

- Case ID
- Customer
- Event
- Action
- Confidence
- Approval Status
- Amount
- Timestamp
- Execution Status

Example:

```
Case: REC-82820
Event: Payment failure
Action: Retry payment
Confidence: 93%
Approval: Auto-approved
Execution: Recovery action executed
```

The audit trail creates a complete chain:

```
Revenue Risk → AI Decision → Policy Decision → Approval → Execution → Recorded Outcome
```

This makes the agent's actions traceable and auditable.

---

## 📈 Demo Results

The current demo uses synthetic revenue-risk data.

Example recovery run:

```
Cases analyzed:          6
High-confidence:         4
Requires approval:       2

Revenue at risk:         ₹1,56,099
Estimated recoverable:   ₹1,22,214

Executed cases:          1
Simulated recovered:     ₹2,860
Recovery rate:           1.8%
```

These numbers are demo simulation results, not production financial results.

The purpose is to demonstrate the complete recovery workflow and measurable recovery outcome.

---

## 🔎 Example: Nimbus Retail

**REC-82820 — Nimbus Retail**

- Amount at risk: ₹3,250
- Root cause: Transient network timeout
- AI confidence: 93%
- Recovery probability: 88%
- Estimated recovery: ₹2,860
- Recommended action: Retry payment
- Policy: Auto-approved

The agent identifies a temporary failure and recommends retrying the payment.

Because the case falls within the merchant's configured policy boundaries, it can be automatically executed in the simulation.

---

## 🔎 Example: Pixelworks Studio

**REC-82854 — Pixelworks Studio**

- Amount at risk: ₹7,499
- Root cause: Insufficient funds
- AI confidence: 72%
- Recovery probability: 56%
- Estimated recovery: ₹4,199
- Recommended action: Retry after cooldown
- Policy: Merchant approval required

Instead of blindly retrying, RecoverAI recommends waiting before retrying.

Because the confidence is lower, the case is routed through the approval workflow.

---

## 🔎 Example: Orbit Systems

**REC-82871 — Orbit Systems**

- Amount at risk: ₹56,000
- Recovery probability: 80%
- Recommended action: Send payment reminder
- Policy: Merchant approval required

The recovery recommendation may be reasonable, but the high transaction value triggers the merchant's safety boundary.

The agent therefore does not automatically execute it.

---

# 🖥️ Product Flow

RecoverAI contains multiple interfaces that represent different stages of the agent workflow.

**Dashboard**
Provides the merchant overview: revenue at risk, recoverable revenue, money recovered, recovery rate, agent activity.

**Recovery**
The main AI-powered recovery workspace. Displays risk cases, AI diagnosis, recovery probability, confidence, recommended action, policy result, execution status.

**Approvals**
Displays cases that require merchant review.

**Batch Simulation**
Runs a larger synthetic recovery experiment and measures the results.

**Audit**
Displays the recovery decision and execution history.

**Settings**
Controls merchant recovery policies and guardrails.

---

# 🧪 Synthetic Data / Demo Simulation

RecoverAI currently uses **synthetic data / demo simulation**.

- The prototype does not use real customer information.
- It does not execute real payment transactions.
- It does not move real money.

The recovery actions shown in the application are simulated to demonstrate the agent workflow safely.

---

# 🔌 Razorpay Integration Architecture

The current version uses synthetic data, but the architecture can later connect to real Razorpay infrastructure.

A future production flow could look like:

```text
             Razorpay Webhooks
                     │
                     ▼
          Revenue Risk Detection
                     │
                     ▼
                RecoverAI
                     │
                     ▼
              Gemini AI Layer
                     │
                     ▼
             Recovery Decision
                     │
                     ▼
              Policy Engine
                     │
              ┌──────┴──────┐
              ▼             ▼
        Auto Approval    Human Approval
              │             │
              └──────┬──────┘
                     ▼
             Razorpay Action
                     │
                     ▼
             Payment Result
                     │
                     ▼
             Audit + Metrics
```

This means the current synthetic execution layer can eventually be replaced by real payment infrastructure.

---

# 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack application framework |
| React | User interface |
| TypeScript | Type-safe application logic |
| Tailwind CSS | Styling |
| shadcn/ui | Interface components |
| Lucide React | Icons |
| Google Gemini | AI reasoning |
| Browser localStorage | Demo state persistence |
| Vercel | Deployment |

---

# 📁 Project Structure

```
recover-ai/
│
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── recovery/
│   │   ├── payments/
│   │   ├── customers/
│   │   ├── audit/
│   │   ├── approvals/
│   │   └── settings/
│   │
│   └── api/
│       └── ai/
│           └── analyze-recovery/
│
├── components/
│   ├── layout/
│   └── ui/
│
├── lib/
│   ├── gemini-recovery.ts
│   ├── recovery-engine.ts
│   ├── recovery-policy.ts
│   ├── recovery-store.ts
│   ├── batch-simulator.ts
│   ├── batch-store.ts
│   └── format.ts
│
├── types/
│   └── index.ts
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

---

# ▶️ How to Run Locally

## Prerequisites

Make sure you have:

- Node.js
- npm
- A Google AI Studio API key

## 1. Clone the Repository

```bash
git clone https://github.com/Ravirajghodake07/recover-ai.git
cd recover-ai
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Gemini

Create a file named `.env.local` and add:

```
GEMINI_API_KEY=your_gemini_api_key
```

Replace the value with your own Gemini API key.

> Never commit `.env.local` to GitHub.

## 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

# 🚀 Demo Instructions

For the best demonstration, follow this sequence:

```
Dashboard → Recovery → Run Recovery → Review Gemini AI decisions
   → Execute an auto-approved case → Open an approval-required case
   → Approvals → Batch Simulation → Audit → Dashboard
```

This demonstrates the complete:

**Detect → Diagnose → Recommend → Guardrail → Approve → Execute → Audit → Measure**

workflow.

---

