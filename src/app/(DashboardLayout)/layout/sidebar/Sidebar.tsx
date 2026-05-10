import type { MouseEvent } from "react";
import { useMediaQuery, Box, Drawer, useTheme } from "@mui/material";
import SidebarItems from "./SidebarItems";
import { SIDEBAR_WIDTH_PX } from "./constants";

export { SIDEBAR_WIDTH_PX } from "./constants";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "7px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#eff2f7",
    borderRadius: "15px",
  },
};

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true,
  });

  const sidebarWidth = SIDEBAR_WIDTH_PX;

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          flexShrink: 0,
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                boxSizing: "border-box",
                ...scrollbarStyles,
                width: sidebarWidth,
                minWidth: sidebarWidth,
                maxWidth: sidebarWidth,
                borderRight: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                overflowX: "visible",
              },
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: sidebarWidth,
              minWidth: sidebarWidth,
              maxWidth: sidebarWidth,
              overflowY: "auto",
              overflowX: "visible",
            }}
          >
            <Box
              sx={{
                width: "100%",
                minWidth: sidebarWidth,
                maxWidth: sidebarWidth,
              }}
            >
              <SidebarItems />
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            boxShadow: theme.shadows[8],
            ...scrollbarStyles,
            width: sidebarWidth,
            minWidth: sidebarWidth,
            maxWidth: "min(100vw, 100%)",
            bgcolor: "background.paper",
            overflowX: "visible",
          },
        },
      }}
    >
      <Box>
        <SidebarItems />
      </Box>
    </Drawer>
  );
};

export default MSidebar;
