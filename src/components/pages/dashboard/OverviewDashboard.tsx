import { OverviewMetrics } from "./overview/OverviewMetrics";
import { OverviewVisuals } from "./overview/OverviewVisuals";
import { OverviewControls } from "./overview/OverviewControls";

/** Dashboard coordinator. Data preparation and visual sections are kept outside this entry point. */
export function OverviewDashboard({ context }: { context: any }) {
  return <>
    <OverviewControls context={context} />
    <OverviewMetrics context={context} />
    <OverviewVisuals context={context} />
  </>;
}
