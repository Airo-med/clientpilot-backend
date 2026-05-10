import type { SubscriptionInfo } from "@/lib/api";
import type { StoredUser } from "@/lib/auth-storage";

function isAdmin(user: StoredUser | null): boolean {
  return user?.role === "admin";
}

export function isProPlan(info: SubscriptionInfo | null): boolean {
  if (!info?.subscriptionStatus) return false;
  return String(info.subscriptionStatus).toLowerCase() === "pro";
}

function underPlanCap(used: number, max: number | null): boolean {
  if (max === null) return true;
  const u = Number(used);
  const m = Number(max);
  if (!Number.isFinite(u) || !Number.isFinite(m)) return false;
  return u < m;
}

export function canCreateClients(
  info: SubscriptionInfo | null,
  _user: StoredUser | null,
  localTotalCount?: number
): boolean {
  if (!info) return false;
  if (isProPlan(info)) return true;
  const { max, used } = info.limits.clients;
  if (max === null) return true;
  const effUsed =
    localTotalCount === undefined ? Number(used) : localTotalCount;
  return underPlanCap(effUsed, max);
}

export function canCreateInvoices(
  info: SubscriptionInfo | null,
  _user: StoredUser | null,
  localTotalCount?: number
): boolean {
  if (!info) return false;
  if (isProPlan(info)) return true;
  const { max, used } = info.limits.invoices;
  if (max === null) return true;
  const effUsed =
    localTotalCount === undefined ? Number(used) : localTotalCount;
  return underPlanCap(effUsed, max);
}

export function canCreateProjects(
  info: SubscriptionInfo | null,
  _user: StoredUser | null,
  localTotalCount?: number
): boolean {
  if (!info) return false;
  if (isProPlan(info)) return true;
  const { max, used } = info.limits.projects;
  if (max === null) return true;
  const effUsed =
    localTotalCount === undefined ? Number(used) : localTotalCount;
  return underPlanCap(effUsed, max);
}

export function canDownloadInvoicePdf(
  info: SubscriptionInfo | null,
  user: StoredUser | null
): boolean {
  if (isAdmin(user)) return true;
  return isProPlan(info);
}
