import React from "react";
import { Stack, Box, Typography } from "@mui/material";
import { STATUS_TONE, PRIORITY_TONE, toneSx } from "../../lib/tones";
import { estadoLabel } from "../../lib/estados";

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

// Con `pill`, la etiqueta lleva su propio fondo y color de texto (contraste AA en
// ambos temas). Sin `pill`, el texto hereda el color del contenedor (p. ej. tablas).
function Badge({ label, dotColor, tone, pill }) {
  return (
    <Stack
      direction="row"
      spacing={0.8}
      sx={[
        { alignItems: "center" },
        pill && { px: 1.5, py: 0.5, borderRadius: 2, width: "fit-content" },
        pill && toneSx(tone),
      ]}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dotColor, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "inherit" }}>{label}</Typography>
    </Stack>
  );
}

export function StatusBadge({ status, pill = false }) {
  return (
    <Badge
      label={estadoLabel(status).toUpperCase()}
      dotColor={STATUS_COLORS[status] || "#9ca3af"}
      tone={STATUS_TONE[status]}
      pill={pill}
    />
  );
}

export function PriorityBadge({ priority, pill = false }) {
  return (
    <Badge
      label={priority}
      dotColor={PRIORITY_COLORS[priority] || "#9ca3af"}
      tone={PRIORITY_TONE[priority]}
      pill={pill}
    />
  );
}
