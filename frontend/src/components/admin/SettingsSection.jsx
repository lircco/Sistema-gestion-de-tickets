import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  MailOutlined,
  PersonOutlineOutlined,
  BadgeOutlined,
  ApartmentOutlined,
} from "@mui/icons-material";
import { api } from "../../lib/api";

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
  const role = person.role?.toUpperCase();
  const isStaff = role === "STAFF";
  const showArea = isStaff || (role === "SUPERVISOR" && Boolean(person.area));
  const [areas, setAreas] = useState([]);
  useEffect(() => {
    if (!showArea) return;
    api
      .getAreas()
      .then(setAreas)
      .catch(() => {});
  }, [showArea]);
  // El área se asigna al registrarse y solo la puede cambiar un supervisor.
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
          <Typography component="h2" sx={{ fontWeight: 700, mb: 2.5 }}>
            Perfil Personal
          </Typography>
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "center", minWidth: 0 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {getInitials(person.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
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
