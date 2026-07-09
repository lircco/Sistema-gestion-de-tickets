import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import AppShell from "../AppShell";
import UserHome from "./UserHome";
import UserTicketsTable from "./UserTicketsTable";
import NewTicketDialog from "./NewTicketDialog";
import SettingsSection from "../admin/SettingsSection";
import { LinearProgress } from "@mui/material";
import { DashboardOutlined, ConfirmationNumberOutlined, SettingsOutlined } from "@mui/icons-material";

export default function UserDashboard({ onLogout, user, mode, onToggleMode }) {
  const [active, setActive] = useState("dashboard");
  const [openNew, setOpenNew] = useState(false);
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

  const { data: tickets = [], isLoading } = useQuery({ queryKey: ["tickets"], queryFn: api.getTickets });
  const ticketList = tickets.results || tickets;

  if (isLoading) return <LinearProgress />;

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined fontSize="small" /> },
    { key: "tickets", label: "Mis Tickets", icon: <ConfirmationNumberOutlined fontSize="small" /> },
    { key: "settings", label: "Configuración", icon: <SettingsOutlined fontSize="small" /> },
  ];

  return (
    <>
      <AppShell
        items={items}
        active={active}
        onSelect={setActive}
        onLogout={onLogout}
        user={{ name: displayName, role: "Alumno UNRaf" }}
        mode={mode}
        onToggleMode={onToggleMode}
      >
        {active === "dashboard" && (
          <UserHome user={{ name: user.username }} tickets={ticketList} onOpenNew={() => setOpenNew(true)} onGoTickets={() => setActive("tickets")} />
        )}
        {active === "tickets" && <UserTicketsTable tickets={ticketList} onOpenNew={() => setOpenNew(true)} />}
        {active === "settings" && (
          <SettingsSection person={{ name: user.username, email: user.email }} mode={mode} onToggleMode={onToggleMode} legajo="2024-001284" />
        )}
      </AppShell>
      <NewTicketDialog open={openNew} onClose={() => setOpenNew(false)} />
    </>
  );
}
