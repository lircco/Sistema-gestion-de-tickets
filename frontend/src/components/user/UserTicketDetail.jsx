import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Stack, Box, IconButton, Typography, Chip, Paper, Divider, TextField, Button } from "@mui/material";
import { ArrowBack, AttachFileOutlined, SendOutlined } from "@mui/icons-material";
import DetailRow from "../shared/DetailRow";

const ESTADO_COLOR = { ABIERTO: "#3b82f6", EN_PROGRESO: "#f59e0b", CERRADO: "#10b981" };

import { api } from '../../lib/api';
export default function UserTicketDetail({ tickets, user, onBack, onTicketUpdated }) {
  const { id } = useParams();
  const ticket = (tickets || []).find((t) => String(t.id) === String(id));
  const [reply, setReply] = useState("");
  const [followUps, setFollowUps] = useState([]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    try {
      await api.enviarRespuesta(ticket.id, reply.trim());
      setReply("");
      if (onTicketUpdated) {
        onTicketUpdated();
      }
    } catch (error) {
      console.error("Error al enviar la respuesta:", error);
    }
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
        <Chip
          label={ticket.estado}
          sx={{ bgcolor: `${ESTADO_COLOR[ticket.estado] || "#9ca3af"}22`, color: ESTADO_COLOR[ticket.estado] || "#374151", fontWeight: 700 }}
        />
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        <Paper sx={{ p: 2.5, width: { lg: 280 }, flexShrink: 0, height: "fit-content" }}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Detalle del ticket</Typography>
          <DetailRow label="Categoría" value={ticket.categoria_nombre} />
          <DetailRow label="Área" value={ticket.area_nombre} />
          <DetailRow label="Prioridad" value={ticket.prioridad} />
          <DetailRow label="Estado" value={ticket.estado} />
          {ticket.archivo_adjunto && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Chip
                size="small"
                component="a"
                href={ticket.archivo_adjunto.startsWith('http') ? ticket.archivo_adjunto : import.meta.env.VITE_API_URL + ticket.archivo_adjunto}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                icon={<AttachFileOutlined sx={{ fontSize: 14 }} />}
                label="Ver adjunto"
                sx={{ fontSize: 11 }}
              />
            </>
          )}
        </Paper>

        <Paper sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Conversación con el staff</Typography>
          <Stack spacing={2}>
            <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: "action.hover", maxWidth: { xs: "100%", md: "85%" } }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{user?.name || "Vos"}</Typography>
                <Typography sx={{ fontSize: 11, opacity: 0.8 }}>{new Date(ticket.creado_el).toLocaleString()}</Typography>
              </Stack>
              <Typography sx={{ fontSize: 13 }}>{ticket.descripcion}</Typography>
            </Box>
            {(ticket.respuestas || []).map((r, i) => { const isMine = r.autor_rol === "ESTUDIANTE"; return (<Box key={i} sx={{ p: 1.8, borderRadius: 2, bgcolor: isMine ? "primary.main" : "#f1f5f9", color: isMine ? "#fff" : "text.primary", alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: { xs: "100%", md: "85%" }, ml: isMine ? "auto" : 0 }}><Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5, gap: 2 }}><Typography sx={{ fontSize: 12, fontWeight: 700 }}>{isMine ? "Vos" : `Staff de ${ticket.area_nombre}`}</Typography><Typography sx={{ fontSize: 11, opacity: isMine ? 0.8 : 0.6 }}>{new Date(r.creado_el).toLocaleString()}</Typography></Stack><Typography sx={{ fontSize: 13 }}>{r.mensaje}</Typography></Box>); })}
          </Stack>

          {!(ticket.respuestas && ticket.respuestas.length > 0) && <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 2 }}>El staff del area todavia no respondio este ticket.</Typography>}

          <Divider sx={{ my: 2 }} />

          <TextField
            placeholder="Escribí un mensaje de seguimiento para el staff..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
            <Button variant="contained" endIcon={<SendOutlined />} onClick={handleSend}>
              Enviar Mensaje
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}







