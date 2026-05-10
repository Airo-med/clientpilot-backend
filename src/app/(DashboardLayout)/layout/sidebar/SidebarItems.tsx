"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconPoint } from "@tabler/icons-react";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import Menuitems from "./MenuItems";
import { Upgrade } from "./Upgrade";
import { SIDEBAR_WIDTH_PX } from "./constants";

type MenuLeaf = {
  id: string;
  title: string;
  icon?: React.ComponentType<{ stroke?: number; size?: string | number }>;
  href: string;
};

type MenuSubheader = { subheader: string; navlabel?: boolean };

function isSubheader(item: unknown): item is MenuSubheader {
  return (
    typeof item === "object" &&
    item !== null &&
    "subheader" in item &&
    typeof (item as MenuSubheader).subheader === "string"
  );
}

function isLeaf(item: unknown): item is MenuLeaf {
  return (
    typeof item === "object" &&
    item !== null &&
    "href" in item &&
    "title" in item &&
    typeof (item as MenuLeaf).href === "string"
  );
}

function itemSelected(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname === "";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarItems() {
  const pathname = usePathname() ?? "";

  return (
    <Box sx={{ width: SIDEBAR_WIDTH_PX, maxWidth: "100%", overflow: "visible" }}>
      <Box
        sx={{
          px: 1.5,
          pt: 1,
          pb: 0.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Logo />
      </Box>

      <List component="nav" disablePadding sx={{ px: 1.5 }}>
        {Menuitems.map((item) => {
          if (isSubheader(item)) {
            return (
              <ListItem key={item.subheader} disablePadding sx={{ display: "block", py: 0 }}>
                <Typography
                  variant="overline"
                  sx={{
                    px: 1.5,
                    pt: 1,
                    pb: 1,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.subheader}
                </Typography>
              </ListItem>
            );
          }

          if (!isLeaf(item)) {
            return null;
          }

          const Icon = item.icon ?? IconPoint;
          const selected = itemSelected(pathname, item.href);

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  py: 1.1,
                  px: 1.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.light" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  <Icon stroke={1.5} size="1.3rem" />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: selected ? 600 : 500,
                    fontSize: "0.9375rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box px={2}>
        <Upgrade />
      </Box>
    </Box>
  );
}
