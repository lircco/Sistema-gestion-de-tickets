import React, { useState, useEffect } from "react";
import { Stack, Box, Typography, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Link, Divider, Alert, CircularProgress, LinearProgress } from "@mui/material";
import { VisibilityOutlined, ApartmentOutlined } from "@mui/icons-material";
import { api } from "../../lib/api";

export default function AreaManagementSection() {
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await api.getAreas();
        setAreas(data.results || data);
      } catch (err) {
        setError("No se pudieron cargar las áreas. Verificá tu conexión.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAreas();
  }, []);

  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
        <Typography sx={{ color: "#6b7280" }}>Cargando áreas...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4">Gestión de Áreas</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            {areas.length} área{areas.length !== 1 ? "s" : ""} registrada{areas.length !== 1 ? "s" : ""} en el sistema.
          </Typography>
        </Box>
        <Chip label={`${areas.length} Áreas`} sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }} />
      </Box>

      {areas.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <ApartmentOutlined sx={{ fontSize: 48, color: "#d1d5db", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#6b7280" }}>
            No hay áreas registradas
          </Typography>
          <Typography sx={{ color: "#9ca3af", fontSize: 13, mt: 0.5 }}>
            Las áreas se crean desde el panel de administración de Django.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Áreas del Sistema</Typography>
            <Link href="#" sx={{ fontSize: 13 }} onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
              ↻ Actualizar
            </Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["ID", "NOMBRE", "DESCRIPCIÓN"].map((h) => (
                  <TableCell key={h} sx={{ color: "#6b7280", fontWeight: 700, fontSize: 11 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>#{area.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{area.nombre}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>
                    {area.descripcion || <em>Sin descripción</em>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            Las áreas se administran desde el panel de Django. Contactá al equipo técnico para agregar o modificar áreas.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
