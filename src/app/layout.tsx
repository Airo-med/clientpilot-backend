import type { ReactNode } from "react";
import type { Metadata } from "next";
import AppThemeProvider from "@/components/AppThemeProvider";
import "./global.css";

export const metadata: Metadata = {
  title: {
    default: "ClientPilot",
    template: "%s · ClientPilot",
  },
  description:
    "ClientPilot helps you run client work: projects, invoices, and revenue in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
