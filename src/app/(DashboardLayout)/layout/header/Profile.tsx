"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { IconListCheck, IconMail, IconUser } from "@tabler/icons-react";
import { clearAuth, getStoredUser, type StoredUser } from "@/lib/auth-storage";

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  useEffect(() => {
    setUser(getStoredUser());
  }, []);
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const handleClick2 = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  function logout() {
    clearAuth();
    handleClose2();
    router.replace("/authentication/login");
    router.refresh();
  }

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="account menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(anchorEl2 && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          alt={user?.name || "User"}
          sx={{
            width: 35,
            height: 35,
            bgcolor: "primary.main",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
      </IconButton>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "240px",
          },
        }}
      >
        {user ? (
          <Box px={2} py={1}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        ) : null}
        <MenuItem component={Link} href="/subscription" onClick={handleClose2}>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>Subscription</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href="/clients" onClick={handleClose2}>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>Clients</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href="/projects" onClick={handleClose2}>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>Projects</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={logout}
            fullWidth
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
