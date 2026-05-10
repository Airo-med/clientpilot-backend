import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your ClientPilot account to manage clients and billing.",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
