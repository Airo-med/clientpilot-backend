"use client";

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import { Stack, Typography, Avatar, Fab } from "@mui/material";
import { IconArrowDownRight, IconCurrencyDollar } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

export type MonthlyEarningsProps = {
  totalRevenue: string;
  sparkline: number[];
};

const fmtMoney = (n: string) => {
  const v = Number.parseFloat(n) || 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
};

const MonthlyEarnings = ({ totalRevenue, sparkline }: MonthlyEarningsProps) => {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = "#f5fcff";
  const errorlight = "#fdede8";

  const data =
    sparkline.length > 0 ? sparkline : [0, 0, 0, 0, 0, 0, 0];

  const optionscolumnchart: Record<string, unknown> = {
    chart: {
      type: "area",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      height: 60,
      sparkline: { enabled: true },
      group: "sparklines",
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      colors: [secondarylight],
      type: "solid",
      opacity: 0.05,
    },
    markers: { size: 0 },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
    },
  };

  const seriescolumnchart = [
    {
      name: "Revenue",
      color: secondary,
      data,
    },
  ];

  return (
    <DashboardCard
      title="Total paid revenue"
      subtitle="Lifetime revenue from paid invoices"
      action={
        <Fab color="secondary" size="medium" sx={{ color: "#ffffff" }}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        <Chart
          options={optionscolumnchart}
          series={seriescolumnchart}
          type="area"
          height={60}
          width="100%"
        />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          {fmtMoney(totalRevenue)}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
            <IconArrowDownRight width={20} color="#FA896B" />
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            All time
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            from paid invoices
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
