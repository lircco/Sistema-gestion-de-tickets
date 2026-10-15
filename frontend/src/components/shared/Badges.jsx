import React from "react";
import { Stack, Box, Typography } from "@mui/material";

export const STATUS_COLORS = {
  ABIERTO: "#3b82f6", // blue
  EN_PROGRESO: "#f59e0b", // yellow
  CERRADO: "#10b981", // green
};

export const PRIORITY_COLORS = {
  ALTA: "#ef4444", // red
  MEDIA: "#f59e0b", // yellow
  BAJA: "#22c55e", // green
};

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#9ca3af";
  return (
    <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{status}</Typography>
    </Stack>
  );
}

export function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || "#9ca3af";
  return (
    <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{priority}</Typography>
    </Stack>
  );
}
