import React, { useState } from "react";
import { Stack, Box, IconButton, Typography, Chip, Paper, Divider, TextField } from "@mui/material";
import { ArrowBack, CallSplitOutlined, SwapHorizOutlined, HighlightOffOutlined, PrintOutlined, MoreVertOutlined, SendOutlined } from "@mui/icons-material";
import DetailRow from "../shared/DetailRow";

export default function TicketDetail({ ticket, onBack, admin }) {
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([
    { who: "Julián Martinez", role: "user", time: "Hoy, 10:45 AM", text: "Buenos días, no estoy pudiendo ingresar al campus. Me dice que mi usuario está bloqueado o que la contraseña es incorrecta, pero ayer funcionaba bien. Necesito subir un trabajo práctico antes del mediodía. ¡Gracias!" },
    { who: "Nota Interna - Agente García", role: "note", time: "Hoy, 09:17 AM", text: "Verificando logs en el servidor SIU. Parece haber desincronización en el LDAP de alumnos de tercer año." },
    { who: "Agente Soporte UNRaf", role: "agent", time: "Hoy, 09:25 AM", text: "Hola Julián, estamos revisando el sistema. Hubo un mantenimiento anoche y es posible que algunos perfiles necesiten re-sincronizarse. ¿Podrías intentar ingresar nuevamente en 10 minutos? Ya reiniciamos tu token de sesión." },
    { who: "Julián Martinez", role: "user", time: "Hoy, 09:30 AM", text: "Sigo con el mismo problema. Les adjunto la captura de pantalla de lo que me aparece." },
  ]);

  const handleSend = () => {
    if (!reply.trim()) return;
    setMessages((prev) => [...prev, { who: admin.name, role: "agent", time: "Ahora", text: reply.trim() }]);
    setReply("");
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <IconButton onClick={onBack}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
            {ticket.id} · Creado el 14 Oct, 2023 - 10:45 AM
          </Typography>
          <Typography variant="h5" sx={{ wordBreak: "break-word" }}>{ticket.title}</Typography>
        </Box>
        <Chip label="EN PROCESO" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
        <Chip label="ALTA" sx={{ bgcolor: "#fee2e2", color: "#991b1b", fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }} />
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        <Stack spacing={2.5} sx={{ width: { lg: 280 }, flexShrink: 0 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Solicitante</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "primary.main", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                J
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Julián Martinez</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Estudiante - Ing. en Computación</Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <DetailRow label="DNI" value="42.891.002" />
            <DetailRow label="Email" value="j.martinez@unraf.edu.ar" />
            <DetailRow label="Legajo" value="UNR-4922" />
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Línea de Tiempo</Typography>
            <Stack spacing={1.5}>
              {[
                { t: "Hoy, 09:15 AM", title: "Cambio de Estado", d: 'De "Pendiente" a "En Proceso" por Agente García.' },
                { t: "Ayer, 04:30 PM", title: "Ticket Derivado", d: "Mesa de Entradas derivó a Soporte Técnico." },
                { t: "14 Oct, 10:45 AM", title: "Ticket Creado", d: "El sistema registró la solicitud vía Web." },
              ].map((e, i) => (
                <Box key={i} sx={{ pl: 1.5, borderLeft: "2px solid", borderColor: i === 0 ? "primary.main" : "divider" }}>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{e.t}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{e.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{e.d}</Typography>
                </Box>
              ))}
            </Stack>
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
            {messages.map((m, i) => (
              <Box key={i} sx={{
                p: 1.8,
                borderRadius: 2,
                bgcolor: m.role === "agent" ? "primary.main" : m.role === "note" ? "#fef9c3" : "action.hover",
                color: m.role === "agent" ? "#fff" : "text.primary",
                alignSelf: m.role === "agent" ? "flex-end" : "flex-start",
                maxWidth: { xs: "100%", md: "85%" },
                ml: m.role === "agent" ? "auto" : 0,
                border: m.role === "note" ? "1px dashed #ca8a04" : "none",
              }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{m.who}</Typography>
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
