import React, { useState } from "react";
import { Stack, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Box, IconButton, InputAdornment } from "@mui/material";
import { SearchOutlined, VisibilityOutlined } from "@mui/icons-material";
import { filterTickets } from "../../lib/utils";

export default function TicketsTable({ tickets, onOpenTicket }) {
  const [search, setSearch] = useState("");
  const visibleTickets = filterTickets(tickets, search);

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Lista de Tickets</Typography>
      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            placeholder="Buscar por ID, título o descripción..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: "#9aa4b2" }} />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: "wrap" }}>
            <Button variant="outlined" size="small">Categoría</Button>
            <Button variant="outlined" size="small">Estado</Button>
            <Button variant="outlined" size="small">Fechas</Button>
          </Stack>
        </Stack>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              {['ID', 'TÍTULO', 'CATEGORÍA', 'ESTADO', 'PRIORIDAD', 'FECHA', 'ACCIÓN'].map((h) => (
                <TableCell key={h} sx={{ color: '#6b7280', fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTickets.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>#{r.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{r.titulo}</TableCell>
                <TableCell>{r.categoria_nombre}</TableCell>
                <TableCell><Chip size="small" label={r.estado} sx={{ fontWeight: 700, fontSize: 11 }} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.prioridad === 'ALTA' ? '#ef4444' : '#9ca3af' }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.prioridad}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{new Date(r.creado_el).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => onOpenTicket(r)}>
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography sx={{ fontSize: 12, color: '#6b7280', mt: 2 }}>Mostrando {visibleTickets.length} tickets</Typography>
      </Paper>
    </Stack>
  );
}
