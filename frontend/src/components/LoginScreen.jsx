import React, { useState, useEffect } from "react";
import {
  Box, Card, Stack, Typography, TextField, Button, Link, IconButton,
  InputAdornment, Avatar, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { MailOutlined, VisibilityOff, Person, AdminPanelSettings, VisibilityOutlined, SchoolOutlined, SupportAgentOutlined, Close } from "@mui/icons-material";
import { api } from "../lib/api";

function RoleCard({ active, onClick, icon, label }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        cursor: "pointer",
        border: "2px solid",
        borderColor: active ? "primary.main" : "#e5e7eb",
        bgcolor: active ? "rgba(10,61,98,0.06)" : "#fff",
        borderRadius: 2,
        py: 1.8,
        textAlign: "center",
        transition: "all .2s",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Box sx={{ color: active ? "primary.main" : "#6b7280", mb: 0.3 }}>{icon}</Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: active ? "primary.main" : "#374151" }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function LoginScreen({ onLoginSuccess }) {
  const [tab, setTab] = useState(0);
  const [role, setRole] = useState("alumno");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [authCode, setAuthCode] = useState("");
  useEffect(() => {
    // Only fetch if tab === 1 and role === "staff" to avoid unnecessary calls? Actually, just fetch them.
    api.getAreas().then(setAreas).catch(() => {});
  }, []);

  const [loading, setLoading] = useState(false);

  const resetFormFields = () => {
    setError("");
    setSuccess("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setFirstName("");
    setLastName("");
    setAuthCode("");
    setSelectedArea("");
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    resetFormFields();
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    resetFormFields();
  };
  // NUEVOS ESTADOS: Para controlar el flujo del cartel flotante de recuperación
  const [openModal, setOpenModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // ESTADO: Para el modal de contacto
  const [contactOpen, setContactOpen] = useState(false);

  // Funciones para abrir y cerrar el cartel de recuperación
  const handleOpenModal = (e) => {
    e.preventDefault(); // Evita que recargue la página al clickear el Link
    setOpenModal(true);
    setIsSent(false);
    setRecoveryEmail("");
    setRecoveryError("");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRecoveryError("");
  };

  const handleOpenContact = (e) => {
    e.preventDefault();
    setContactOpen(true);
  };

  const handleCloseContact = () => {
    setContactOpen(false);
  };

  const handleSendRecovery = async (e) => {
    e.preventDefault();
    setRecoveryError("");
    
    if (recoveryEmail) {
      setRecoveryLoading(true);
      try {
        // Llamamos a la API real pasándole el email que escribió el usuario
        await api.recuperarPassword(recoveryEmail);
        
        // Si Django responde un 200 OK, pasamos a la pantalla verde
        setIsSent(true);
      } catch (err) {
        setRecoveryError(err.message || "Hubo un error al procesar la solicitud.");
      } finally {
        setRecoveryLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (tab === 0) {
      setLoading(true);
      try {
const usernameToLogin = role === "admin"
  ? `${firstName.trim()} ${lastName.trim()}`.trim()
  : (email.includes("@") ? email.split("@")[0] : email.trim());

if (!usernameToLogin || (role === "admin" && (!firstName.trim() || !lastName.trim()))) {
  setError(role === "admin" ? "Por favor ingrese su nombre y apellido" : "Por favor ingrese su email");
  setLoading(false);
  return;
}
        const usernameToLogin = role === "admin" 
          ? `${firstName.trim()} ${lastName.trim()}`.trim()
          : (email.includes("@") ? email.split("@")[0] : email.trim());
        
        if (!usernameToLogin || (role === "admin" && (!firstName.trim() || !lastName.trim()))) {
          setError(role === "admin" ? "Por favor ingrese su nombre y apellido" : "Por favor ingrese su email");
=======
        const usernameToLogin = (role === "admin" || role === "staff") 
          ? username.trim() 
          : (email.includes("@") ? email.split("@")[0] : email.trim());
        
        if (!usernameToLogin) {
          setError((role === "admin" || role === "staff") ? "Por favor ingrese su nombre de usuario" : "Por favor ingrese su email");
>>>>>>> 059cbad3cefe7ab2865f65a5ea4ca5cb7a4c490d
          setLoading(false);
          return;
        }

        const user = await api.login(usernameToLogin, password);
        onLoginSuccess(user);
      } catch (err) {
        setError(err.message || "Error al iniciar sesión");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!firstName || !lastName || !email || !password || !confirm) {
      setError("Por favor complete todos los campos");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      // Map frontend role to backend role
      const rolBackend = role === "admin" ? "SUPERVISOR" : role === "staff" ? "STAFF" : "ESTUDIANTE";
      const areaToRegister = role === "staff" ? selectedArea : null;

      await api.register(email.split("@")[0], password, email, firstName, lastName, confirm, rolBackend, areaToRegister, authCode);
      setSuccess("¡Registro exitoso! Iniciando sesión...");
      const loggedUser = await api.login(email.split('@')[0], password);
      setTimeout(() => onLoginSuccess(loggedUser), 1000);
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafbfc",
        p: 2,
        background: "linear-gradient(135deg,#fafbfc 0%,#fafbfc 55%,#eef2f7 55%,#eef2f7 100%)",
      }}
    >
      <Stack spacing={3} sx={{ alignItems: "center", width: "100%", maxWidth: 460 }}>
        <Stack spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "14px",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 22px rgba(10,61,98,0.25)",
            }}
          >
            <Avatar sx={{ bgcolor: "transparent", color: "#fff", width: 34, height: 34 }}>
              <SchoolIcon />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ color: "primary.main" }}>
            UnrafTickets
          </Typography>
          <Typography sx={{ color: "#7a8595", fontSize: 12, letterSpacing: 2, fontWeight: 600 }}>
            SOPORTE TÉCNICO INSTITUCIONAL
          </Typography>
        </Stack>

        <Card sx={{ width: "100%", p: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Button fullWidth variant={tab === 0 ? "contained" : "outlined"} onClick={() => handleTabChange(0)}>
              INICIAR SESIÓN
            </Button>
            <Button fullWidth variant={tab === 1 ? "contained" : "outlined"} onClick={() => handleTabChange(1)}>
              REGISTRARSE
            </Button>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <RoleCard active={role === "alumno"} onClick={() => handleRoleChange("alumno")} icon={<Person />} label="Alumno" />
                <RoleCard active={role === "staff"} onClick={() => handleRoleChange("staff")} icon={<SupportAgentOutlined />} label="Staff" />
                <RoleCard active={role === "admin"} onClick={() => handleRoleChange("admin")} icon={<AdminPanelSettings />} label="Admin" />
              </Stack>


            {tab === 1 && (
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Nombre</Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej. Mateo"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Apellido</Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej. Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                  />
                </Box>
              </Stack>
            )}

              {tab === 1 && role === "staff" && (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Área</Typography>
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <Select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} sx={{ bgcolor: "#f4f6f9" }}>
                      <MenuItem value="" disabled>Seleccione un área</MenuItem>
                      {areas.map(a => <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              )}


              {tab === 1 && (role === "staff" || role === "admin") && (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Código de Autorización</Typography>
                  <TextField
                    fullWidth
                    type="password"
                    placeholder="Ingrese el código secreto"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    size="small"
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                  />
                </>
              )}

            {tab === 0 && role === "admin" ? (
              <>
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Nombre</Typography>
                    <TextField
                      fullWidth
                      placeholder="Ej. Pedro"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      size="small"
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Apellido</Typography>
                    <TextField
                      fullWidth
                      placeholder="Ej. Gonzalez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      size="small"
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                    />
                  </Box>
                </Stack>
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Email</Typography>
                <TextField
                  key="student-email-input"
                  fullWidth
                  type="email"
                  placeholder="usuario@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                  sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlined sx={{ color: "#9aa4b2" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </>
            )}

            <Box sx={{ position: "relative", mb: tab === 1 ? 2 : 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Contraseña</Typography>
              <TextField
                fullWidth
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShow((s) => !s)}>
                          {show ? <VisibilityOff fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {tab === 0 && (
                <Link
                  href="#"
                  onClick={handleOpenModal}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    fontSize: 12,
                    color: "primary.main",
                    cursor: "pointer",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  ¿Olvidó su contraseña?
                </Link>
              )}
            </Box>

            {tab === 1 && (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Confirmar contraseña</Typography>
                <TextField
                  fullWidth
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  size="small"
                  sx={{ mb: 3, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm((s) => !s)}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.4, fontWeight: 700, letterSpacing: 1 }}>
              {tab === 1
                ? "CREAR CUENTA"
                : role === "admin"
                  ? "INGRESAR COMO ADMINISTRADOR"
                  : role === "staff"
                    ? "INGRESAR COMO STAFF"
                    : "INGRESAR COMO ALUMNO"}
            </Button>
          </Box>
        </Card>

        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
          ¿Necesita ayuda inmediata?{' '}
          <Link href="#" onClick={handleOpenContact} sx={{ fontWeight: 700, color: "primary.main" }}>
            Contactar Soporte
          </Link>
        </Typography>
      </Stack>

      {/* NUEVO COMPONENTE: Cartel flotante (Dialog) para el flujo de Olvidó su Contraseña */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="xs">
        {!isSent ? (
          // Paso 1: Formulario para ingresar el Gmail
          <Box component="form" onSubmit={handleSendRecovery}>
            <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>Recuperar Contraseña</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2, fontSize: 14, color: "#4b5563" }}>
                Ingresá tu correo electrónico y te enviaremos los pasos para restablecer tu contraseña.
              </DialogContentText>
              {recoveryError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {recoveryError}
                </Alert>
              )}
              <TextField
                autoFocus
                required
                fullWidth
                type="email"
                label="Correo Electrónico"
                placeholder="tu_usuario@gmail.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                variant="outlined"
                size="small"
                disabled={recoveryLoading}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={recoveryLoading}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }} disabled={recoveryLoading}>
                {recoveryLoading ? "Enviando..." : "Enviar Correo"}
              </Button>
            </DialogActions>
          </Box>
        ) : (
          // Paso 2: Mensaje de confirmación exitosa una vez presionado "Enviar"
          <Box sx={{ p: 2, textAlign: "center" }}>
            <DialogTitle sx={{ color: "success.main", fontWeight: 700, fontSize: 22 }}>
              ¡Solicitud Enviada!
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ fontSize: 14, color: "#374151" }}>
                Si la casilla <strong>{recoveryEmail}</strong> está registrada, recibirás un correo con las instrucciones y tu contraseña temporal para ingresar. Por favor, revisá tu bandeja de entrada.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", pb: 1.5 }}>
              <Button onClick={handleCloseModal} variant="contained" color="success" sx={{ fontWeight: 600, px: 4 }}>
                Entendido
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* NUEVO COMPONENTE: Cartel flotante (Dialog) para Contactar Soporte */}
      <Dialog open={contactOpen} onClose={handleCloseContact} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Contacto de Soporte
          <IconButton onClick={handleCloseContact} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: 15, color: "#374151" }}>
            Correo: soporte@unraf.edu.ar  
            Personalmente: Campus UNRaf en Av Angela de la Casa 2500 - Rafaela   Horarios de atención: 15 a 21hs
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function SchoolIcon() {
  return <SchoolOutlined sx={{ color: "#fff", fontSize: 34 }} />;
}

