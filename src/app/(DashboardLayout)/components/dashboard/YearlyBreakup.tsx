"use client";

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

export type YearlyBreakupProps = {
  totalRevenue: string;
  paidInvoices: number;
  unpaidInvoices: number;
};

const fmtMoney = (n: string) => {
  const v = Number.parseFloat(n) || 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
};

const YearlyBreakup = ({
  totalRevenue,
  paidInvoices,
  unpaidInvoices,
}: YearlyBreakupProps) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = "#ecf2ff";
  const successlight = theme.palette.success.light;

  const total = paidInvoices + unpaidInvoices;
  const paidPct =
    total > 0 ? Math.round((paidInvoices / total) * 100) : 0;

  const seriescolumnchart = [paidInvoices, unpaidInvoices];

  const optionscolumnchart: Record<string, unknown> = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      height: 155,
    },
    colors: [primary, primarylight],
    labels: ["Paid", "Unpaid"],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "75%",
          background: "transparent",
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 991,
        options: { chart: { width: 120 } },
      },
    ],
  };

  return (
    <DashboardCard title="Invoice mix" subtitle="Paid vs unpaid counts">
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 7,
            sm: 7,
          }}
        >
          <Typography variant="h3" fontWeight="700">
            {fmtMoney(totalRevenue)}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {paidPct}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              paid (count)
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 9,
                  height: 9,
                  bgcolor: primary,
                  svg: { display: "none" },
                }}
              />
              <Typography variant="subtitle2" color="textSecondary">
                Paid {paidInvoices}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 9,
                  height: 9,
                  bgcolor: primarylight,
                  svg: { display: "none" },
                }}
              />
              <Typography variant="subtitle2" color="textSecondary">
                Unpaid {unpaidInvoices}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid
          size={{
            xs: 5,
            sm: 5,
          }}
        >
          {total > 0 ? (
            <Chart
              options={optionscolumnchart}
              series={seriescolumnchart}
              type="donut"
              height={150}
              width="100%"
            />
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ pt: 4 }}>
              No invoice volume yet
            </Typography>
          )}
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default YearlyBreakup;
