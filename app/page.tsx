import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-6">
        <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
          RecoverAI
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          RecoverAI
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Autonomous revenue recovery for modern businesses.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard">Open Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
