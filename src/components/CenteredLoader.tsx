"use client";

import { Box, Stack, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export type CenteredLoaderProps = {
  message?: string;
  minHeight?: number | string;
  fullViewport?: boolean;
  embedded?: boolean;
  className?: string;
};

export default function CenteredLoader({
  message = "Loading…",
  minHeight = 280,
  fullViewport = false,
  embedded = false,
  className,
}: CenteredLoaderProps) {
  const inner = (
    <Stack alignItems="center" justifyContent="center" spacing={2.5}>
      <Box
        sx={{
          position: "relative",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid",
            borderColor: "primary.light",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "primary.main",
            borderRightColor: "secondary.main",
            animation: `${spin} 0.7s linear infinite`,
          }}
        />
      </Box>
      {message ? (
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ letterSpacing: "0.02em" }}
        >
          {message}
        </Typography>
      ) : null}
    </Stack>
  );

  if (embedded) {
    return inner;
  }

  return (
    <Box
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullViewport ? "100dvh" : minHeight,
        width: "100%",
        flex: 1,
      }}
    >
      {inner}
    </Box>
  );
}
