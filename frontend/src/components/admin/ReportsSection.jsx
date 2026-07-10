import React, { useState } from "react";
import { Box, Stack, Typography, Button, Paper, LinearProgress, Snackbar, Alert } from "@mui/material";
import { ReportKpi } from "../shared/ReportKpi";
import { PrintOutlined, CalendarTodayOutlined } from "@mui/icons-material";

export default function ReportsSection() {
  const [filtro, setFiltro] = useState("30d");
  const [snackOpen, setSnackOpen] = useState(false);

  const handleExportPDF = () => {
    // Imprime la sección actual usando la API nativa del navegador
    window.print();
  };

  const handleFiltro = (valor) => {
    setFiltro(valor);
    setSnackOpen(true);
  };

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
          <Button
            variant={filtro === "30d" ? "contained" : "outlined"}
            startIcon={<CalendarTodayOutlined fontSize="small" />}
            onClick={() => handleFiltro("30d")}
          >
            Últimos 30 días
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintOutlined fontSize="small" />}
            onClick={handleExportPDF}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <ReportKpi color="#0a3d62" label="TICKETS TOTALES" value="1,284" delta="↗ +12%" deltaColor="#10b981" />
        <ReportKpi color="#0a3d62" label="LEAD TIME PROMEDIO" value="4.2h" delta="↘ -0.5h" deltaColor="#10b981" />
        <ReportKpi color="#10b981" label="SATISFACCIÓN ESTUDIANTIL" value="94%" delta="Meta: 90%" deltaColor="#6b7280" />
        <ReportKpi color="#ef4444" label="SLA EN RIESGO" value="12" delta="! Crítico" deltaColor="#ef4444" />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ flex: 1, p: 3, minHeight: 260 }}>
          <Typography sx={{ fontWeight: 700 }}>Eficiencia Operativa</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>Lead Time (horas) por área administrativa</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-end", height: 140, mt: 2 }}>
            {[60, 90, 45, 110, 75].map((h, i) => (
              <Box key={i} sx={{ flex: 1, height: h, bgcolor: "primary.main", opacity: 0.2 + i * 0.15, borderRadius: 1 }} />
            ))}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: "space-between" }}>
            {['IT Support', 'Alumnos', 'RRHH', 'Académica', 'Infra'].map((l) => (
              <Typography key={l} sx={{ fontSize: 11, color: "#6b7280", flex: 1, textAlign: "center" }}>{l}</Typography>
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ flex: 1, p: 3, minHeight: 260 }}>
          <Typography sx={{ fontWeight: 700 }}>Consultas por Categoría</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>Distribución porcentual de tickets</Typography>
          <Stack spacing={1.2} sx={{ mt: 2 }}>
            {[
              { l: "Académicos", v: 45, c: "#0a3d62" },
              { l: "Trámites", v: 28, c: "#f5b400" },
              { l: "Infraestructura", v: 15, c: "#10b981" },
              { l: "Otros", v: 12, c: "#6b7280" },
            ].map((r) => (
              <Box key={r.l}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13 }}>● {r.l}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.v}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={r.v} sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: r.c } }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setSnackOpen(false)}>
          Filtro aplicado: últimos 30 días. Las estadísticas reales estarán disponibles próximamente.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
