import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Create invoices, track payments, and download PDFs.",
};

export default function InvoicesLayout({ children }: { children: ReactNode }) {
  return children;
}
