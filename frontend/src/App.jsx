import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, LinearProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import LoginScreen from "./components/LoginScreen";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserDashboard from "./components/user/UserDashboard";

const buildTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: mode === "dark" ? "#4f9cd6" : "#0a3d62" },
    secondary: { main: "#f5b400" },
    background: mode === "dark"
      ? { default: "#0f172a", paper: "#1e293b" }
      : { default: "#f4f6f9", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'Inter','Roboto',sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
});

const isAdminRole = (rol) => rol === "SUPERVISOR" || rol === "STAFF";

function AppRoutes({ mode, onToggleMode }) {
  const { user, isLoadingUser, setUser, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoadingUser) return <LinearProgress />;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <LoginScreen onLoginSuccess={(u) => { setUser(u); navigate("/"); }} />
          )
        }
      />
      <Route
        path="/admin/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : !isAdminRole(user.rol) ? (
            <Navigate to="/" replace />
          ) : (
            <AdminDashboard onLogout={handleLogout} admin={user} mode={mode} onToggleMode={onToggleMode} />
          )
        }
      />
      <Route
        path="/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdminRole(user.rol) ? (
            <Navigate to="/admin" replace />
          ) : (
            <UserDashboard onLogout={handleLogout} user={user} mode={mode} onToggleMode={onToggleMode} />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes mode={mode} onToggleMode={toggleMode} />
      </ThemeProvider>
    </AuthProvider>
  );
}
