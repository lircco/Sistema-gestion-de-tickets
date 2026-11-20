import React from "react";
import { Box, Stack, Typography } from "@mui/material";

// Colores fijos para garantizar contraste AA con texto blanco en ambos temas.
// (primary.main en modo oscuro es #4f9cd6, que con texto blanco no llega al mínimo).
const BUBBLE_COLORS = {
  light: {
    mine: { bg: "#1d4ed8", fg: "#ffffff" }, // azul (emisor)
    other: { bg: "#4b5563", fg: "#ffffff" }, // gris oscuro (receptor)
  },
  dark: {
    mine: { bg: "#2563eb", fg: "#ffffff" },
    other: { bg: "#374151", fg: "#f9fafb" },
  },
};

/**
 * Burbuja de chat. `mine` = mensaje enviado por quien está viendo la conversación:
 * se alinea a la derecha y en azul; el resto, a la izquierda y en gris oscuro.
 */
export default function ChatBubble({ mine, author, date, children }) {
  return (
    <Box
      sx={(theme) => {
        const c = BUBBLE_COLORS[theme.palette.mode === "dark" ? "dark" : "light"];
        const { bg, fg } = mine ? c.mine : c.other;
        return {
          p: 1.8,
          borderRadius: 2,
          borderBottomRightRadius: mine ? 4 : undefined,
          borderBottomLeftRadius: mine ? undefined : 4,
          bgcolor: bg,
          color: fg,
          alignSelf: mine ? "flex-end" : "flex-start",
          maxWidth: { xs: "90%", md: "75%" },
        };
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "inherit" }}>{author}</Typography>
        <Typography sx={{ fontSize: 11, opacity: 0.85, color: "inherit" }}>
          {new Date(date).toLocaleString()}
        </Typography>
      </Stack>
      <Typography
        sx={{ fontSize: 13, color: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {children}
      </Typography>
    </Box>
  );
}
