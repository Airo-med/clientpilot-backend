"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid, Box, Alert, Typography } from "@mui/material";
import CenteredLoader from "@/components/CenteredLoader";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import SalesOverview from "@/app/(DashboardLayout)/components/dashboard/SalesOverview";
import YearlyBreakup from "@/app/(DashboardLayout)/components/dashboard/YearlyBreakup";
import RecentTransactions from "@/app/(DashboardLayout)/components/dashboard/RecentTransactions";
import ProductPerformance from "@/app/(DashboardLayout)/components/dashboard/ProductPerformance";
import DashboardQuickLinks from "@/app/(DashboardLayout)/components/dashboard/DashboardQuickLinks";
import DashboardStatGrid from "@/app/(DashboardLayout)/components/dashboard/DashboardStatGrid";
import MonthlyEarnings from "@/app/(DashboardLayout)/components/dashboard/MonthlyEarnings";
import {
  getDashboardMetrics,
  listClients,
  listInvoices,
  listProjects,
  type Client,
  type DashboardMetrics,
  type Invoice,
  type Project,
  ApiError,
} from "@/lib/api";

function monthValues(
  revenueByMonth: { month: number; revenue: string }[]
): number[] {
  const map = new Map<number, number>();
  for (const r of revenueByMonth) {
    map.set(r.month, Number.parseFloat(r.revenue) || 0);
  }
  return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? 0);
}

export default function DashboardHome() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [listsError, setListsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMetricsLoading(true);
    setMetricsError(null);
    getDashboardMetrics(year)
      .then((m) => {
        if (!cancelled) setMetrics(m);
      })
      .catch((e) => {
        if (!cancelled) {
          setMetricsError(
            e instanceof ApiError ? e.message : "Could not load metrics"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  useEffect(() => {
    let cancelled = false;
    setListsError(null);
    Promise.all([listInvoices(), listProjects(), listClients()])
      .then(([inv, proj, cl]) => {
        if (!cancelled) {
          setInvoices(inv.invoices);
          setProjects(proj.projects);
          setClients(cl.clients);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setListsError(
            e instanceof ApiError ? e.message : "Could not load activity"
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const yearOptions = useMemo(() => {
    const cy = new Date().getFullYear();
    const fromApi = metrics?.revenueByYear.map((r) => r.year) ?? [];
    const s = new Set<number>([cy, year, ...fromApi]);
    return Array.from(s).sort((a, b) => b - a);
  }, [metrics, year]);

  const clientNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of clients) m[c.id] = c.name;
    return m;
  }, [clients]);

  const sparkline = useMemo(() => {
    if (!metrics) return [];
    const v = monthValues(metrics.revenueByMonth);
    return v.slice(-7);
  }, [metrics]);

  const revenueForYear = metrics?.revenueByMonth ?? [];

  return (
    <PageContainer
      title="Dashboard"
      description="Revenue, workload, and quick shortcuts - everything you need to run your practice at a glance."
    >
      <Box>
        {metricsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {metricsError}
          </Alert>
        ) : null}
        {listsError ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {listsError}
          </Alert>
        ) : null}
        {metricsLoading && !metrics ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={360}
            borderRadius={2}
            border="1px dashed"
            borderColor="divider"
            bgcolor="background.paper"
          >
            <CenteredLoader embedded message="Loading dashboard…" />
          </Box>
        ) : null}
        {metrics ? (
          <Grid container spacing={3}>
            <Grid size={12}>
              <DashboardStatGrid
                clients={metrics.totals.clients}
                projects={metrics.totals.projects}
                paidInvoices={metrics.totals.paidInvoices}
                unpaidInvoices={metrics.totals.unpaidInvoices}
                totalRevenue={metrics.totals.totalRevenue}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                lg: 8,
              }}
            >
              <SalesOverview
                year={year}
                yearOptions={yearOptions}
                revenueByMonth={revenueForYear}
                onYearChange={setYear}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                lg: 4,
              }}
            >
              <Grid container spacing={3}>
                <Grid size={12}>
                  <YearlyBreakup
                    totalRevenue={metrics.totals.totalRevenue}
                    paidInvoices={metrics.totals.paidInvoices}
                    unpaidInvoices={metrics.totals.unpaidInvoices}
                  />
                </Grid>
                <Grid size={12}>
                  <MonthlyEarnings
                    totalRevenue={metrics.totals.totalRevenue}
                    sparkline={sparkline}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              size={{
                xs: 12,
                lg: 4,
              }}
            >
              <RecentTransactions invoices={invoices} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                lg: 8,
              }}
            >
              <ProductPerformance
                projects={projects}
                clientNameById={clientNameById}
              />
            </Grid>
            <Grid size={12}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: "0.08em", display: "block", mb: 2 }}
              >
                Shortcuts
              </Typography>
              <DashboardQuickLinks />
            </Grid>
          </Grid>
        ) : null}
      </Box>
    </PageContainer>
  );
}
