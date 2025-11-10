"use client";

import React from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import Link from "next/link";

const drawerWidth = 240;

const theme = createTheme({
  palette: { primary: { main: "#8A1538" } },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* ===== SIDEBAR ===== */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: theme.palette.primary.main,
              color: "#fff",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <img width={50} src="/assets/qatar-logo.png" alt="Qatar logo" />
            <Typography variant="h5">Shared KPIs</Typography>
          </Toolbar>

          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/">
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} href="/shared">
                <ListItemText primary="Shared KPI" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} href="/tree">
                <ListItemText primary="Tree KPIs" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        {/* ===== MAIN CONTENT ===== */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: `calc(100% - ${drawerWidth}px)`,
            height: "100vh",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            backgroundImage: `url("/assets/logo.png")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        >
          {/* Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(255,255,255,0.8)",
              zIndex: 0,
            }}
          />

          {/* Scrollable content */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
