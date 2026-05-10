"use client";

import React from "react";
import { MenuItem, Select } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type SalesOverviewProps = {
  year: number;
  yearOptions: number[];
  revenueByMonth: { month: number; revenue: string }[];
  onYearChange: (year: number) => void;
};

function monthSeries(
  revenueByMonth: { month: number; revenue: string }[]
): number[] {
  const map = new Map<number, number>();
  for (const r of revenueByMonth) {
    map.set(r.month, Number.parseFloat(r.revenue) || 0);
  }
  return MONTH_LABELS.map((_, i) => map.get(i + 1) ?? 0);
}

const SalesOverview = ({
  year,
  yearOptions,
  revenueByMonth,
  onYearChange,
}: SalesOverviewProps) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const data = monthSeries(revenueByMonth);

  const optionscolumnchart: Record<string, unknown> = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: true },
      height: 370,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: "60%",
        columnWidth: "42%",
        borderRadius: [6],
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "all",
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    yaxis: { tickAmount: 4 },
    xaxis: {
      categories: MONTH_LABELS,
      axisBorder: { show: false },
    },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
    },
  };

  const seriescolumnchart = [
    {
      name: "Paid revenue",
      data,
    },
  ];

  return (
    <DashboardCard
      title="Revenue overview"
      subtitle="Paid invoice totals by month"
      action={
        <Select
          labelId="year-dd"
          id="year-dd"
          value={String(year)}
          size="small"
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <MenuItem key={y} value={String(y)}>
              {y}
            </MenuItem>
          ))}
        </Select>
      }
    >
      <Chart
        options={optionscolumnchart}
        series={seriescolumnchart}
        type="bar"
        height={370}
        width="100%"
      />
    </DashboardCard>
  );
};

export default SalesOverview;
