import React from "react";
import { Stack, Typography, Paper, Chip } from "@mui/material";
import { MenuBookOutlined } from "@mui/icons-material";

export default function KnowledgeBaseSection() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Base de Conocimiento</Typography>
      <Typography sx={{ color: "#6b7280" }}>Documentación y artículos de ayuda para resolver consultas frecuentes.</Typography>
      <Stack direction="row" spacing={2.5} sx={{ flexWrap: "wrap" }}>
        {[
          { t: "Acceso al SIU Guaraní", c: "Sistemas", v: 1240 },
          { t: "Restablecer contraseña institucional", c: "Cuentas", v: 980 },
          { t: "Solicitar certificado de alumno regular", c: "Trámites", v: 745 },
          { t: "Conectarse a Wi-Fi UNRaf", c: "Infraestructura", v: 610 },
        ].map((a) => (
          <Paper key={a.t} sx={{ p: 3, flexBasis: "calc(50% - 10px)", flexGrow: 1, maxWidth: "100%", minWidth: 240, cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
            <MenuBookOutlined sx={{ color: "primary.main", mb: 1 }} />
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{a.t}</Typography>
            <Chip size="small" label={a.c} sx={{ bgcolor: "#f3f4f6", mb: 1 }} />
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{a.v} visitas</Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
