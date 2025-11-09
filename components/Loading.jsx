// components/FullScreenLoader.jsx
import * as React from "react";
import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";

export default function FullScreenLoader({ open, label = "Loading…" }) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1, // above everything
        color: "#fff",
        bgcolor: "rgba(0,0,0,0.4)",
      }}
    >
      <Stack spacing={2} alignItems="center">
        {/* HUGE spinner */}
        <CircularProgress size={140} thickness={4.5} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      </Stack>
    </Backdrop>
  );
}
