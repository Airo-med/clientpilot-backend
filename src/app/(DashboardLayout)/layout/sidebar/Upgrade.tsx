import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export function Upgrade() {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.75}
      sx={{
        mt: 3,
        py: 2.5,
        pl: 2.5,
        pr: 1.25,
        overflow: "visible",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h5" sx={{ maxWidth: 132 }} fontSize="16px" mb={1}>
          Need more capacity?
        </Typography>
        <Button
          color="primary"
          disableElevation
          component={Link}
          href="/subscription"
          variant="contained"
          aria-label="upgrade"
          size="small"
        >
          Subscription
        </Button>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          lineHeight: 0,
          alignSelf: "center",
          transform: "translateY(-10px)",
        }}
      >
        <Image
          alt=""
          src="/images/backgrounds/rocket.png"
          width={88}
          height={88}
          sizes="88px"
        />
      </Box>
    </Box>
  );
}
