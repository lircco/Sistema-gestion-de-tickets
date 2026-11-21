import React, { useState, useEffect, useRef } from "react";
import {
  Stack,
  Typography,
  Paper,
  Box,
  Avatar,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

export default function SettingsSection({ person, mode, onToggleMode, legajo }) {
  const auth = useAuth();
  const fileInputRef = useRef(null);

  // 1. Foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState(person.foto_perfil || null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoError, setFotoError] = useState("");
  const [fotoSuccess, setFotoSuccess] = useState("");

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoError("");
    setFotoSuccess("");
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append("foto_perfil", file);
      const updated = await api.updateMe(formData);
      const nuevaUrl = updated.foto_perfil || URL.createObjectURL(file);
      setFotoPerfil(nuevaUrl);
      setFotoSuccess("Foto de perfil actualizada correctamente.");
      if (auth?.setUser) {
        auth.setUser((prev) => (prev ? { ...prev, foto_perfil: updated.foto_perfil || nuevaUrl } : prev));
      }
      setTimeout(() => setFotoSuccess(""), 3500);
    } catch (err) {
      setFotoError(err.message || "Error al subir la foto de perfil.");
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. DNI (Inmutable una vez cargado)
  const dniInicial = person.dni ? String(person.dni).trim() : "";
  const [dni, setDni] = useState(dniInicial);
  const [dniBloqueado, setDniBloqueado] = useState(Boolean(dniInicial));
  const [savingDni, setSavingDni] = useState(false);
  const [dniError, setDniError] = useState("");
  const [dniSuccess, setDniSuccess] = useState("");

  const handleGuardarDni = async () => {
    const valor = dni.trim();
    if (!valor) {
      setDniError("Ingresá un número de DNI.");
      return;
    }
    if (!/^\d{6,12}$/.test(valor)) {
      setDniError("El DNI debe contener solo números (entre 6 y 12 dígitos).");
      return;
    }
    setDniError("");
    setDniSuccess("");
    setSavingDni(true);
    try {
      await api.updateMe({ dni: valor });
      setDni(valor);
      setDniBloqueado(true);
      setDniSuccess("DNI registrado correctamente.");
      if (auth?.setUser) {
        auth.setUser((prev) => (prev ? { ...prev, dni: valor } : prev));
      }
      setTimeout(() => setDniSuccess(""), 3500);
    } catch (err) {
      setDniError(err.message || "Error al registrar el DNI.");
    } finally {
      setSavingDni(false);
    }
  };

  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(person.area || "");
  // Una vez asignada, el área solo la puede cambiar un supervisor.
  const [areaBloqueada, setAreaBloqueada] = useState(Boolean(person.area));
  const [areaSuccess, setAreaSuccess] = useState("");
  useEffect(() => {
    api
      .getAreas()
      .then(setAreas)
      .catch(() => {});
  }, []);
  const [areaError, setAreaError] = useState("");
  const handleUpdateArea = async () => {
    if (!selectedArea) {
      setAreaError("Seleccione un área para guardar");
      setAreaSuccess("");
      return;
    }
    setAreaError("");
    try {
      await api.updateMe({ area: selectedArea });
      setAreaBloqueada(true);
      setAreaSuccess("Área actualizada correctamente.");
      setTimeout(() => setAreaSuccess(""), 3000);
    } catch (e) {
      setAreaError("Error al actualizar el área");
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
      <Typography variant="h4" sx={{ color: "primary.main" }}>
        Configuración
      </Typography>
      <Stack spacing={2.5} sx={{ minWidth: 0 }}>
        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Perfil Personal</Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: { sm: "flex-start" } }}
          >
            <Stack direction="column" sx={{ alignItems: "center" }} spacing={1}>
              <Avatar
                src={fotoPerfil}
                sx={{ width: 88, height: 88, bgcolor: "primary.main", fontSize: 32 }}
              >
                {person.name ? person.name.charAt(0) : "U"}
              </Avatar>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFotoChange}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFoto}
                sx={{ fontSize: 11, textTransform: "none" }}
              >
                {uploadingFoto ? "Subiendo..." : "Cambiar foto"}
              </Button>
              {fotoError && (
                <Typography sx={{ fontSize: 11, color: "error.main", textAlign: "center", maxWidth: 120 }}>
                  {fotoError}
                </Typography>
              )}
              {fotoSuccess && (
                <Typography sx={{ fontSize: 11, color: "success.main", textAlign: "center", maxWidth: 120 }}>
                  {fotoSuccess}
                </Typography>
              )}
            </Stack>

            <Stack spacing={2} sx={{ flex: 1, width: "100%" }}>
              <TextField
                label="Nombre Completo"
                defaultValue={person.name}
                size="small"
                fullWidth
                key={person.email + "n"}
                slotProps={{ input: { readOnly: true } }}
                disabled
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Correo Institucional"
                  defaultValue={person.email}
                  size="small"
                  fullWidth
                  key={person.email + "e"}
                  slotProps={{ input: { readOnly: true } }}
                  disabled
                />
                <TextField
                  label="Legajo"
                  defaultValue={legajo}
                  size="small"
                  sx={{ width: { xs: "100%", sm: 200 } }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "flex-start" } }}>
                <TextField
                  label="DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  size="small"
                  disabled={dniBloqueado || savingDni}
                  helperText={
                    dniBloqueado
                      ? "El DNI ya fue registrado y no se puede modificar."
                      : "Una vez guardado, no se podrá modificar."
                  }
                  sx={{ width: { xs: "100%", sm: 260 } }}
                  slotProps={{ input: { readOnly: dniBloqueado } }}
                />
                {!dniBloqueado && (
                  <Button
                    variant="outlined"
                    onClick={handleGuardarDni}
                    disabled={savingDni || !dni.trim()}
                    sx={{ height: 40 }}
                  >
                    {savingDni ? "Guardando..." : "Guardar DNI"}
                  </Button>
                )}
              </Stack>
              {dniSuccess && (
                <Alert severity="success" sx={{ py: 0.5 }}>
                  {dniSuccess}
                </Alert>
              )}
              {dniError && (
                <Alert severity="error" sx={{ py: 0.5 }}>
                  {dniError}
                </Alert>
              )}
              {person.role?.toUpperCase() === "STAFF" && (
                <>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Área Asignada</InputLabel>
                      <Select
                        value={selectedArea}
                        label="Área Asignada"
                        onChange={(e) => setSelectedArea(e.target.value)}
                        disabled={areaBloqueada}
                      >
                        <MenuItem value="" disabled>
                          <em>Seleccioná un área</em>
                        </MenuItem>
                        {areas.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button variant="outlined" onClick={handleUpdateArea} disabled={areaBloqueada}>
                      Guardar Área
                    </Button>
                  </Stack>
                  {areaBloqueada && (
                    <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
                      Para cambiar de área, pedíselo a un supervisor.
                    </Typography>
                  )}
                  {areaSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {areaSuccess}
                    </Alert>
                  )}
                  {areaError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {areaError}
                    </Alert>
                  )}
                </>
              )}
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
            <FormControlLabel
              control={<Switch checked={mode === "dark"} onChange={onToggleMode} />}
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Notificaciones</Typography>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Alertas por Correo</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Recibir actualizaciones de tickets en {person.email}
                </Typography>
              </Box>
              <Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
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
      </Stack>
    </Stack>
  );
}
