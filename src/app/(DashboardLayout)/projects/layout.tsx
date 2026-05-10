import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Track work for each client and organize deliverables.",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
