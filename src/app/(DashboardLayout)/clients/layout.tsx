import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage client contacts and link them to projects and invoices.",
};

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return children;
}
