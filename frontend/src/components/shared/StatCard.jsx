import React from "react";
import { Paper, Stack, Box, Chip, Typography } from "@mui/material";

export default function StatCard({ color, icon, value, label, chip, chipColor, chipText }) {
  return (
    <Paper sx={{ p: 2.5, flex: 1, borderLeft: `4px solid ${color}` }}>
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
        <Chip size="small" label={chip} sx={{ bgcolor: chipColor, color: chipText, fontWeight: 600, fontSize: 11 }} />
      </Stack>
      <Typography sx={{ fontSize: 32, fontWeight: 800, mt: 1.5 }}>{value}</Typography>
      <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>{label}</Typography>
    </Paper>
  );
}
