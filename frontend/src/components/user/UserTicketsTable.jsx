import React from "react";
import { Stack, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Box } from "@mui/material";
import { AddCircleOutlined, AttachFileOutlined } from "@mui/icons-material";

export default function UserTicketsTable({ tickets, onOpenNew, onOpenTicket }) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5">Mis Tickets</Typography>
        <Button variant="contained" startIcon={<AddCircleOutlined />} onClick={onOpenNew}>
          Nuevo Ticket
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['ID', 'TÍTULO', 'CATEGORÍA', 'ESTADO', 'FECHA'].map((h) => (
                <TableCell key={h} sx={{ color: '#6b7280', fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((r) => (
              <TableRow key={r.id} hover onClick={() => onOpenTicket?.(r)} sx={{ cursor: "pointer" }}>
                <TableCell sx={{ fontWeight: 700 }}>#{r.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.titulo}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{r.descripcion}</Typography>
                  {r.archivo_adjunto && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.8, flexWrap: "wrap", gap: 0.5 }}>
                      <Chip
                        size="small"
                        component="a"
                        href={r.archivo_adjunto}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        onClick={(e) => e.stopPropagation()}
                        icon={<AttachFileOutlined sx={{ fontSize: 14 }} />}
                        label="Ver adjunto"
                        sx={{ fontSize: 11, maxWidth: 200 }}
                      />
                    </Stack>
                  )}
                </TableCell>
                <TableCell><Chip size="small" label={r.categoria_nombre} sx={{ bgcolor: '#f3f4f6' }} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.estado === 'ABIERTO' ? '#3b82f6' : '#f59e0b' }} />
                    <Typography sx={{ fontSize: 13 }}>{r.estado}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: 13 }}>{new Date(r.creado_el).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tickets.length === 0 && (
          <Typography sx={{ textAlign: "center", color: "#6b7280", py: 4 }}>
            No tenés tickets todavía. Creá uno nuevo.
          </Typography>
        )}
      </Paper>
    </Stack>
  );
}
