import React, { useState } from "react";
import { Stack, Typography, Paper, Chip, Snackbar, Alert } from "@mui/material";
import { MenuBookOutlined } from "@mui/icons-material";

const ARTICULOS = [
  { t: "Acceso al SIU Guaraní", c: "Sistemas", v: 1240 },
  { t: "Restablecer contraseña institucional", c: "Cuentas", v: 980 },
  { t: "Solicitar certificado de alumno regular", c: "Trámites", v: 745 },
  { t: "Conectarse a Wi-Fi UNRaf", c: "Infraestructura", v: 610 },
];

export default function KnowledgeBaseSection() {
  const [snackOpen, setSnackOpen] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState("");

  const handleClickArticulo = (titulo) => {
    setArticuloSeleccionado(titulo);
    setSnackOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Base de Conocimiento</Typography>
      <Typography sx={{ color: "#6b7280" }}>
        Documentación y artículos de ayuda para resolver consultas frecuentes.
      </Typography>

      <Stack direction="row" spacing={2.5} sx={{ flexWrap: "wrap" }}>
        {ARTICULOS.map((a) => (
          <Paper
            key={a.t}
            onClick={() => handleClickArticulo(a.t)}
            sx={{
              p: 3,
              flexBasis: "calc(50% - 10px)",
              flexGrow: 1,
              maxWidth: "100%",
              minWidth: 240,
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.15s",
              "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
            }}
          >
            <MenuBookOutlined sx={{ color: "primary.main", mb: 1 }} />
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{a.t}</Typography>
            <Chip size="small" label={a.c} sx={{ bgcolor: "#f3f4f6", mb: 1 }} />
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{a.v} visitas</Typography>
          </Paper>
        ))}
      </Stack>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setSnackOpen(false)}>
          El artículo <strong>"{articuloSeleccionado}"</strong> estará disponible próximamente.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
