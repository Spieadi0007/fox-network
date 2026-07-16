import { Cover } from "./sections/cover";
import { MacroShift } from "./sections/macro-shift";
import { LinearTrap } from "./sections/linear-trap";
import { PainPoints } from "./sections/pain-points";
import { NetworkModel } from "./sections/network-model";

import { Orchestration } from "./sections/orchestration";
import { Interfaces } from "./sections/interfaces";
import { AIValidation } from "./sections/ai-validation";

import { Engagement } from "./sections/engagement";
import { ImprovementCycle } from "./sections/improvement-cycle";

import { PitchCTA } from "./sections/pitch-cta";
import { PitchShell } from "./pitch-shell";

export const metadata = {
  title: "FoxNetwork — Pitch Deck",
  description: "The Operating System for Physical Infrastructure. From fragmented field execution to a globally orchestrated digital grid.",
};

export default function PitchPage() {
  return (
    <PitchShell>
      <Cover />
      <MacroShift />
      <PainPoints />
      <NetworkModel />

      <Orchestration />
      <Interfaces />
      <AIValidation />
      <LinearTrap />

      <Engagement />
      <ImprovementCycle />

      <PitchCTA />
    </PitchShell>
  );
}
