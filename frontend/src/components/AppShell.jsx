import React, { useState } from "react";
import { Box, Stack, Divider, Drawer, IconButton, Tooltip, TextField, Badge, Avatar, useMediaQuery, Typography, InputAdornment } from "@mui/material";
import { MenuOutlined, SearchOutlined, DarkModeOutlined, LightModeOutlined, NotificationsNoneOutlined, HelpOutlineOutlined, SupportAgentOutlined, LogoutOutlined, SchoolOutlined } from "@mui/icons-material";

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

export default function AppShell({ items, active, onSelect, onLogout, user, mode, onToggleMode, children }) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <SideAction icon={<SupportAgentOutlined />} label="Soporte" />
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
            sx={{
              flex: 1,
              maxWidth: 420,
              display: { xs: "none", sm: "flex" },
              "& .MuiOutlinedInput-root": { bgcolor: "action.hover" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: "#9aa4b2" }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo oscuro"}>
            <IconButton onClick={onToggleMode}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsNoneOutlined />
            </Badge>
          </IconButton>
          <IconButton sx={{ display: { xs: "none", sm: "inline-flex" } }}>
            <HelpOutlineOutlined />
          </IconButton>
          <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", pl: { xs: 0, md: 1 } }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{user.role}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>{user.name.charAt(0)}</Avatar>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
