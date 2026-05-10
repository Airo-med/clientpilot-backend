"use client";

import { Grid, Paper, Typography } from "@mui/material";

const fmtMoney = (n: string) => {
  const v = Number.parseFloat(n) || 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
};

type Stat = {
  label: string;
  value: string;
  hint?: string;
};

function StatCard({ label, value, hint }: Stat) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2.5,
        height: "100%",
        borderRadius: 2,
        borderColor: "divider",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 4px 20px rgba(93, 135, 255, 0.08)",
        },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        component="p"
        fontWeight={700}
        sx={{ mt: 0.75, color: "text.primary", lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export type DashboardStatGridProps = {
  clients: number;
  projects: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalRevenue: string;
};

export default function DashboardStatGrid({
  clients,
  projects,
  paidInvoices,
  unpaidInvoices,
  totalRevenue,
}: DashboardStatGridProps) {
  const stats: Stat[] = [
    { label: "Clients", value: String(clients), hint: "Total contacts" },
    { label: "Projects", value: String(projects), hint: "All statuses" },
    {
      label: "Invoices",
      value: String(paidInvoices + unpaidInvoices),
      hint: `${paidInvoices} paid · ${unpaidInvoices} open`,
    },
    {
      label: "Revenue",
      value: fmtMoney(totalRevenue),
      hint: "Paid invoices (lifetime)",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      {stats.map((s) => (
        <Grid key={s.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard {...s} />
        </Grid>
      ))}
    </Grid>
  );
}
