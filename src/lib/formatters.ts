export function formatInvoiceDueDate(value: string | null | undefined): string {
  if (value == null || value === "") return "-";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    try {
      const [y, m, d] = trimmed.split("-").map(Number);
      const local = new Date(y, m - 1, d);
      return local.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return trimmed;
    }
  }
  try {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) {
      return trimmed.slice(0, 10);
    }
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return trimmed.slice(0, 10);
  }
}
