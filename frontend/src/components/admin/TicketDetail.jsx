import React, { useEffect, useState } from "react";
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
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  CallSplitOutlined,
  SwapHorizOutlined,
  HighlightOffOutlined,
  PrintOutlined,
  MoreVertOutlined,
  SendOutlined,
  PriorityHighOutlined,
  AttachFileOutlined,
} from "@mui/icons-material";
import DetailRow from "../shared/DetailRow";
import ChatBubble from "../shared/ChatBubble";
import ClosedChatNotice from "../shared/ClosedChatNotice";
import usePolling from "../../hooks/use-polling";
import { api } from "../../lib/api";
import { StatusBadge, PriorityBadge } from "../shared/Badges";

const CHAT_POLL_MS = 5000;
const CLOSED_POLL_MS = 15000;

const ESTADO_LABELS = { ABIERTO: "Abierto", EN_PROGRESO: "En Progreso", CERRADO: "Cerrado" };

const ROL_LABELS = { ESTUDIANTE: "Estudiante", STAFF: "Staff de Área", SUPERVISOR: "Supervisor" };

export default function TicketDetail({ tickets, onBack, admin, onTicketUpdated }) {
  const { id } = useParams();
  const ticket = (tickets || []).find((t) => String(t.id) === String(id));

  const [areas, setAreas] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .getAreas()
      .then(setAreas)
      .catch(() => {});
  }, []);

  const handleOpenMenu = (menu) => (e) => {
    setMenuAnchor(e.currentTarget);
    setOpenMenu(menu);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setOpenMenu(null);
  };

  const runAction = async (data, successMessage) => {
    if (!ticket) return;
    setActionLoading(true);
    handleCloseMenu();
    try {
      await api.updateTicket(ticket.id, data);
      await onTicketUpdated?.();
      setSnackbar({ open: true, message: successMessage, severity: "success" });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "No se pudo actualizar el ticket.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDerivar = (area) =>
    runAction({ area_responsable: area.id }, `Ticket derivado a ${area.nombre}.`);
  const handleCambiarEstado = (estado) =>
    runAction({ estado }, `Estado actualizado a "${ESTADO_LABELS[estado]}".`);
  const handleCerrar = () => runAction({ estado: "CERRADO" }, "Ticket cerrado.");
  const handleCambiarPrioridad = (prioridad) =>
    runAction({ prioridad }, `Prioridad actualizada a "${prioridad}".`);

  const isClosed = ticket?.estado === "CERRADO";

  // Trae mensajes nuevos (y cambios de estado) sin recargar la página mientras el
  // ticket esté abierto. Si está cerrado se consulta más espaciado, por si lo reabren.
  usePolling(onTicketUpdated, isClosed ? CLOSED_POLL_MS : CHAT_POLL_MS, Boolean(ticket));

  const handleSend = async () => {
    if (!reply.trim() || !ticket || isClosed) return;
    setSending(true);
    try {
      await api.enviarRespuesta(ticket.id, reply.trim());
      await onTicketUpdated?.();
      setReply("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "No se pudo enviar la respuesta.",
        severity: "error",
      });
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

  const solicitanteNombre =
    [ticket.creado_por_first_name, ticket.creado_por_last_name].filter(Boolean).join(" ") ||
    ticket.creado_por_nombre;

  const intervencionesStaff = (ticket.respuestas || [])
    .filter((r) => r.autor_rol === "STAFF" || r.autor_rol === "SUPERVISOR")
    .reduce((acc, r) => {
      if (!acc.some((item) => item.nombre === r.autor_nombre)) {
        acc.push({
          nombre: r.autor_nombre,
          rol: ROL_LABELS[r.autor_rol] || r.autor_rol,
          dni: r.autor_dni,
        });
      }
      return acc;
    }, []);

  return (
    <Stack spacing={2.5}>
      {/* Vista de Impresión Exclusiva (Issue #93) */}
      <Paper className="print-only" sx={{ p: 2.5, border: "1px solid #ccc" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Comprobante de Ticket #{ticket.id}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {ticket.titulo}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={4} sx={{ mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Información del Estudiante (Solicitante)
            </Typography>
            <Typography variant="body2">
              <strong>Nombre y Apellido:</strong> {solicitanteNombre}
            </Typography>
            <Typography variant="body2">
              <strong>DNI:</strong> {ticket.creado_por_dni || "No registrado"}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {ticket.creado_por_email || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Usuario:</strong> {ticket.creado_por_nombre}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Información de Destino y Gestión
            </Typography>
            <Typography variant="body2">
              <strong>Área asignada:</strong> {ticket.area_nombre || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Categoría:</strong> {ticket.categoria_nombre || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Estado:</strong> {ESTADO_LABELS[ticket.estado] || ticket.estado}
            </Typography>
            <Typography variant="body2">
              <strong>Prioridad:</strong> {ticket.prioridad}
            </Typography>
            <Typography variant="body2">
              <strong>Fecha de creación:</strong> {new Date(ticket.creado_el).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
        {intervencionesStaff.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed #ccc" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Personal de Staff Interviniente:
            </Typography>
            {intervencionesStaff.map((staff, idx) => (
              <Typography key={idx} variant="body2">
                • {staff.nombre} ({staff.rol}) — DNI: {staff.dni || "No registrado"}
              </Typography>
            ))}
          </Box>
        )}
      </Paper>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <IconButton onClick={onBack} className="no-print">
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
        <StatusBadge status={ticket.estado} pill />
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <PriorityBadge priority={ticket.prioridad} pill />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        <Stack spacing={2.5} sx={{ width: { lg: 280 }, flexShrink: 0, order: { xs: 2, lg: 0 } }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Solicitante</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {solicitanteNombre.charAt(0).toUpperCase() || "?"}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{solicitanteNombre}</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {ROL_LABELS[ticket.creado_por_rol] || ticket.creado_por_rol}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <DetailRow label="Usuario" value={ticket.creado_por_nombre} />
            <DetailRow label="DNI" value={ticket.creado_por_dni || "—"} />
            <DetailRow label="Email" value={ticket.creado_por_email || "—"} />
            {ticket.archivo_adjunto &&
              ticket.archivo_adjunto !== "null" &&
              ticket.archivo_adjunto !== "" && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Chip
                    size="small"
                    clickable
                    onClick={() => {
                      api
                        .abrirAdjunto(ticket.id)
                        .catch(() => alert("No se pudo abrir el adjunto."));
                    }}
                    icon={<AttachFileOutlined sx={{ fontSize: 14 }} />}
                    label="Ver adjunto"
                    sx={{ fontSize: 11 }}
                  />
                </>
              )}
          </Paper>

          <Paper sx={{ p: 2.5 }} className="no-print">
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Acciones Rápidas</Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CallSplitOutlined />}
                fullWidth
                onClick={handleOpenMenu("derivar")}
                disabled={actionLoading}
              >
                Derivar Ticket
              </Button>
              <Button
                variant="outlined"
                startIcon={<SwapHorizOutlined />}
                fullWidth
                onClick={handleOpenMenu("estado")}
                disabled={actionLoading}
              >
                Cambiar Estado
              </Button>
              <Button
                variant="outlined"
                startIcon={<PriorityHighOutlined />}
                fullWidth
                onClick={handleOpenMenu("prioridad")}
                disabled={actionLoading}
              >
                Cambiar Nivel
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<HighlightOffOutlined />}
                fullWidth
                onClick={handleCerrar}
                disabled={actionLoading || ticket.estado === "CERRADO"}
              >
                Cerrar Ticket
              </Button>
            </Stack>

            <Menu anchorEl={menuAnchor} open={openMenu === "derivar"} onClose={handleCloseMenu}>
              {areas.length === 0 && <MenuItem disabled>Cargando áreas...</MenuItem>}
              {areas.map((a) => (
                <MenuItem
                  key={a.id}
                  selected={ticket.area_responsable === a.id}
                  onClick={() => handleDerivar(a)}
                >
                  {a.nombre}
                </MenuItem>
              ))}
            </Menu>

            <Menu anchorEl={menuAnchor} open={openMenu === "estado"} onClose={handleCloseMenu}>
              {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                <MenuItem
                  key={value}
                  selected={ticket.estado === value}
                  onClick={() => handleCambiarEstado(value)}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>

            <Menu anchorEl={menuAnchor} open={openMenu === "prioridad"} onClose={handleCloseMenu}>
              {["BAJA", "MEDIA", "ALTA"].map((nivel) => (
                <MenuItem
                  key={nivel}
                  selected={ticket.prioridad === nivel}
                  onClick={() => handleCambiarPrioridad(nivel)}
                >
                  {nivel}
                </MenuItem>
              ))}
            </Menu>
          </Paper>
        </Stack>

        <Paper sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0, order: { xs: 1, lg: 0 } }}>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
          >
            <Typography sx={{ fontWeight: 700 }}>● Historial de Mensajes</Typography>
            <Stack direction="row" className="no-print">
              <IconButton size="small" onClick={() => window.print()} title="Imprimir ticket">
                <PrintOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <MoreVertOutlined fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            <ChatBubble mine={false} author={solicitanteNombre} date={ticket.creado_el}>
              {ticket.descripcion}
            </ChatBubble>

            {(ticket.respuestas || []).map((r) => {
              const isAgent = r.autor_rol === "STAFF" || r.autor_rol === "SUPERVISOR";
              return (
                <ChatBubble key={r.id} mine={isAgent} author={r.autor_nombre} date={r.creado_el}>
                  {r.mensaje}
                </ChatBubble>
              );
            })}
          </Stack>

          <Box className="no-print">
            <Divider sx={{ my: 2 }} />

            {isClosed ? (
              <ClosedChatNotice />
            ) : (
              <>
                <TextField
                  placeholder="Escribí tu respuesta o seguimiento aquí..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                  disabled={sending}
                />
                <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
                  <Button
                    variant="contained"
                    endIcon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={sending || !reply.trim()}
                  >
                    {sending ? "Enviando..." : "Enviar Respuesta"}
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
