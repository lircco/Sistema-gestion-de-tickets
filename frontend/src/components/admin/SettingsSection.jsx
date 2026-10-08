import React, { useState, useEffect } from "react";
import { Stack, Typography, Paper, Box, Avatar, TextField, Switch, FormControlLabel, Button, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { api } from "../../lib/api";

export default function SettingsSection({ person, mode, onToggleMode, legajo }) {

  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(person.area || "");
  const [areaSuccess, setAreaSuccess] = useState("");
  useEffect(() => {
    api.getAreas().then(setAreas).catch(() => {});
  }, []);
  const handleUpdateArea = async () => {
    try {
      await api.updateMe({ area: selectedArea });
      setAreaSuccess("Área actualizada correctamente.");
      setTimeout(() => setAreaSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(() => localStorage.getItem("pushAlerts") === "true");
  const handlePushAlertsChange = (e) => {
    const val = e.target.checked;
    setPushAlerts(val);
    localStorage.setItem("pushAlerts", val);
    if (val && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Completá los tres campos para actualizar la contraseña.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ color: "primary.main" }}>Configuración</Typography>
      <Stack spacing={2.5} sx={{ minWidth: 0 }}>
        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Perfil Personal</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: { sm: "flex-start" } }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 32 }}>{person.name.charAt(0)}</Avatar>
            <Stack spacing={2} sx={{ flex: 1, width: "100%" }}>
              <TextField label="Nombre Completo" defaultValue={person.name} size="small" fullWidth key={person.email + "n"} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Correo Institucional" defaultValue={person.email} size="small" fullWidth key={person.email + "e"} />
                <TextField label="Legajo" defaultValue={legajo} size="small" sx={{ width: { xs: "100%", sm: 200 } }} />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Área Asignada</InputLabel>
                  <Select value={selectedArea} label="Área Asignada" onChange={(e) => setSelectedArea(e.target.value)}>
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {areas.map(a => <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={handleUpdateArea}>Guardar Área</Button>
              </Stack>
              {areaSuccess && <Alert severity="success" sx={{ mt: 2 }}>{areaSuccess}</Alert>}

            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Preferencias</Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>Modo Oscuro</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Cambia la apariencia de toda la plataforma.
              </Typography>
            </Box>
            <FormControlLabel control={<Switch checked={mode === "dark"} onChange={onToggleMode} />} label="" sx={{ m: 0 }} />
          </Box>
        </Paper>

        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Notificaciones</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Alertas por Correo</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Recibir actualizaciones de tickets en {person.email}
                </Typography>
              </Box>
              <Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Notificaciones Push</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Alertas inmediatas en navegador y dispositivo móvil.
                </Typography>
              </Box>
              <Switch checked={pushAlerts} onChange={handlePushAlertsChange} />
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Seguridad</Typography>
          <Stack spacing={2}>
            <TextField
              label="Contraseña Actual"
              type="password"
              size="small"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nueva Contraseña"
                type="password"
                size="small"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                label="Confirmar Nueva Contraseña"
                type="password"
                size="small"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Stack>
            {passwordError && <Alert severity="error">{passwordError}</Alert>}
            {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
            <Box>
              <Button variant="contained" onClick={handleUpdatePassword} disabled={submitting}>
                {submitting ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}




