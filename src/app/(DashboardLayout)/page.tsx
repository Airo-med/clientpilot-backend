import type { Metadata } from "next";
import DashboardHome from "./DashboardHome";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Revenue, workload, and quick shortcuts for your ClientPilot workspace.",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
