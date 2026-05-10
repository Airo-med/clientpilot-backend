import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Sign in or manage your ClientPilot account.",
};

export default function AuthenticationSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
