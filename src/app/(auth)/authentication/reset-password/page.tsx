"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Grid,
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Alert,
} from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CenteredLoader from "@/components/CenteredLoader";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { resetPassword, ApiError } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await resetPassword({ token: token.trim(), password });
      setMsg(res.message ?? "Password updated.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reset password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      elevation={9}
      sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "500px" }}
    >
      <Box display="flex" alignItems="center" justifyContent="center">
        <Logo />
      </Box>
      <Typography fontWeight="700" variant="h2" mb={1} mt={2}>
        Reset password
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={2}>
        Paste the token from your reset email (or dev server logs) and choose a
        new password.
      </Typography>
      {msg ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {msg}{" "}
          <Link href="/authentication/login">Sign in</Link>
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <form onSubmit={handleSubmit}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          component="label"
          htmlFor="token"
          mb="5px"
        >
          Reset token
        </Typography>
        <CustomTextField
          id="token"
          variant="outlined"
          fullWidth
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <Typography
          variant="subtitle1"
          fontWeight={600}
          component="label"
          htmlFor="password"
          mb="5px"
          mt="25px"
        >
          New password
        </Typography>
        <CustomTextField
          id="password"
          type="password"
          autoComplete="new-password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          inputProps={{ minLength: 8 }}
        />
        <Button
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
      <Stack direction="row" justifyContent="center" mt={3}>
        <Typography
          component={Link}
          href="/authentication/login"
          fontWeight="500"
          sx={{ textDecoration: "none", color: "primary.main" }}
        >
          Back to sign in
        </Typography>
      </Stack>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageContainer title="Reset password" description="Set a new password">
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
            size={{ xs: 12, sm: 12, lg: 4, xl: 3 }}
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
              <ResetForm />
            </Suspense>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
