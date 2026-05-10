import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
        background: "#f0f4f9",
        color: "#2a3547",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
        Page not found
      </h1>
      <p style={{ margin: 0, opacity: 0.8, textAlign: "center" }}>
        The link may be broken or the page was removed.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "0.6rem 1.25rem",
          background: "#5d87ff",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
