import { OverviewDashboard } from "./OverviewDashboard";

/** Coordinates the dashboard entry point; visual sections live in OverviewDashboard. */
export function OverviewPage({ context }: { context: any }) {
  return <OverviewDashboard context={context} />;
}
