import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ClientPilot account.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
