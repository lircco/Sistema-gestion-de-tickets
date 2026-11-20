import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack,
  Box,
  IconButton,
  Typography,
  Chip,
  Paper,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { ArrowBack, AttachFileOutlined, SendOutlined } from "@mui/icons-material";
import DetailRow from "../shared/DetailRow";
import ChatBubble from "../shared/ChatBubble";
import ClosedChatNotice from "../shared/ClosedChatNotice";

const ESTADO_COLOR = { ABIERTO: "#3b82f6", EN_PROGRESO: "#f59e0b", CERRADO: "#10b981" };

import { api } from "../../lib/api";
import { StatusBadge, PriorityBadge } from "../shared/Badges";
export default function UserTicketDetail({ tickets, user, onBack, onTicketUpdated }) {
  const { id } = useParams();
  const ticket = (tickets || []).find((t) => String(t.id) === String(id));
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const isClosed = ticket?.estado === "CERRADO";

  const handleSend = async () => {
    if (!reply.trim() || !ticket || isClosed) return;
    setSending(true);
    setSendError("");
    try {
      await api.enviarRespuesta(ticket.id, reply.trim());
      setReply("");
      await onTicketUpdated?.();
    } catch (error) {
      setSendError(error.message || "No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  if (!ticket) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <IconButton onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5">Ticket no encontrado</Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
            #{ticket.id} · Creado el {new Date(ticket.creado_el).toLocaleString()}
          </Typography>
          <Typography variant="h5" sx={{ wordBreak: "break-word" }}>
            {ticket.titulo}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: "action.hover", px: 1.5, py: 0.5, borderRadius: 2 }}>
          <StatusBadge status={ticket.estado} />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        <Paper sx={{ p: 2.5, width: { lg: 280 }, flexShrink: 0, height: "fit-content" }}>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Detalle del ticket</Typography>
          <DetailRow label="Categoría" value={ticket.categoria_nombre} />
          <DetailRow label="Área" value={ticket.area_nombre} />
          <DetailRow label="Prioridad" value={ticket.prioridad} />
          <DetailRow label="Estado" value={ticket.estado} />
          {ticket.archivo_adjunto &&
            ticket.archivo_adjunto !== "null" &&
            ticket.archivo_adjunto !== "" && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Chip
                  size="small"
                  clickable
                  onClick={() => {
                    api.abrirAdjunto(ticket.id).catch(() => alert("No se pudo abrir el adjunto."));
                  }}
                  icon={<AttachFileOutlined sx={{ fontSize: 14 }} />}
                  label="Ver adjunto"
                  sx={{ fontSize: 11 }}
                />
              </>
            )}
        </Paper>

        <Paper sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Conversación con el staff</Typography>
          <Stack spacing={1.5}>
            <ChatBubble mine author={user?.name || "Vos"} date={ticket.creado_el}>
              {ticket.descripcion}
            </ChatBubble>
            {(ticket.respuestas || []).map((r) => {
              const isMine = r.autor_rol === "ESTUDIANTE";
              return (
                <ChatBubble
                  key={r.id}
                  mine={isMine}
                  author={isMine ? "Vos" : `Staff de ${ticket.area_nombre}`}
                  date={r.creado_el}
                >
                  {r.mensaje}
                </ChatBubble>
              );
            })}
          </Stack>

          {!(ticket.respuestas && ticket.respuestas.length > 0) && !isClosed && (
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 2 }}>
              El staff del area todavia no respondio este ticket.
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {isClosed ? (
            <ClosedChatNotice />
          ) : (
            <>
              <TextField
                placeholder="Escribí un mensaje de seguimiento para el staff..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                multiline
                minRows={3}
                fullWidth
                disabled={sending}
              />
              {sendError && (
                <Typography sx={{ fontSize: 12, color: "error.main", mt: 1 }}>
                  {sendError}
                </Typography>
              )}
              <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
                <Button
                  variant="contained"
                  endIcon={<SendOutlined />}
                  onClick={handleSend}
                  disabled={sending || !reply.trim()}
                >
                  {sending ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Stack>
    </Stack>
  );
}
