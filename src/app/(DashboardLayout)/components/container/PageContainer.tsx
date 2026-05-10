"use client";

import { Box, Stack, Typography } from "@mui/material";

type Props = {
  description?: string;
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
};

const PageContainer = ({
  title,
  description,
  children,
  actions,
}: Props) => {
  return (
    <Box component="main" sx={{ pb: 4 }}>
      {(title || actions) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack
            direction="row"
            spacing={2.25}
            alignItems="flex-start"
            sx={{ minWidth: 0, flex: 1 }}
          >
            {(title || description) && (
              <Box
                aria-hidden
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: 4,
                  flexShrink: 0,
                  borderRadius: 1,
                  minHeight: description ? 52 : 36,
                  mt: 0.5,
                  background: (theme) =>
                    `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
              />
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {title ? (
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.25,
                    color: "text.primary",
                  }}
                >
                  {title}
                </Typography>
              ) : null}
              {description ? (
                <Typography
                  variant="body1"
                  component="p"
                  sx={{
                    mt: title ? 1.25 : 0,
                    maxWidth: "min(42rem, 100%)",
                    lineHeight: 1.65,
                    fontSize: "0.9375rem",
                    color: "grey.600",
                    fontWeight: 400,
                  }}
                >
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Stack>
          {actions ? (
            <Box sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}>
              {actions}
            </Box>
          ) : null}
        </Stack>
      )}
      {children}
    </Box>
  );
};

export default PageContainer;
