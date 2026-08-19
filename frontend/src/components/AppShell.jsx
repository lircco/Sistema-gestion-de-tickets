import React, { useState } from "react";
import {
  Box, Stack, Divider, Drawer, IconButton, Tooltip, TextField,
  Badge, Avatar, useMediaQuery, Typography, InputAdornment,
  Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText
} from "@mui/material";
import {
  MenuOutlined, SearchOutlined, DarkModeOutlined, LightModeOutlined,
  NotificationsNoneOutlined, HelpOutlineOutlined, SupportAgentOutlined,
  LogoutOutlined, SchoolOutlined, DeleteSweepOutlined
} from "@mui/icons-material";

function SideAction({ icon, label, danger, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        cursor: "pointer",
        color: danger ? "#dc2626" : "#374151",
        fontSize: 14,
        fontWeight: 500,
        "&:hover": { bgcolor: "#f4f6f9" },
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

export default function AppShell({ items, active, onSelect, onLogout, user, mode, onToggleMode, unreadNotificationsCount = 0, searchValue = "", onSearchChange, children }) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleNotifOpen = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const openNotif = Boolean(notifAnchor);

  // Cambialo para que quede así:
  const [notifications, setNotifications] = useState([]);
  // 2. ESTADO PARA EL MENÚ DESPLEGABLE DE LA CAMPANITA
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // 3. FUNCIÓN PARA LIMPIAR TODO EL LISTADO
  const handleClearNotifications = () => {
    setNotifications([]);
    handleCloseMenu();
  };

  const [supportOpen, setSupportOpen] = useState(false);

  const sidebar = (
    <Box sx={{ width: 250, bgcolor: "background.paper", borderRight: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", p: 2, height: "100%" }}>
      <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", mb: 3, px: 1 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.2, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SchoolOutlined sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1 }}>UNRaf</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Soporte Técnico</Typography>
        </Box>
      </Stack>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <Box
              key={it.key}
              onClick={() => {
                onSelect(it.key);
                setMobileOpen(false);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.5,
                py: 1.1,
                borderRadius: 1.5,
                cursor: "pointer",
                bgcolor: isActive ? "primary.main" : "transparent",
                color: isActive ? "#fff" : "text.primary",
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                "&:hover": { bgcolor: isActive ? "primary.main" : "action.hover" },
              }}
            >
              {it.icon}
              {it.label}
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Stack spacing={0.5}>
        <SideAction icon={<SupportAgentOutlined />} label="Soporte" onClick={() => setSupportOpen(true)} />
        <SideAction icon={<LogoutOutlined sx={{ color: "#dc2626" }} />} label="Cerrar Sesión" danger onClick={onLogout} />
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {!isMobile && sidebar}
      {isMobile && (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {sidebar}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box
          sx={{
            height: 64,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            px: { xs: 1.5, md: 3 },
            gap: { xs: 1, md: 2 },
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuOutlined />
            </IconButton>
          )}
          <TextField
            placeholder="Buscar ticket por ID o asunto..."
            size="small"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{
              flex: 1,
              maxWidth: 420,
              display: { xs: "none", sm: "flex" },
              "& .MuiOutlinedInput-root": { bgcolor: "action.hover" },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: "#9aa4b2" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo oscuro"}>
            <IconButton onClick={onToggleMode}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>

          {/* CAMPANITA MODIFICADA */}
          <IconButton onClick={handleOpenMenu}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsNoneOutlined />
            </Badge>
          </IconButton>

          {/* MENÚ FLOTANTE DE NOTIFICACIONES */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            disableScrollLock
            PaperProps={{
              sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: 2, boxShadow: "0px 4px 20px rgba(0,0,0,0.08)" }
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Notificaciones</Typography>
              {notifications.length > 0 && (
                <Button
                  size="small"
                  startIcon={<DeleteSweepOutlined />}
                  onClick={handleClearNotifications}
                  sx={{ textTransform: "none", fontSize: 12, color: "text.secondary" }}
                >
                  Limpiar todo
                </Button>
              )}
            </Box>
            <Divider />

            {notifications.length === 0 ? (
              <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
                <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>
                  No tenés notificaciones pendientes.
                </Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={handleCloseMenu}
                  sx={{ py: 1.5, px: 2, whiteSpace: "normal", fontSize: 13, borderBottom: "1px solid #f0f0f0", "&:last-child": { borderBottom: 0 } }}
                >
                  {notif.text}
                </MenuItem>
              ))
            )}
          </Menu>

          <IconButton sx={{ display: { xs: "none", sm: "inline-flex" } }} onClick={() => setSupportOpen(true)}>
            <HelpOutlineOutlined />
          </IconButton>
          <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", pl: { xs: 0, md: 1 } }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{user?.role}</Typography>
            </Box>
            <Tooltip title={`${user?.name || "Usuario"} — ${user?.role || ""}`}>
              <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, cursor: "default" }}>
                {user?.name?.charAt(0) || "U"}
              </Avatar>
            </Tooltip>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>{children}</Box>
      </Box>

      <Dialog open={supportOpen} onClose={() => setSupportOpen(false)}>
        <DialogTitle>¿Necesitás ayuda?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Escribinos a <strong>soporte@unraf.edu.ar</strong> y te vamos a responder a la brevedad.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
