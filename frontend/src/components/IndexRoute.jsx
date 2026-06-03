import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider, createTheme, LinearProgress } from "@mui/material";
import { api } from "../lib/api";
import LoginScreen from "./LoginScreen";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";

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

export default function Index() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: api.getMe,
    retry: false,
  });

  if (isLoadingUser) return <LinearProgress />;

  const handleLogout = async () => {
    try {
      await api.logout();
      queryClient.setQueryData(["me"], null);
      queryClient.invalidateQueries();
    } catch (e) {
      console.error("Error logging out", e);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!currentUser && (
        <LoginScreen onLoginSuccess={(user) => queryClient.setQueryData(["me"], user)} />
      )}
      {currentUser && (currentUser.rol === "SUPERVISOR" || currentUser.rol === "STAFF") && (
        <AdminDashboard onLogout={handleLogout} admin={currentUser} mode={mode} onToggleMode={toggleMode} />
      )}
      {currentUser && currentUser.rol === "ESTUDIANTE" && (
        <UserDashboard onLogout={handleLogout} user={currentUser} mode={mode} onToggleMode={toggleMode} />
      )}
    </ThemeProvider>
  );
}
