import React from "react";
import { Stack, Box, Typography, Paper, Avatar, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Link } from "@mui/material";
import { AddCircleOutlined, AssignmentOutlined, ArrowForward } from "@mui/icons-material";

export default function UserHome({ user, tickets, onOpenNew, onGoTickets }) {
  const firstName = user.name.split(" ")[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">¡Hola, {firstName}! ¿En qué podemos ayudarte hoy?</Typography>
        <Typography sx={{ color: "#6b7280", mt: 0.5 }}>
          Bienvenido a la plataforma de gestión académica y técnica de UNRaf. Aquí puedes realizar
          trámites o reportar inconvenientes.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper onClick={onOpenNew} sx={{ flex: 2, p: 4, bgcolor: "primary.main", color: "#fff", minHeight: 200, backgroundImage: "linear-gradient(135deg, rgba(10,61,98,0.92), rgba(10,61,98,0.85))", cursor: "pointer" }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", mb: 2 }}>
            <AddCircleOutlined />
          </Avatar>
          <Typography variant="h5" sx={{ mb: 1 }}>Crear Nuevo Ticket</Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 420 }}>
            Inicia una nueva solicitud técnica o administrativa. El equipo correspondiente te contactará a la brevedad.
          </Typography>
        </Paper>

        <Paper onClick={onGoTickets} sx={{ flex: 1, p: 3, bgcolor: "secondary.main", minHeight: 200, cursor: "pointer" }}>
          <AssignmentOutlined sx={{ color: "rgba(0,0,0,0.4)", float: "right" }} />
          <Typography variant="h5" sx={{ mb: 1 }}>Mis Trámites</Typography>
          <Typography sx={{ color: "rgba(0,0,0,0.7)", mb: 2 }}>
            Consulta el historial y seguimiento de tus solicitudes activas.
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", fontWeight: 700 }}>
            Ir al listado <ArrowForward fontSize="small" />
          </Stack>
        </Paper>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ flex: 2, p: 3 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Tickets Recientes</Typography>
            <Link component="button" onClick={onGoTickets} sx={{ fontSize: 13 }}>Ver todos</Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>ID / ASUNTO</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>CATEGORÍA</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>ESTADO</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>FECHA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.slice(0, 5).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>#{r.id} - {r.titulo}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{r.descripcion}</Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={r.categoria_nombre} sx={{ bgcolor: "#f3f4f6" }} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.estado === 'ABIERTO' ? '#3b82f6' : '#f59e0b' }} />
                      <Typography sx={{ fontSize: 13 }}>{r.estado}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{new Date(r.creado_el).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Stack spacing={2.5} sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>MIS TRÁMITES ACTIVOS</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 800, mt: 1 }}>{String(tickets.length).padStart(2, "0")}</Typography>
            <Typography sx={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>↗ {tickets.filter((t) => t.estado === 'CERRADO').length} resuelto(s)</Typography>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>TIEMPO PROMEDIO DE RESPUESTA</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 800, mt: 1 }}>6h 15m</Typography>
            <Typography sx={{ fontSize: 11, color: "#6b7280" }}>Basado en el equipo de Atención al Alumno</Typography>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  );
}
