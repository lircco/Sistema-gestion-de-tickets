import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Stack, Box, IconButton, Typography, Chip, Paper, Divider, TextField, Button } from "@mui/material";
import { ArrowBack, CallSplitOutlined, SwapHorizOutlined, HighlightOffOutlined, PrintOutlined, MoreVertOutlined, SendOutlined } from "@mui/icons-material";
import DetailRow from "../shared/DetailRow";

const ESTADO_COLOR = {
  ABIERTO: { bg: "#dbeafe", fg: "#1d4ed8" },
  EN_PROGRESO: { bg: "#fef3c7", fg: "#92400e" },
  CERRADO: { bg: "#d1fae5", fg: "#065f46" },
};

const PRIORIDAD_COLOR = {
  ALTA: { bg: "#fee2e2", fg: "#991b1b" },
  MEDIA: { bg: "#fef3c7", fg: "#92400e" },
  BAJA: { bg: "#f3f4f6", fg: "#374151" },
};

const ROL_LABELS = { ESTUDIANTE: "Estudiante", STAFF: "Staff de Área", SUPERVISOR: "Supervisor" };

export default function TicketDetail({ tickets, onBack, admin }) {
  const { id } = useParams();
  const ticket = (tickets || []).find((t) => String(t.id) === String(id));
  const [reply, setReply] = useState("");
  const [followUps, setFollowUps] = useState([]);

  const adminName = [admin?.first_name, admin?.last_name].filter(Boolean).join(" ") || admin?.username || "Vos";

  const handleSend = () => {
    if (!reply.trim()) return;
    setFollowUps((prev) => [...prev, { text: reply.trim(), time: "Ahora" }]);
    setReply("");
  };

  if (!ticket) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <IconButton onClick={onBack}><ArrowBack /></IconButton>
          <Typography variant="h5">Ticket no encontrado</Typography>
        </Stack>
      </Stack>
    );
  }

  const solicitanteNombre = [ticket.creado_por_first_name, ticket.creado_por_last_name].filter(Boolean).join(" ") || ticket.creado_por_nombre;
  const estadoColor = ESTADO_COLOR[ticket.estado] || { bg: "#f3f4f6", fg: "#374151" };
  const prioridadColor = PRIORIDAD_COLOR[ticket.prioridad] || { bg: "#f3f4f6", fg: "#374151" };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <IconButton onClick={onBack}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
            #{ticket.id} · Creado el {new Date(ticket.creado_el).toLocaleString()}
          </Typography>
          <Typography variant="h5" sx={{ wordBreak: "break-word" }}>{ticket.titulo}</Typography>
        </Box>
        <Chip label={ticket.estado} sx={{ bgcolor: estadoColor.bg, color: estadoColor.fg, fontWeight: 700 }} />
        <Chip label={ticket.prioridad} sx={{ bgcolor: prioridadColor.bg, color: prioridadColor.fg, fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }} />
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        <Stack spacing={2.5} sx={{ width: { lg: 280 }, flexShrink: 0 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Solicitante</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "primary.main", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {solicitanteNombre.charAt(0).toUpperCase() || "?"}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{solicitanteNombre}</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{ROL_LABELS[ticket.creado_por_rol] || ticket.creado_por_rol}</Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <DetailRow label="Usuario" value={ticket.creado_por_nombre} />
            <DetailRow label="Email" value={ticket.creado_por_email || "—"} />
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Acciones Rápidas</Typography>
            <Stack spacing={1}>
              <Button variant="outlined" startIcon={<CallSplitOutlined />} fullWidth>Derivar Ticket</Button>
              <Button variant="outlined" startIcon={<SwapHorizOutlined />} fullWidth>Cambiar Estado</Button>
              <Button variant="outlined" color="error" startIcon={<HighlightOffOutlined />} fullWidth>Cerrar Ticket</Button>
            </Stack>
          </Paper>
        </Stack>

        <Paper sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>● Historial de Mensajes</Typography>
            <Stack direction="row">
              <IconButton size="small"><PrintOutlined fontSize="small" /></IconButton>
              <IconButton size="small"><MoreVertOutlined fontSize="small" /></IconButton>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: "action.hover", maxWidth: { xs: "100%", md: "85%" } }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{solicitanteNombre}</Typography>
                <Typography sx={{ fontSize: 11, opacity: 0.8 }}>{new Date(ticket.creado_el).toLocaleString()}</Typography>
              </Stack>
              <Typography sx={{ fontSize: 13 }}>{ticket.descripcion}</Typography>
            </Box>

            {(ticket.respuestas || []).map((r) => {
              const isAgent = r.autor_rol === "STAFF" || r.autor_rol === "SUPERVISOR";
              return (
                <Box
                  key={r.id}
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    bgcolor: isAgent ? "primary.main" : "action.hover",
                    color: isAgent ? "#fff" : "text.primary",
                    alignSelf: isAgent ? "flex-end" : "flex-start",
                    maxWidth: { xs: "100%", md: "85%" },
                    ml: isAgent ? "auto" : 0,
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{r.autor_nombre}</Typography>
                    <Typography sx={{ fontSize: 11, opacity: 0.8 }}>{new Date(r.creado_el).toLocaleString()}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 13 }}>{r.mensaje}</Typography>
                </Box>
              );
            })}

            {followUps.map((m, i) => (
              <Box key={i} sx={{ p: 1.8, borderRadius: 2, bgcolor: "primary.main", color: "#fff", alignSelf: "flex-end", maxWidth: { xs: "100%", md: "85%" }, ml: "auto" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{adminName}</Typography>
                  <Typography sx={{ fontSize: 11, opacity: 0.8 }}>{m.time}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 13 }}>{m.text}</Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <TextField
            placeholder="Escribí tu respuesta o seguimiento aquí..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
            <Button variant="contained" endIcon={<SendOutlined />} onClick={handleSend}>
              Enviar Respuesta
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}
