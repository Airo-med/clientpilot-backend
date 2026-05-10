"use client";

import { styled, Container, Box } from "@mui/material";
import { useState, type ReactNode } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import Sidebar from "@/app/(DashboardLayout)/layout/sidebar/Sidebar";
import AuthGuard from "@/components/AuthGuard";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: theme.spacing(6),
  flexDirection: "column",
  zIndex: 1,
  background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 55%, ${theme.palette.background.default} 100%)`,
  minWidth: 0,
}));

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <MainWrapper className="mainwrapper">
        <Sidebar
          isSidebarOpen
          isMobileSidebarOpen={isMobileSidebarOpen}
          onSidebarClose={() => setMobileSidebarOpen(false)}
        />

        <PageWrapper className="page-wrapper">
          <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
          <Container
            maxWidth="xl"
            sx={{
              pt: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box component="main" sx={{ minHeight: "calc(100vh - 100px)" }}>
              {children}
            </Box>
          </Container>
        </PageWrapper>
      </MainWrapper>
    </AuthGuard>
  );
}
