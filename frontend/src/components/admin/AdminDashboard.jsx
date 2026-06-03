import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [active, setActive] = useState("dashboard");
  const [openTicket, setOpenTicket] = useState(null);

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({ queryKey: ["tickets"], queryFn: api.getTickets });
  const { data: stats, isLoading: isLoadingStats } = useQuery({ queryKey: ["stats"], queryFn: api.getStats });

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined fontSize="small" /> },
    { key: "tickets", label: "Ticket List", icon: <ConfirmationNumberOutlined fontSize="small" /> },
    { key: "reports", label: "Reports", icon: <BarChartOutlined fontSize="small" /> },
    { key: "areas", label: "Area Management", icon: <ApartmentOutlined fontSize="small" /> },
    { key: "kb", label: "Knowledge Base", icon: <MenuBookOutlined fontSize="small" /> },
    { key: "settings", label: "Settings", icon: <SettingsOutlined fontSize="small" /> },
  ];

  if (isLoadingTickets || isLoadingStats) return <LinearProgress />;

  const ticketList = tickets.results || tickets;

  return (
    <AppShell
      items={items}
      active={active}
      onSelect={(k) => {
        setActive(k);
        setOpenTicket(null);
      }}
      onLogout={onLogout}
      user={{ name: admin.username, role: admin.rol }}
      mode={mode}
      onToggleMode={onToggleMode}
    >
      {active === "dashboard" && <AdminHome stats={stats} tickets={ticketList} onOpenTicket={(t) => { setActive("tickets"); setOpenTicket(t); }} />}
      {active === "tickets" && !openTicket && <TicketsTable tickets={ticketList} onOpenTicket={(t) => setOpenTicket(t)} />}
      {active === "tickets" && openTicket && <TicketDetail ticket={openTicket} onBack={() => setOpenTicket(null)} admin={admin} />}
      {active === "reports" && <ReportsSection />}
      {active === "areas" && <AreaManagementSection />}
      {active === "kb" && <KnowledgeBaseSection />}
      {active === "settings" && <SettingsSection person={{ name: admin.username, email: admin.email }} mode={mode} onToggleMode={onToggleMode} legajo="2025-000142" />}
      {active !== "dashboard" && active !== "tickets" && active !== "reports" && active !== "areas" && active !== "kb" && active !== "settings" && (
        <PlaceholderSection title={items.find((i) => i.key === active)?.label || ""} />
      )}
    </AppShell>
  );
}
