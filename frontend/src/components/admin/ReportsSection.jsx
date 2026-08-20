import React, { useState } from "react";
import { Box, Stack, Typography, Button, Paper, LinearProgress, Snackbar, Alert } from "@mui/material";
import { ReportKpi } from "../shared/ReportKpi";
import {
  computeAvgLeadTimeHours,
  computeLeadTimeByArea,
  computeCategoriaDistribution,
  computeSlaEnRiesgo,
  computeResolvedRate,
} from "../../lib/utils";

const CATEGORIA_COLORS = ["#0a3d62", "#f5b400", "#10b981", "#ef4444", "#6b7280", "#8b5cf6"];

export default function ReportsSection({ tickets = [], stats }) {
  const [last30Active, setLast30Active] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleLast30Click = () => {
    setLast30Active(true);
    setSnackbarOpen(true);
  };

  const totalTickets = stats?.total ?? tickets.length;
  const avgLeadTime = computeAvgLeadTimeHours(tickets);
  const { cerrados, percent: resolvedPercent } = computeResolvedRate(tickets);
  const slaEnRiesgo = computeSlaEnRiesgo(tickets);
  const leadTimeByArea = computeLeadTimeByArea(tickets);
  const categoriaDistribution = computeCategoriaDistribution(tickets);
  const maxAreaHours = Math.max(...leadTimeByArea.map((a) => a.hours), 1);

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5">Reportes de Gestión</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            Monitoreo en tiempo real del rendimiento operativo de la UNRaf.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant={last30Active ? "contained" : "outlined"} onClick={handleLast30Click}>Últimos 30 días</Button>
          <Button variant="outlined" onClick={() => window.print()}>Exportar PDF</Button>
        </Stack>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="info" onClose={() => setSnackbarOpen(false)} sx={{ width: "100%" }}>
          Las estadísticas en tiempo real por rango de fechas requieren endpoints adicionales en el backend (ver issue #40).
        </Alert>
      </Snackbar>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <ReportKpi color="#0a3d62" label="TICKETS TOTALES" value={totalTickets} delta={`${cerrados} cerrados`} deltaColor="#6b7280" />
        <ReportKpi
          color="#0a3d62"
          label="LEAD TIME PROMEDIO"
          value={avgLeadTime === null ? "Sin datos" : `${avgLeadTime.toFixed(1)}h`}
          delta={avgLeadTime === null ? "sin tickets cerrados" : "sobre tickets cerrados"}
          deltaColor="#6b7280"
        />
        <ReportKpi color="#10b981" label="% RESUELTOS" value={`${resolvedPercent}%`} delta={`${cerrados}/${totalTickets}`} deltaColor="#6b7280" />
        <ReportKpi
          color={slaEnRiesgo > 0 ? "#ef4444" : "#10b981"}
          label="SLA EN RIESGO"
          value={slaEnRiesgo}
          delta={slaEnRiesgo > 0 ? "! Prioridad alta sin cerrar" : "OK"}
          deltaColor={slaEnRiesgo > 0 ? "#ef4444" : "#10b981"}
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ flex: 1, p: 3, minHeight: 260 }}>
          <Typography sx={{ fontWeight: 700 }}>Eficiencia Operativa</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>Lead Time (horas) por área administrativa, tickets cerrados</Typography>
          {leadTimeByArea.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 4, textAlign: "center" }}>
              Todavía no hay tickets cerrados para calcular el lead time por área.
            </Typography>
          ) : (
            <>
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-end", height: 140, mt: 2 }}>
                {leadTimeByArea.map((a, i) => (
                  <Box
                    key={a.area}
                    title={`${a.area}: ${a.hours.toFixed(1)}h`}
                    sx={{ flex: 1, height: Math.max((a.hours / maxAreaHours) * 140, 6), bgcolor: "primary.main", opacity: 0.4 + i * 0.1, borderRadius: 1 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: "space-between" }}>
                {leadTimeByArea.map((a) => (
                  <Typography key={a.area} sx={{ fontSize: 11, color: "#6b7280", flex: 1, textAlign: "center" }}>{a.area}</Typography>
                ))}
              </Stack>
            </>
          )}
        </Paper>
        <Paper sx={{ flex: 1, p: 3, minHeight: 260 }}>
          <Typography sx={{ fontWeight: 700 }}>Consultas por Categoría</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>Distribución porcentual de tickets</Typography>
          {categoriaDistribution.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 4, textAlign: "center" }}>
              Todavía no hay tickets para calcular la distribución.
            </Typography>
          ) : (
            <Stack spacing={1.2} sx={{ mt: 2 }}>
              {categoriaDistribution.map((r, i) => (
                <Box key={r.categoria}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: 13 }}>● {r.categoria}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.percent}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={r.percent}
                    sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: CATEGORIA_COLORS[i % CATEGORIA_COLORS.length] } }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Stack>
  );
}
