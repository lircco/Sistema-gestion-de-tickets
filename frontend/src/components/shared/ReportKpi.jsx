import React from "react";
import { Paper, Typography, Stack } from "@mui/material";

export function ReportKpi({ color, label, value, delta, deltaColor }) {
  return (
    <Paper sx={{ flex: 1, p: 2.5, borderLeft: `4px solid ${color}` }}>
      <Typography sx={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 0.5 }}>{label}</Typography>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mt: 1 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{value}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: deltaColor }}>{delta}</Typography>
      </Stack>
    </Paper>
  );
}
