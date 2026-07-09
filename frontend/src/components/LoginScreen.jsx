import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Card, Stack, Typography, TextField, Button, Link, IconButton, InputAdornment, Avatar, Alert } from "@mui/material";
import { MailOutlined, VisibilityOff, Person, AdminPanelSettings, VisibilityOutlined, SchoolOutlined } from "@mui/icons-material";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loginMutation = useMutation({
    mutationFn: ({ username, password: pwd }) => api.login(username, pwd),
    onSuccess: (user) => onLoginSuccess(user),
    onError: (err) => setError(err.message || "Error al iniciar sesión"),
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, password: pwd, email: mail, first_name, last_name, password_confirm }) =>
      api.register(username, pwd, mail, first_name, last_name, password_confirm),
    onSuccess: (user) => {
      setSuccess("¡Registro exitoso! Iniciando sesión...");
      setTimeout(() => onLoginSuccess(user), 1000);
    },
    onError: (err) => setError(err.message || "Error al registrarse"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (tab === 0) {
      loginMutation.mutate({ username: email.split("@")[0], password });
      return;
    }

    if (!name || !email || !password || !confirm) {
      setError("Por favor complete todos los campos");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const [firstName = "", lastName = ""] = name.split(" ", 2);
    registerMutation.mutate({
      username: email.split("@")[0],
      password,
      email,
      first_name: firstName,
      last_name: lastName,
      password_confirm: confirm,
    });
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
            <Button fullWidth variant={tab === 0 ? "contained" : "outlined"} onClick={() => { setTab(0); setError(""); setSuccess(""); }}>
              INICIAR SESIÓN
            </Button>
            <Button fullWidth variant={tab === 1 ? "contained" : "outlined"} onClick={() => { setTab(1); setError(""); setSuccess(""); }}>
              REGISTRARSE
            </Button>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            {tab === 0 && (
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <RoleCard active={role === "alumno"} onClick={() => setRole("alumno")} icon={<Person />} label="Soy Alumno" />
                <RoleCard active={role === "admin"} onClick={() => setRole("admin")} icon={<AdminPanelSettings />} label="Soy Administrador" />
              </Stack>
            )}

            {tab === 1 && (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Nombre completo</Typography>
                <TextField
                  fullWidth
                  placeholder="Ej. Mateo Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="small"
                  sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                />
              </>
            )}

            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Email</Typography>
            <TextField
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
                <Link href="#" sx={{ position: "absolute", top: 0, right: 0, fontSize: 12, color: "primary.main" }}>
                  ¿Olvidó su contraseña?
                </Link>
              )}
            </Box>

            {tab === 1 && (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Confirmar contraseña</Typography>
                <TextField
                  fullWidth
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  size="small"
                  sx={{ mb: 3, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}
                />
              </>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Button type="submit" fullWidth variant="contained" size="large" sx={{ py: 1.4, fontWeight: 700, letterSpacing: 1 }}>
              {tab === 1
                ? "CREAR CUENTA"
                : role === "admin"
                ? "INGRESAR COMO ADMINISTRADOR"
                : "INGRESAR COMO ALUMNO"}
            </Button>
          </Box>
        </Card>

        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
          ¿Necesita ayuda inmediata?{' '}
          <Link href="#" sx={{ fontWeight: 700, color: "primary.main" }}>
            Contactar Soporte
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}

function SchoolIcon() {
  return <SchoolOutlined sx={{ color: "#fff", fontSize: 34 }} />;
}
