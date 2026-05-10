import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription",
  description: "View your plan usage and manage your ClientPilot subscription.",
};

export default function SubscriptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
