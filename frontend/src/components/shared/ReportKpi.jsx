import React from "react";
import { Paper, Typography, Stack } from "@mui/material";

export function ReportKpi({ color, label, value, delta, deltaColor }) {
  return (
    <Paper sx={{ flex: 1, minWidth: 0, p: 2.5, borderLeft: "4px solid", borderLeftColor: color }}>
      <Typography
        sx={{ fontSize: 11, color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          columnGap: 1.5,
          rowGap: 0.5,
          mt: 1,
        }}
      >
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: deltaColor, textAlign: "right" }}>
          {delta}
        </Typography>
      </Stack>
    </Paper>
  );
}
