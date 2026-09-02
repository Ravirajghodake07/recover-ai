"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Sliders,
  DollarSign,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { getPolicy, savePolicy, resetPolicy, type RecoveryPolicy } from "@/lib/recovery-policy";

export default function SettingsPage() {
  const [policy, setPolicy] = useState<RecoveryPolicy | null>(null);
  const [saved, setSaved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);
      setPolicy(getPolicy());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (policy) {
      savePolicy(policy);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = () => {
    resetPolicy();
    setPolicy(getPolicy());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isMounted || !policy) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Recovery Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure auto-recovery policies and guardrails
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-secondary"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {saved ? (
              <>
                <CheckCircle2 className="size-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-approval Toggle */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-approval</h3>
                <p className="text-sm text-muted-foreground">
                  Allow RecoverAI to automatically execute recovery actions
                </p>
              </div>
              <button
                onClick={() =>
                  setPolicy({ ...policy, autoApprovalEnabled: !policy.autoApprovalEnabled })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  policy.autoApprovalEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`block size-5 rounded-full bg-white transition-transform ${
                    policy.autoApprovalEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {!policy.autoApprovalEnabled && (
              <p className="mt-2 text-xs text-amber-400">
                ⚠️ Auto-approval is disabled. All actions will require manual approval.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Policy Sliders */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sliders className="size-5" />
          </div>
          <div>
            <h3 className="font-medium">Policy Controls</h3>
            <p className="text-sm text-muted-foreground">
              Adjust thresholds and limits
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Auto-approval Amount</label>
              <span className="text-sm font-medium">₹{policy.maxAutoApprovalAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={policy.maxAutoApprovalAmount}
              onChange={(e) =>
                setPolicy({ ...policy, maxAutoApprovalAmount: parseInt(e.target.value) })
              }
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>₹10,000</span>
              <span>₹200,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium">Minimum Confidence Threshold</label>
              <span className="text-sm font-medium">{policy.minConfidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={policy.minConfidenceThreshold}
              onChange={(e) =>
                setPolicy({ ...policy, minConfidenceThreshold: parseInt(e.target.value) })
              }
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Retry Attempts</label>
              <span className="text-sm font-medium">{policy.maxRetryAttempts}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={policy.maxRetryAttempts}
              onChange={(e) =>
                setPolicy({ ...policy, maxRetryAttempts: parseInt(e.target.value) })
              }
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1 attempt</span>
              <span>5 attempts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-5" />
          </div>
          <div>
            <h3 className="font-medium">Policy Summary</h3>
            <p className="text-sm text-muted-foreground">
              Current recovery policy overview
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Auto-approval</p>
            <p className="mt-1 font-medium">
              {policy.autoApprovalEnabled ? "✅ Enabled" : "❌ Disabled"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Max Amount</p>
            <p className="mt-1 font-medium">₹{policy.maxAutoApprovalAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Min Confidence</p>
            <p className="mt-1 font-medium">{policy.minConfidenceThreshold}%</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Max Retries</p>
            <p className="mt-1 font-medium">{policy.maxRetryAttempts}</p>
          </div>
        </div>
      </section>
    </div>
  );
}