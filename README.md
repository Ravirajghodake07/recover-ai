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