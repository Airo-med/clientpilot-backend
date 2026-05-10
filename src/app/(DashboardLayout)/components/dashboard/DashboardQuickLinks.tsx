"use client";

import Link from "next/link";
import { Typography, Grid, Fab, Box, Stack } from "@mui/material";
import { IconUsers, IconFolder, IconFileInvoice } from "@tabler/icons-react";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

const links = [
  {
    title: "Clients",
    href: "/clients",
    description: "Contacts, email, and phone in one place.",
    icon: IconUsers,
    gradient: "linear-gradient(145deg, #ECF2FF 0%, #E8F7FF 100%)",
    fabColor: "primary" as const,
  },
  {
    title: "Projects",
    href: "/projects",
    description: "Scope, status, and notes per client.",
    icon: IconFolder,
    gradient: "linear-gradient(145deg, #E8F7FF 0%, #E6FFFA 100%)",
    fabColor: "secondary" as const,
  },
  {
    title: "Invoices",
    href: "/invoices",
    description: "Bill projects and export PDFs.",
    icon: IconFileInvoice,
    gradient: "linear-gradient(145deg, #E6FFFA 0%, #ECF2FF 100%)",
    fabColor: "success" as const,
  },
];

const DashboardQuickLinks = () => {
  return (
    <Grid container spacing={3}>
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Grid
            key={item.href}
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <BlankCard>
              <Box
                component={Link}
                href={item.href}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    height: 168,
                    background: item.gradient,
                    position: "relative",
                  }}
                >
                  <Fab
                    color={item.fabColor}
                    size="large"
                    sx={{
                      color: "#fff",
                      boxShadow: "0 8px 24px rgba(93, 135, 255, 0.22)",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <Icon size={28} stroke={1.5} />
                  </Fab>
                </Stack>
              </Box>
              <Stack sx={{ p: 2.5 }} spacing={0.75}>
                <Typography
                  variant="h6"
                  component={Link}
                  href={item.href}
                  fontWeight={700}
                  sx={{
                    textDecoration: "none",
                    color: "text.primary",
                    letterSpacing: "-0.01em",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                  {item.description}
                </Typography>
              </Stack>
            </BlankCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DashboardQuickLinks;
