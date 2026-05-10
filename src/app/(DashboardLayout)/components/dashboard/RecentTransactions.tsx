"use client";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Typography, Box, Stack, Divider } from "@mui/material";
import type { Invoice } from "@/lib/api";
import { formatInvoiceDueDate } from "@/lib/formatters";

const ACCENT = ["primary.main", "secondary.main", "success.main", "warning.main", "error.main"] as const;

function formatCreatedAt(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export type RecentTransactionsProps = {
  invoices: Invoice[];
};

const RecentTransactions = ({ invoices }: RecentTransactionsProps) => {
  const slice = [...invoices]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  return (
    <DashboardCard title="Recent invoices" subtitle="Latest billing activity">
      {slice.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          No invoices yet.
        </Typography>
      ) : (
        <Stack spacing={0} divider={<Divider flexItem sx={{ borderColor: "divider", opacity: 0.85 }} />}>
          {slice.map((inv, i) => (
            <Stack
              key={inv.id}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              sx={{ py: 1.75, px: 0 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  width: 92,
                  flexShrink: 0,
                  textAlign: "right",
                  lineHeight: 1.45,
                  pt: 0.35,
                }}
              >
                {formatCreatedAt(inv.createdAt)}
              </Typography>
              <Box
                sx={{
                  width: 12,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                  pt: 0.6,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: ACCENT[i % ACCENT.length],
                    bgcolor: "background.paper",
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} sx={{ lineHeight: 1.45 }}>
                  {inv.status === "paid" ? "Paid" : "Unpaid"} -{" "}
                  {inv.amount != null
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "USD",
                      }).format(Number.parseFloat(inv.amount))
                    : "-"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    display: "block",
                    lineHeight: 1.45,
                    wordBreak: "break-word",
                  }}
                >
                  Due {formatInvoiceDueDate(inv.dueDate)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </DashboardCard>
  );
};

export default RecentTransactions;
