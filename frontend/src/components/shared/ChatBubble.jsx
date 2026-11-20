import React from "react";
import { Box, Stack, Typography } from "@mui/material";

/**
 * Burbuja de chat. `mine` = mensaje enviado por quien está viendo la conversación:
 * se alinea a la derecha con el azul primario del tema; el resto, a la izquierda en gris suave.
 *
 * El texto sobre el azul usa `primary.contrastText`, no blanco fijo: en modo oscuro el
 * primario es un azul claro (#4f9cd6) y el blanco encima no llega al contraste mínimo.
 */
export default function ChatBubble({ mine, author, date, children }) {
  return (
    <Box
      sx={{
        p: 1.8,
        borderRadius: 2,
        borderBottomRightRadius: mine ? 4 : undefined,
        borderBottomLeftRadius: mine ? undefined : 4,
        bgcolor: mine ? "primary.main" : "action.hover",
        color: mine ? "primary.contrastText" : "text.primary",
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: { xs: "90%", md: "75%" },
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "inherit" }}>{author}</Typography>
        <Typography sx={{ fontSize: 11, color: "inherit" }}>
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
