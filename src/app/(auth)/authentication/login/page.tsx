"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Grid, Box, Card, Stack, Typography } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CenteredLoader from "@/components/CenteredLoader";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin";

function LoginCard() {
  return (
    <Card
      elevation={9}
      sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px" }}
    >
      <Box display="flex" alignItems="center" justifyContent="center">
        <Logo />
      </Box>
      <AuthLogin
        subtitle={
          <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
            <Typography color="textSecondary" variant="h6" fontWeight="500">
              New to ClientPilot?
            </Typography>
            <Typography
              component={Link}
              href="/authentication/register"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              Create an account
            </Typography>
          </Stack>
        }
      />
    </Card>
  );
}

const Login2 = () => {
  return (
    <PageContainer>
      <Box
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
          },
        }}
      >
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{ height: "100vh" }}
        >
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{
              xs: 12,
              sm: 12,
              lg: 4,
              xl: 3,
            }}
          >
            <Suspense
              fallback={
                <Card
                  elevation={9}
                  sx={{
                    p: 4,
                    zIndex: 1,
                    width: "100%",
                    maxWidth: "500px",
                    minHeight: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CenteredLoader embedded message="Loading…" />
                </Card>
              }
            >
              <LoginCard />
            </Suspense>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};
export default Login2;
