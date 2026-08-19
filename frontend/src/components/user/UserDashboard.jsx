import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { filterTickets } from "../../lib/utils";
import AppShell from "../AppShell";
import UserHome from "./UserHome";
import UserTicketsTable from "./UserTicketsTable";
import UserTicketDetail from "./UserTicketDetail";
import NewTicketDialog from "./NewTicketDialog";
import SettingsSection from "../admin/SettingsSection";
import { Paper, Typography, LinearProgress } from "@mui/material";
import { DashboardOutlined, ConfirmationNumberOutlined, SettingsOutlined } from "@mui/icons-material";

export default function UserDashboard({ onLogout, user, mode, onToggleMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openNew, setOpenNew] = useState(false);
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const filteredTickets = filterTickets(tickets, search);

  const loadTickets = useCallback(async () => {
    try {
      const data = await api.getTickets();
      setTickets(data.results || data);
    } catch (err) {
      console.error("Error cargando los tickets", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined fontSize="small" /> },
    { key: "tickets", label: "Mis Tickets", icon: <ConfirmationNumberOutlined fontSize="small" /> },
    { key: "settings", label: "Configuración", icon: <SettingsOutlined fontSize="small" /> },
  ];

  if (isLoading) return <LinearProgress />;

  const active = location.pathname.split("/").filter(Boolean)[0] || "dashboard";

  return (
    <>
      <AppShell
        items={items}
        active={active}
        onSelect={(k) => navigate(k === "dashboard" ? "/" : `/${k}`)}
        onLogout={onLogout}
        user={{ name: displayName, role: "Alumno UNRaf" }}
        mode={mode}
        onToggleMode={onToggleMode}
        searchValue={search}
        onSearchChange={setSearch}
      >
        <Routes>
          <Route index element={<UserHome user={{ name: displayName }} tickets={tickets} onOpenNew={() => setOpenNew(true)} onGoTickets={() => navigate("/tickets")} onOpenTicket={(t) => navigate(`/tickets/${t.id}`)} />} />
          <Route path="tickets" element={<UserTicketsTable tickets={filteredTickets} onOpenNew={() => setOpenNew(true)} onOpenTicket={(t) => navigate(`/tickets/${t.id}`)} />} />
          <Route path="tickets/:id" element={<UserTicketDetail tickets={tickets} user={{ name: displayName }} onBack={() => navigate("/tickets")} />} />
          <Route path="settings" element={<SettingsSection person={{ name: displayName, email: user.email }} mode={mode} onToggleMode={onToggleMode} legajo="2024-001284" />} />
          <Route path="*" element={<Paper sx={{ p: 6, textAlign: "center" }}><Typography variant="h5">Página no encontrada</Typography></Paper>} />
        </Routes>
      </AppShell>
      <NewTicketDialog open={openNew} onClose={() => setOpenNew(false)} onCreated={loadTickets} />
    </>
  );
}
