"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { IconCreditCard } from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CenteredLoader from "@/components/CenteredLoader";
import {
  getSubscription,
  createCheckoutSession,
  type SubscriptionInfo,
  ApiError,
} from "@/lib/api";

function usageNoun(label: string, used: number): string {
  if (used !== 1) return label.toLowerCase();
  if (label === "Clients") return "client";
  if (label === "Invoices") return "invoice";
  if (label === "Projects") return "project";
  return label.toLowerCase();
}

function UsageBar(props: {
  label: string;
  used: number;
  max: number | null;
}) {
  const { label, used, max } = props;
  if (max === 0) {
    return (
      <Box sx={{ py: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Pro only
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Upgrade to add more {label.toLowerCase()}. You currently have {used}{" "}
          {usageNoun(label, used)} on this account.
        </Typography>
      </Box>
    );
  }
  if (max == null) {
    return (
      <Box sx={{ py: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="caption" color="success.main" fontWeight={600}>
            Unlimited
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {used} used on Pro
        </Typography>
      </Box>
    );
  }
  const pct = Math.min(100, (used / max) * 100);
  return (
    <Box sx={{ py: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {used} / {max}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={pct >= 90 ? "warning" : "primary"}
        sx={{ height: 10, borderRadius: 99 }}
      />
    </Box>
  );
}

export default function SubscriptionPage() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    let c = false;
    getSubscription()
      .then((r) => {
        if (!c) setInfo(r);
      })
      .catch((e) => {
        if (!c) {
          setError(e instanceof ApiError ? e.message : "Failed to load subscription");
        }
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  async function checkout() {
    setCheckoutLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession();
      if (url) {
        window.location.href = url;
        return;
      }
      setError("Checkout URL not available. Check Stripe configuration.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <PageContainer
      title="Subscription"
      description="See how much of your plan you’re using and upgrade when you need room to grow."
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Card variant="outlined" sx={{ borderRadius: 2, maxWidth: 520 }}>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
              py: 4,
            }}
          >
            <CenteredLoader embedded message="Loading subscription…" />
          </CardContent>
        </Card>
      ) : info ? (
        <Card
          variant="outlined"
          elevation={0}
          sx={{
            maxWidth: 520,
            borderRadius: 2,
            borderColor: "divider",
            boxShadow: "0 4px 24px rgba(42, 53, 71, 0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "primary.light",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCreditCard size={26} stroke={1.5} />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={600}>
                  Current plan
                </Typography>
                {info.subscriptionStatus === "pro" ? (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="h5" fontWeight={700}>
                      Pro
                    </Typography>
                    <Chip
                      size="small"
                      label="Active"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                ) : (
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Free plan
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Includes up to 3 clients, 3 projects, and 3 invoices. Upgrade to Pro for
                      unlimited usage and PDF export.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
              Usage
            </Typography>
            <UsageBar
              label="Clients"
              used={info.limits.clients.used}
              max={info.limits.clients.max}
            />
            <Divider flexItem sx={{ opacity: 0.6 }} />
            <UsageBar
              label="Invoices"
              used={info.limits.invoices.used}
              max={info.limits.invoices.max}
            />
            <Divider flexItem sx={{ opacity: 0.6 }} />
            <UsageBar
              label="Projects"
              used={info.limits.projects.used}
              max={info.limits.projects.max}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={checkout}
              disabled={checkoutLoading || info.subscriptionStatus === "pro"}
              sx={{ mt: 2 }}
            >
              {info.subscriptionStatus === "pro"
                ? "You’re on Pro"
                : checkoutLoading
                  ? "Redirecting…"
                  : "Upgrade with Stripe checkout"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
