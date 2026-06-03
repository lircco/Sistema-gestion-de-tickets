import React from "react";
import { Stack, Box, Typography, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Link, Divider } from "@mui/material";
import { VisibilityOutlined } from "@mui/icons-material";

export default function AreaManagementSection() {
  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4">Gestión de Áreas</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            Cola de trabajo del departamento:{' '}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>Soporte Infraestructura</Box>
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Chip label="● 8 Pendientes" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }} />
          <Chip label="● 3 En Proceso" sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }} />
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Stack spacing={2.5} sx={{ width: { md: 260 } }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Filtros Activos</Typography>
            <Stack spacing={1}>
              {[['Cola Principal', '11', true], ['Asignados a mi', '4', false], ['Recientes', '', false]].map(([l, c, a]) => (
                <Box key={l} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, borderRadius: 1.5, bgcolor: a ? 'rgba(10,61,98,0.08)' : 'transparent', border: a ? '1px solid rgba(10,61,98,0.3)' : '1px solid transparent', cursor: 'pointer' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: a ? 700 : 500 }}>{l}</Typography>
                  {c ? <Chip size="small" label={c} sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700, height: 22 }} /> : null}
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 700, mb: 1 }}>ESTADO DEL ÁREA</Typography>
            <Chip size="small" label="CAPACIDAD: 85%" sx={{ bgcolor: '#fef3c7', color: '#92400e', mb: 1 }} />
            <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3 }} />
          </Paper>
          <Paper sx={{ p: 3, bgcolor: 'primary.main', color: '#fff' }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>ⓘ Protocolo de Emergencia Red</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>Revisar documentación actualizada de firewalls.</Typography>
          </Paper>
        </Stack>

        <Paper sx={{ flex: 1, p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Tickets Pendientes de Atención</Typography>
            <Link href="#" sx={{ fontSize: 13 }}>↻ Actualizar</Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['PRIORIDAD', 'TICKET', 'REMITENTE', 'TIEMPO', 'ACCIÓN'].map((h) => (
                  <TableCell key={h} sx={{ color: '#6b7280', fontWeight: 700, fontSize: 11 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { p: 'URGENTE', pc: '#fef3c7', pt: '#92400e', t: 'Falla General WiFi Aulario 2', id: '#44219', r: 'Ing. Martin Solis', time: '12 min ago' },
                { p: 'NORMAL', pc: '#e5e7eb', pt: '#374151', t: 'Instalación Software CAD - Lab 3', id: '#44215', r: 'Soporte Alumnos', time: '45 min ago' },
                { p: 'NORMAL', pc: '#e5e7eb', pt: '#374151', t: 'Revisión de Proyector Comedor', id: '#44212', r: 'Servicios Generales', time: '2h ago' },
              ].map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell><Chip size="small" label={r.p} sx={{ bgcolor: r.pc, color: r.pt, fontWeight: 700 }} /></TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.t}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#6b7280' }}>ID: {r.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{r.r}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{r.time}</TableCell>
                  <TableCell><IconButton size="small"><VisibilityOutlined fontSize="small" /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Stack>
  );
}
