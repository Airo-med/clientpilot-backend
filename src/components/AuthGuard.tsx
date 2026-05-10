"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-storage";
import CenteredLoader from "@/components/CenteredLoader";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    if (!getToken()) {
      router.replace(
        `/authentication/login?next=${encodeURIComponent(pathname || "/")}`
      );
    }
  }, [mounted, pathname, router]);

  if (!mounted) {
    return (
      <CenteredLoader fullViewport message="Checking session…" />
    );
  }

  if (!getToken()) {
    return (
      <CenteredLoader fullViewport message="Redirecting…" />
    );
  }

  return <>{children}</>;
}
