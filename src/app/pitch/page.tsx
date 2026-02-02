import { Cover } from "./sections/cover";
import { MacroShift } from "./sections/macro-shift";
import { LinearTrap } from "./sections/linear-trap";
import { PainPoints } from "./sections/pain-points";
import { Consulting } from "./sections/consulting";
import { Orchestration } from "./sections/orchestration";
import { Interfaces } from "./sections/interfaces";
import { AIValidation } from "./sections/ai-validation";
import { GlobalGrid } from "./sections/global-grid";
import { ValueEquation } from "./sections/value-equation";
import { Engagement } from "./sections/engagement";
import { Roadmap } from "./sections/roadmap";
import { ImprovementCycle } from "./sections/improvement-cycle";
import { Team } from "./sections/team";
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
      <LinearTrap />
      <PainPoints />
      <Consulting />
      <Orchestration />
      <Interfaces />
      <AIValidation />
      <GlobalGrid />
      <ValueEquation />
      <Engagement />
      <Roadmap />
      <ImprovementCycle />
      <Team />
      <PitchCTA />
    </PitchShell>
  );
}
