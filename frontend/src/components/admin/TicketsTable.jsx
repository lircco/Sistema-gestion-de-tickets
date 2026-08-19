import React, { useMemo, useState } from "react";
import { Stack, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Box, IconButton, InputAdornment, Menu, MenuItem } from "@mui/material";
import { SearchOutlined, VisibilityOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import { subDays } from "date-fns";
import { filterTickets } from "../../lib/utils";

const ESTADO_LABELS = { ABIERTO: "Abierto", EN_PROGRESO: "En Progreso", CERRADO: "Cerrado" };

const FECHA_OPTIONS = [
  { key: "", label: "Todas" },
  { key: "7", label: "Últimos 7 días" },
  { key: "30", label: "Últimos 30 días" },
  { key: "90", label: "Últimos 90 días" },
];

export default function TicketsTable({ tickets, onOpenTicket }) {
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [fechaFilter, setFechaFilter] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const categorias = useMemo(
    () => [...new Set(tickets.map((t) => t.categoria_nombre).filter(Boolean))],
    [tickets]
  );

  const handleOpenMenu = (menu) => (e) => {
    setMenuAnchor(e.currentTarget);
    setOpenMenu(menu);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setOpenMenu(null);
  };

  let visibleTickets = filterTickets(tickets, search);
  if (categoriaFilter) visibleTickets = visibleTickets.filter((t) => t.categoria_nombre === categoriaFilter);
  if (estadoFilter) visibleTickets = visibleTickets.filter((t) => t.estado === estadoFilter);
  if (fechaFilter) {
    const since = subDays(new Date(), Number(fechaFilter));
    visibleTickets = visibleTickets.filter((t) => new Date(t.creado_el) >= since);
  }

  const fechaLabel = FECHA_OPTIONS.find((o) => o.key === fechaFilter)?.label;

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
            <Button
              variant={categoriaFilter ? "contained" : "outlined"}
              size="small"
              endIcon={<KeyboardArrowDownOutlined />}
              onClick={handleOpenMenu("categoria")}
            >
              {categoriaFilter || "Categoría"}
            </Button>
            <Button
              variant={estadoFilter ? "contained" : "outlined"}
              size="small"
              endIcon={<KeyboardArrowDownOutlined />}
              onClick={handleOpenMenu("estado")}
            >
              {estadoFilter ? ESTADO_LABELS[estadoFilter] : "Estado"}
            </Button>
            <Button
              variant={fechaFilter ? "contained" : "outlined"}
              size="small"
              endIcon={<KeyboardArrowDownOutlined />}
              onClick={handleOpenMenu("fechas")}
            >
              {fechaFilter ? fechaLabel : "Fechas"}
            </Button>

            <Menu anchorEl={menuAnchor} open={openMenu === "categoria"} onClose={handleCloseMenu}>
              <MenuItem selected={!categoriaFilter} onClick={() => { setCategoriaFilter(""); handleCloseMenu(); }}>Todas</MenuItem>
              {categorias.map((c) => (
                <MenuItem key={c} selected={categoriaFilter === c} onClick={() => { setCategoriaFilter(c); handleCloseMenu(); }}>{c}</MenuItem>
              ))}
            </Menu>

            <Menu anchorEl={menuAnchor} open={openMenu === "estado"} onClose={handleCloseMenu}>
              <MenuItem selected={!estadoFilter} onClick={() => { setEstadoFilter(""); handleCloseMenu(); }}>Todos</MenuItem>
              {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                <MenuItem key={value} selected={estadoFilter === value} onClick={() => { setEstadoFilter(value); handleCloseMenu(); }}>{label}</MenuItem>
              ))}
            </Menu>

            <Menu anchorEl={menuAnchor} open={openMenu === "fechas"} onClose={handleCloseMenu}>
              {FECHA_OPTIONS.map((o) => (
                <MenuItem key={o.key} selected={fechaFilter === o.key} onClick={() => { setFechaFilter(o.key); handleCloseMenu(); }}>{o.label}</MenuItem>
              ))}
            </Menu>
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
