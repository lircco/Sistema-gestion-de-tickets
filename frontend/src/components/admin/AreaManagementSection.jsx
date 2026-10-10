import React from "react";
import { Stack, Box, Typography, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Divider, LinearProgress } from "@mui/material";
import { VisibilityOutlined } from "@mui/icons-material";
import { StatusBadge, PriorityBadge } from "../shared/Badges";

const PRIORIDAD_COLORS = {
  BAJA: { bg: "#e5e7eb", text: "#374151" },
  MEDIA: { bg: "#dbeafe", text: "#1d4ed8" },
  ALTA: { bg: "#fef3c7", text: "#92400e" },
  CRITICA: { bg: "#fee2e2", text: "#b91c1c" }
};

export default function AreaManagementSection({ tickets = [], admin, onOpenTicket }) {
  const pendingTickets = tickets.filter(t => t.estado === "ABIERTO");
  const inProgressTickets = tickets.filter(t => t.estado === "EN_PROGRESO");
  const activeTickets = [...pendingTickets, ...inProgressTickets].sort((a, b) => new Date(b.creado_el) - new Date(a.creado_el));

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4">Gestión de Áreas</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            Cola de trabajo del departamento:{' '}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
              {admin?.area_nombre || "Mi Área"}
            </Box>
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Chip label={` ${pendingTickets.length} Pendientes`} sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }} />
          <Chip label={` ${inProgressTickets.length} En Proceso`} sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }} />
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Stack spacing={2.5} sx={{ width: { md: 260 } }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Filtros Activos</Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, borderRadius: 1.5, bgcolor: 'rgba(10,61,98,0.08)', border: '1px solid rgba(10,61,98,0.3)' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Cola Principal</Typography>
                <Chip size="small" label={activeTickets.length} sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700, height: 22 }} />
              </Box>
            </Stack>
            {admin?.rol === 'SUPERVISOR' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700, mb: 1 }}>ESTADO DEL ÁREA</Typography>
                <Chip size="small" label={`CAPACIDAD: ${Math.round((tickets.length / 100) * 100)}%`} sx={{ bgcolor: '#fef3c7', color: '#92400e', mb: 1 }} />
                <LinearProgress variant="determinate" value={Math.min(Math.round((tickets.length / 100) * 100), 100)} sx={{ height: 6, borderRadius: 3 }} />
              </>
            )}
          </Paper>
          <Paper sx={{ p: 3, bgcolor: 'primary.main', color: '#fff' }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>💡 Protocolo de Área</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>Recuerda actualizar el estado de los tickets cuando empieces a trabajar en ellos.</Typography>
          </Paper>
        </Stack>

        <Paper sx={{ flex: 1, p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Tickets Pendientes de Atención</Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['PRIORIDAD', 'TICKET', 'REMITENTE', 'FECHA', 'ACCIÓN'].map((h) => (
                  <TableCell key={h} sx={{ color: '#6b7280', fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {activeTickets.map((r) => {
                const colorConfig = PRIORIDAD_COLORS[r.prioridad] || PRIORIDAD_COLORS.MEDIA;
                return (
                  <TableRow key={r.id} hover onClick={() => onOpenTicket?.(r)} sx={{ cursor: 'pointer' }}>
                    <TableCell><PriorityBadge priority={r.prioridad} /></TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.titulo}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#6b7280' }}>
                          ID: #{r.id} | Cat: {r.categoria_nombre}
                          {admin?.rol === 'SUPERVISOR' && r.area_nombre ? ` | Area: ${r.area_nombre}` : ''}
                        </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{r.creado_por_nombre || r.creado_por_email}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{new Date(r.creado_el).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onOpenTicket?.(r); }}>
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {activeTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No hay tickets pendientes en tu área.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Stack>
  );
}

