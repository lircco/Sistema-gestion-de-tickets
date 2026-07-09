import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import AppShell from "../AppShell";
import AdminHome from "./AdminHome";
import TicketsTable from "./TicketsTable";
import ReportsSection from "./ReportsSection";
import AreaManagementSection from "./AreaManagementSection";
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import SettingsSection from "./SettingsSection";
import TicketDetail from "./TicketDetail";
import { Paper, Typography, LinearProgress } from "@mui/material";
import { DashboardOutlined, ConfirmationNumberOutlined, BarChartOutlined, ApartmentOutlined, MenuBookOutlined, SettingsOutlined } from "@mui/icons-material";

function PlaceholderSection({ title }) {
  return (
    <Paper sx={{ p: 6, textAlign: "center" }}>
      <Typography variant="h5" sx={{ mb: 1 }}>{title}</Typography>
      <Typography sx={{ color: "#6b7280" }}>Sección en construcción.</Typography>
    </Paper>
  );
}

export default function AdminDashboard({ onLogout, admin, mode, onToggleMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = [admin.first_name, admin.last_name].filter(Boolean).join(" ") || admin.username;

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [ticketsData, statsData] = await Promise.all([api.getTickets(), api.getStats()]);
      setTickets(ticketsData.results || ticketsData);
      setStats(statsData);
    } catch (err) {
      console.error("Error cargando el panel", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined fontSize="small" /> },
    { key: "tickets", label: "Ticket List", icon: <ConfirmationNumberOutlined fontSize="small" /> },
    { key: "reports", label: "Reports", icon: <BarChartOutlined fontSize="small" /> },
    { key: "areas", label: "Area Management", icon: <ApartmentOutlined fontSize="small" /> },
    { key: "kb", label: "Knowledge Base", icon: <MenuBookOutlined fontSize="small" /> },
    { key: "settings", label: "Settings", icon: <SettingsOutlined fontSize="small" /> },
  ];

  if (isLoading) return <LinearProgress />;

  const active = location.pathname.split("/").filter(Boolean)[1] || "dashboard";

  return (
    <AppShell
      items={items}
      active={active}
      onSelect={(k) => navigate(k === "dashboard" ? "/admin" : `/admin/${k}`)}
      onLogout={onLogout}
      user={{ name: displayName, role: admin.rol }}
      mode={mode}
      onToggleMode={onToggleMode}
    >
      <Routes>
        <Route index element={<AdminHome stats={stats} tickets={tickets} onOpenTicket={(t) => navigate(`/admin/tickets/${t.id}`)} />} />
        <Route path="tickets" element={<TicketsTable tickets={tickets} onOpenTicket={(t) => navigate(`/admin/tickets/${t.id}`)} />} />
        <Route path="tickets/:id" element={<TicketDetail tickets={tickets} admin={admin} onBack={() => navigate("/admin/tickets")} />} />
        <Route path="reports" element={<ReportsSection />} />
        <Route path="areas" element={<AreaManagementSection />} />
        <Route path="kb" element={<KnowledgeBaseSection />} />
        <Route path="settings" element={<SettingsSection person={{ name: admin.username, email: admin.email }} mode={mode} onToggleMode={onToggleMode} legajo="2025-000142" />} />
        <Route path="*" element={<PlaceholderSection title="Página no encontrada" />} />
      </Routes>
    </AppShell>
  );
}
