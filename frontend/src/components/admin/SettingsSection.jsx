import React, { useState, useEffect, useRef } from "react";
import {
  Stack,
  Typography,
  Paper,
  Box,
  Avatar,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

const ROL_LABELS = { ESTUDIANTE: "Estudiante", STAFF: "Staff de Área", SUPERVISOR: "Supervisor" };

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase() || "U"
  );
}

// Dato de perfil de solo lectura: ícono + etiqueta (dt) + valor (dd).
function ProfileField({ icon, label, value, hint }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", minWidth: 0 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: "action.hover",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="dt"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
        <Typography
          component="dd"
          sx={{ m: 0, fontSize: 15, fontWeight: 600, overflowWrap: "anywhere" }}
        >
          {value}
        </Typography>
        {hint && (
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>{hint}</Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function SettingsSection({ person, mode, onToggleMode }) {
  const auth = useAuth();
  const fileInputRef = useRef(null);

  const role = person.role?.toUpperCase();
  const isStaff = role === "STAFF";
  const showArea = isStaff || (role === "SUPERVISOR" && Boolean(person.area));

  // 1. Foto de perfil (Issue #97)
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
        auth.setUser((prev) =>
          prev ? { ...prev, foto_perfil: updated.foto_perfil || nuevaUrl } : prev,
        );
      }
      setTimeout(() => setFotoSuccess(""), 3500);
    } catch (err) {
      setFotoError(err.message || "Error al subir la foto de perfil.");
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. DNI (Inmutable una vez cargado) (Issue #97)
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
  useEffect(() => {
    if (!showArea) return;
    api
      .getAreas()
      .then(setAreas)
      .catch(() => {});
  }, [showArea]);
  const areaNombre = areas.find((a) => a.id === person.area)?.nombre || "";

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

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ color: "primary.main" }}>
        Configuración
      </Typography>
      <Stack spacing={2.5} sx={{ minWidth: 0 }}>
        <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
          <Typography component="h2" sx={{ fontWeight: 700, mb: 2.5 }}>
            Perfil Personal
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: { sm: "flex-start" }, minWidth: 0 }}
          >
            <Stack direction="column" sx={{ alignItems: "center" }} spacing={1}>
              <Avatar
                src={fotoPerfil}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {getInitials(person.name)}
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
                <Typography
                  sx={{ fontSize: 11, color: "error.main", textAlign: "center", maxWidth: 120 }}
                >
                  {fotoError}
                </Typography>
              )}
              {fotoSuccess && (
                <Typography
                  sx={{ fontSize: 11, color: "success.main", textAlign: "center", maxWidth: 120 }}
                >
                  {fotoSuccess}
                </Typography>
              )}
            </Stack>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                component="h3"
                variant="h5"
                sx={{ lineHeight: 1.2, overflowWrap: "anywhere" }}
              >
                {person.name}
              </Typography>
              {person.email && (
                <Typography sx={{ color: "text.secondary", mt: 0.5, overflowWrap: "anywhere" }}>
                  {person.email}
                </Typography>
              )}
              {role && (
                <Chip
                  size="small"
                  label={ROL_LABELS[role] || person.role}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: { sm: "flex-start" }, mt: 2.5 }}
              >
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
                <Alert severity="success" sx={{ py: 0.5, mt: 1 }}>
                  {dniSuccess}
                </Alert>
              )}
              {dniError && (
                <Alert severity="error" sx={{ py: 0.5, mt: 1 }}>
                  {dniError}
                </Alert>
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box
            component="dl"
            sx={{
              m: 0,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 3,
            }}
          >
            {person.username && (
              <ProfileField
                icon={<PersonOutlineOutlined fontSize="small" />}
                label="Usuario"
                value={person.username}
              />
            )}
            <ProfileField
              icon={<MailOutlined fontSize="small" />}
              label="Correo institucional"
              value={person.email || "—"}
            />
            {role && (
              <ProfileField
                icon={<BadgeOutlined fontSize="small" />}
                label="Rol"
                value={ROL_LABELS[role] || person.role}
              />
            )}
            {showArea && (
              <ProfileField
                icon={<ApartmentOutlined fontSize="small" />}
                label="Área asignada"
                value={person.area ? areaNombre || "…" : "Sin asignar"}
                hint={isStaff ? "Para cambiar de área, pedíselo a un supervisor." : undefined}
              />
            )}
          </Box>
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
