import React from "react";
import { Stack, Typography } from "@mui/material";

export default function DetailRow({ label, value }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.4 }}>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 600, wordBreak: "break-word", textAlign: "right", ml: 1 }}>{value}</Typography>
    </Stack>
  );
}
