"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleDossier({ role }: { role: Role | undefined }) {
  const [revealed, setRevealed] = useState(false);
  if (!role) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-black/30 p-5 text-sm text-mutedForeground">
        Awaiting role assignment from the game master.
      </div>
    );
  }
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-card/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge tone="accent">Your dossier</Badge>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{role.name}</h2>
          <p className="text-sm text-mutedForeground">{role.archetype}</p>
        </div>
      </div>
      <Section label="Public brief — everyone can read this">
        <p className="text-sm leading-relaxed text-foreground/90">{role.publicBrief}</p>
      </Section>
      <Section label="Secret goal — burn before sharing">
        <p
          className={cn(
            "text-sm leading-relaxed transition",
            revealed ? "text-foreground" : "select-none blur-[5px] text-foreground/70"
          )}
        >
          {role.secretGoal}
        </p>
      </Section>
      <Section label="Hidden leverage">
        <p
          className={cn(
            "text-sm leading-relaxed transition",
            revealed ? "text-accent" : "select-none blur-[5px] text-accent/70"
          )}
        >
          {role.hiddenLeverage}
        </p>
      </Section>
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-mutedForeground">
          {revealed ? "Visible to you only" : "Hidden — hover to reveal"}
        </p>
        <Button
          size="sm"
          variant={revealed ? "subtle" : "outline"}
          onClick={() => setRevealed((r) => !r)}
        >
          {revealed ? "Hide" : "Reveal"}
        </Button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-mutedForeground">{label}</p>
      {children}
    </div>
  );
}
