import React from "react";
import { Paper, Stack, Box, Chip, Typography } from "@mui/material";
import { toneColors, toneSx } from "../../lib/tones";

// `tone` (blue | amber | green | red | gray) define el color del ícono, el borde y el chip,
// con contraste adecuado en tema claro y oscuro.
export default function StatCard({ tone = "blue", icon, value, label, chip }) {
  return (
    <Paper
      sx={(theme) => ({
        p: 2.5,
        flex: 1,
        borderLeft: `4px solid ${toneColors(tone, theme.palette.mode).fg}`,
      })}
    >
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box
          sx={[
            toneSx(tone),
            {
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          {icon}
        </Box>
        <Chip size="small" label={chip} sx={[toneSx(tone), { fontWeight: 600, fontSize: 11 }]} />
      </Stack>
      <Typography sx={{ fontSize: 32, fontWeight: 800, mt: 1.5 }}>{value}</Typography>
      <Typography
        sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600, letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
    </Paper>
  );
}
