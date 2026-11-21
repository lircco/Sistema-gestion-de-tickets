import React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import {
  MailOutlined,
  AssignmentOutlined,
  ArrowForward,
  CheckCircleOutlined,
  HighlightOffOutlined,
} from "@mui/icons-material";
import StatCard from "../shared/StatCard";
import { StatusBadge, PriorityBadge } from "../shared/Badges";

export default function AdminHome({ stats, tickets, onOpenTicket, onGoTickets, adminName }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">
          ¡Hola, {adminName ? adminName.split(" ")[0] : "Administrador"}!
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          Aquí tienes un resumen de la actividad del soporte técnico para hoy.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2.5}
        sx={{ flexWrap: { sm: "wrap", md: "nowrap" } }}
      >
        <StatCard
          tone="blue"
          icon={<MailOutlined />}
          value={stats?.total || 0}
          label="TOTAL ACTIVOS"
          chip="+12% vs ayer"
        />
        <StatCard
          tone="amber"
          icon={<AssignmentOutlined />}
          value={stats?.abiertos || 0}
          label="ABIERTOS"
          chip="Activo"
        />
        <StatCard
          tone="red"
          icon={<HighlightOffOutlined />}
          value={stats?.en_progreso || 0}
          label="EN PROGRESO"
          chip="Atención"
        />
        <StatCard
          tone="green"
          icon={<CheckCircleOutlined />}
          value={stats?.cerrados || 0}
          label="CERRADOS"
          chip="92% Eficiencia"
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ p: 3, width: { md: 280 }, display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontWeight: 700, mb: 3 }}>Accesos Rápidos</Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            startIcon={<AssignmentOutlined />}
            sx={{ justifyContent: "space-between", py: 1.5 }}
            onClick={onGoTickets}
          >
            Mis Tickets
          </Button>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 }, flex: 1, overflowX: "auto" }}>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
          >
            <Typography sx={{ fontWeight: 700 }}>Tickets Recientes</Typography>
            <Link component="button" onClick={onGoTickets} sx={{ fontSize: 13 }}>
              Ver todos
            </Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Asunto</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Prioridad</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.slice(0, 3).map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  onClick={() => onOpenTicket(r)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>#{r.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.titulo}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {r.categoria_nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={r.prioridad} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.estado} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Stack>
  );
}
