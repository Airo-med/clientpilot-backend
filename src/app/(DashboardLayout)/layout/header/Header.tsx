import type { MouseEvent } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import Profile from "./Profile";
import { IconMenu } from "@tabler/icons-react";

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  background: "rgba(255, 255, 255, 0.85)",
  justifyContent: "center",
  backdropFilter: "blur(12px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up("lg")]: {
    minHeight: "72px",
  },
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: "100%",
  color: theme.palette.text.secondary,
  minHeight: 64,
  [theme.breakpoints.up("lg")]: {
    minHeight: 72,
  },
}));

interface ItemType {
  toggleMobileSidebar: (event: MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="open menu"
          edge="start"
          onClick={toggleMobileSidebar}
          sx={{
            display: { lg: "none", xs: "inline-flex" },
            mr: 1,
          }}
        >
          <IconMenu width={20} height={20} />
        </IconButton>

        <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Welcome back
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
            Dashboard
          </Typography>
        </Box>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
