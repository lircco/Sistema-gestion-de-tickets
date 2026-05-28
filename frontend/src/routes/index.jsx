import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Box, Card, Stack, Typography, TextField, Button, Link, IconButton, InputAdornment, Avatar, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Tabs, Tab, Paper, CssBaseline, ThemeProvider, createTheme, Alert, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Drawer, Switch, FormControlLabel, useMediaQuery, Badge, Tooltip, } from "@mui/material";
import { MailOutlined, LockOutlined, VisibilityOff, School, Person, AdminPanelSettings, DashboardOutlined, ConfirmationNumberOutlined, BarChartOutlined, ApartmentOutlined, MenuBookOutlined, SettingsOutlined, SupportAgentOutlined, LogoutOutlined, NotificationsNoneOutlined, HelpOutlineOutlined, SearchOutlined, AddCircleOutlined, 
// removed duplicate
AssignmentOutlined, CheckCircleOutlined, ArrowForward, VisibilityOutlined, AttachFileOutlined, PictureAsPdfOutlined, ImageOutlined, CloseOutlined, InsertDriveFileOutlined, MenuOutlined, DarkModeOutlined, LightModeOutlined, ArrowBack, PrintOutlined, MoreVertOutlined, SendOutlined, SwapHorizOutlined, HighlightOffOutlined, CallSplitOutlined, } from "@mui/icons-material";
export const Route = createFileRoute("/")({
    component: Index,
});
const buildTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: { main: mode === "dark" ? "#4f9cd6" : "#0a3d62" },
        secondary: { main: "#f5b400" },
        background: mode === "dark"
            ? { default: "#0f172a", paper: "#1e293b" }
            : { default: "#f4f6f9", paper: "#ffffff" },
    },
    typography: {
        fontFamily: "'Inter','Roboto',sans-serif",
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
});
function Index() {
    const [view, setView] = useState("login");
    const [, setRole] = useState("alumno");
    const [mode, setMode] = useState("light");
    const theme = useMemo(() => buildTheme(mode), [mode]);
    const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));
    const [accounts, setAccounts] = useState([
        { email: "soporte@unraf.edu.ar", password: "unraf2025", role: "admin", name: "Lucía Fernández" },
    ]);
    const [currentUser, setCurrentUser] = useState(null);
    const [userTickets, setUserTickets] = useState([
        { id: "#12904", title: "Error Campus Virtual", description: "No puedo visualizar la materia de IA...", category: "Tecnología", status: "En Proceso", statusColor: "#f59e0b", date: "Hace 2 horas" },
        { id: "#12850", title: "Certificado Alumno Regular", description: "Solicitud para trámite de beca...", category: "Académica", status: "Resuelto", statusColor: "#10b981", date: "Ayer" },
        { id: "#12701", title: "Reinscripción Guaraní", description: "Error de validación de cuatrimestre...", category: "Sistemas", status: "Abierto", statusColor: "#3b82f6", date: "15/10/2023" },
    ]);
    return (<ThemeProvider theme={theme}>
      <CssBaseline />
      {view === "login" && (<LoginScreen accounts={accounts} onRegister={(acc) => setAccounts((prev) => [...prev, acc])} onLogin={(acc) => {
                setRole(acc.role);
                setCurrentUser(acc);
                setView(acc.role === "admin" ? "admin" : "user");
            }}/>)}
      {view === "admin" && (<AdminDashboard onLogout={() => setView("login")} admin={currentUser} mode={mode} onToggleMode={toggleMode}/>)}
      {view === "user" && (<UserDashboard onLogout={() => setView("login")} user={currentUser} tickets={userTickets} onCreateTicket={(t) => setUserTickets((prev) => [t, ...prev])} mode={mode} onToggleMode={toggleMode}/>)}
    </ThemeProvider>);
}
/* ---------------- LOGIN ---------------- */
function LoginScreen({ accounts, onLogin, onRegister, }) {
    const [tab, setTab] = useState(0);
    const [role, setRole] = useState("alumno");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [name, setName] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (tab === 0) {
            // login
            const acc = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password && a.role === role);
            if (!acc) {
                setError("Email, contraseña o rol incorrectos.");
                return;
            }
            onLogin(acc);
        }
        else {
            // register
            if (!email || !password || !name) {
                setError("Completá nombre, email y contraseña.");
                return;
            }
            if (password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
            if (password !== confirm) {
                setError("Las contraseñas no coinciden.");
                return;
            }
            if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
                setError("Ya existe una cuenta con ese email.");
                return;
            }
            const acc = { email, password, role: "alumno", name };
            onRegister(acc);
            setSuccess("¡Cuenta creada! Ya podés iniciar sesión.");
            setTab(0);
            setPassword("");
            setConfirm("");
            setName("");
        }
    };
    return (<Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fafbfc",
            p: 2,
            background: "linear-gradient(135deg,#fafbfc 0%,#fafbfc 55%,#eef2f7 55%,#eef2f7 100%)",
        }}>
      <Stack spacing={3} sx={{ alignItems: "center", width: "100%", maxWidth: 460 }}>
        <Stack spacing={1.5} sx={{ alignItems: "center" }}>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: "14px",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 22px rgba(10,61,98,0.25)",
        }}>
            <School sx={{ color: "#fff", fontSize: 34 }}/>
          </Box>
          <Typography variant="h4" sx={{ color: "primary.main" }}>
            UnrafTickets
          </Typography>
          <Typography sx={{
            color: "#7a8595",
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 600,
        }}>
            SOPORTE TÉCNICO INSTITUCIONAL
          </Typography>
        </Stack>

        <Card sx={{ width: "100%", p: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(""); setSuccess(""); }} variant="fullWidth" sx={{ mb: 2 }}>
            <Tab label="INICIAR SESIÓN"/>
            <Tab label="REGISTRARSE"/>
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            {tab === 0 && (<Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <RoleCard active={role === "alumno"} onClick={() => setRole("alumno")} icon={<Person />} label="Soy Alumno"/>
                <RoleCard active={role === "admin"} onClick={() => setRole("admin")} icon={<AdminPanelSettings />} label="Soy Administrador"/>
              </Stack>)}

            {tab === 1 && (<>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Nombre completo</Typography>
                <TextField fullWidth placeholder="Ej. Mateo Rossi" value={name} onChange={(e) => setName(e.target.value)} size="small" sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}/>
              </>)}

            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>
              Email
            </Typography>
            <TextField fullWidth type="email" placeholder="usuario@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} size="small" sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }} slotProps={{
            input: {
                endAdornment: (<InputAdornment position="end">
                      <MailOutlined sx={{ color: "#9aa4b2" }}/>
                    </InputAdornment>),
            },
        }}/>

            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Contraseña</Typography>
              {tab === 0 && (<Link href="#" sx={{ fontSize: 12, color: "primary.main" }}>
                  ¿Olvidó su contraseña?
                </Link>)}
            </Stack>
            <TextField fullWidth type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} size="small" sx={{ mb: tab === 1 ? 2 : 3, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }} slotProps={{
            input: {
                endAdornment: (<InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShow((s) => !s)}>
                        {show ? <VisibilityOff fontSize="small"/> : <LockOutlined fontSize="small"/>}
                      </IconButton>
                    </InputAdornment>),
            },
        }}/>

            {tab === 1 && (<>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Confirmar contraseña</Typography>
                <TextField fullWidth type={show ? "text" : "password"} placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} size="small" sx={{ mb: 3, "& .MuiOutlinedInput-root": { bgcolor: "#f4f6f9" } }}/>
              </>)}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Button type="submit" fullWidth variant="contained" size="large" sx={{ py: 1.4, fontWeight: 700, letterSpacing: 1 }}>
              {tab === 1
            ? "CREAR CUENTA"
            : role === "admin"
                ? "INGRESAR COMO ADMINISTRADOR"
                : "INGRESAR COMO ALUMNO"}
            </Button>
          </Box>
        </Card>

        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
          ¿Necesita ayuda inmediata?{" "}
          <Link href="#" sx={{ fontWeight: 700, color: "primary.main" }}>
            Contactar Soporte
          </Link>
        </Typography>
      </Stack>
    </Box>);
}
function RoleCard({ active, onClick, icon, label, }) {
    return (<Box onClick={onClick} sx={{
            flex: 1,
            cursor: "pointer",
            border: "2px solid",
            borderColor: active ? "primary.main" : "#e5e7eb",
            bgcolor: active ? "rgba(10,61,98,0.06)" : "#fff",
            borderRadius: 2,
            py: 1.8,
            textAlign: "center",
            transition: "all .2s",
            "&:hover": { borderColor: "primary.main" },
        }}>
      <Box sx={{ color: active ? "primary.main" : "#6b7280", mb: 0.3 }}>{icon}</Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: active ? "primary.main" : "#374151" }}>
        {label}
      </Typography>
    </Box>);
}
/* ---------------- LAYOUT SHELL ---------------- */
function AppShell({ items, active, onSelect, onLogout, user, mode, onToggleMode, children, }) {
    const isMobile = useMediaQuery("(max-width:900px)");
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebar = (<Box sx={{
            width: 250,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            p: 2,
            height: "100%",
        }}>
      <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", mb: 3, px: 1 }}>
        <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 1.2,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
          <School sx={{ color: "#fff", fontSize: 22 }}/>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1 }}>
            UNRaf
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Soporte Técnico</Typography>
        </Box>
      </Stack>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {items.map((it) => {
            const isActive = active === it.key;
            return (<Box key={it.key} onClick={() => {
                    onSelect(it.key);
                    setMobileOpen(false);
                }} sx={{
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
                }}>
              {it.icon}
              {it.label}
            </Box>);
        })}
      </Stack>

      <Divider sx={{ my: 2 }}/>
      <Stack spacing={0.5}>
        <SideAction icon={<SupportAgentOutlined />} label="Soporte"/>
        <SideAction icon={<LogoutOutlined sx={{ color: "#dc2626" }}/>} label="Cerrar Sesión" danger onClick={onLogout}/>
      </Stack>
    </Box>);
    return (<Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar (desktop) */}
      {!isMobile && sidebar}
      {/* Sidebar (mobile drawer) */}
      {isMobile && (<Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {sidebar}
        </Drawer>)}

      {/* Main */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <Box sx={{
            height: 64,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            px: { xs: 1.5, md: 3 },
            gap: { xs: 1, md: 2 },
        }}>
          {isMobile && (<IconButton onClick={() => setMobileOpen(true)}>
              <MenuOutlined />
            </IconButton>)}
          <TextField placeholder="Buscar ticket por ID o asunto..." size="small" sx={{
            flex: 1,
            maxWidth: 420,
            display: { xs: "none", sm: "flex" },
            "& .MuiOutlinedInput-root": { bgcolor: "action.hover" },
        }} slotProps={{
            input: {
                startAdornment: (<InputAdornment position="start">
                    <SearchOutlined sx={{ color: "#9aa4b2" }}/>
                  </InputAdornment>),
            },
        }}/>
          <Box sx={{ flex: 1 }}/>
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
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
              {user.name.charAt(0)}
            </Avatar>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>);
}
function SideAction({ icon, label, danger, onClick, }) {
    return (<Box onClick={onClick} sx={{
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
        }}>
      {icon}
      {label}
    </Box>);
}
/* ---------------- ADMIN ---------------- */
function AdminDashboard({ onLogout, admin, mode, onToggleMode, }) {
    const [active, setActive] = useState("dashboard");
    const [openTicket, setOpenTicket] = useState(null);
    const items = [
        { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined fontSize="small"/> },
        { key: "tickets", label: "Ticket List", icon: <ConfirmationNumberOutlined fontSize="small"/> },
        { key: "reports", label: "Reports", icon: <BarChartOutlined fontSize="small"/> },
        { key: "areas", label: "Area Management", icon: <ApartmentOutlined fontSize="small"/> },
        { key: "kb", label: "Knowledge Base", icon: <MenuBookOutlined fontSize="small"/> },
        { key: "settings", label: "Settings", icon: <SettingsOutlined fontSize="small"/> },
    ];
    return (<AppShell items={items} active={active} onSelect={(k) => {
            setActive(k);
            setOpenTicket(null);
        }} onLogout={onLogout} user={{ name: admin.name, role: "Administrador · Soporte UNRaf" }} mode={mode} onToggleMode={onToggleMode}>
      {active === "dashboard" && <AdminHome onOpenTicket={(t) => { setActive("tickets"); setOpenTicket(t); }}/>}
      {active === "tickets" && !openTicket && <TicketsTable onOpenTicket={(t) => setOpenTicket(t)}/>}
      {active === "tickets" && openTicket && (<TicketDetail ticket={openTicket} onBack={() => setOpenTicket(null)} admin={admin}/>)}
      {active === "reports" && <ReportsSection />}
      {active === "areas" && <AreaManagementSection />}
      {active === "kb" && <KnowledgeBaseSection />}
      {active === "settings" && (<SettingsSection person={admin} mode={mode} onToggleMode={onToggleMode} legajo="2025-000142"/>)}
      {active !== "dashboard" && active !== "tickets" && active !== "reports" && active !== "areas" && active !== "kb" && active !== "settings" && (<PlaceholderSection title={items.find((i) => i.key === active)?.label || ""}/>)}
    </AppShell>);
}
function AdminHome({ onOpenTicket }) {
    return (<Stack spacing={3}>
      <Box>
        <Typography variant="h4">¡Bienvenido, Administrador!</Typography>
        <Typography sx={{ color: "#6b7280", mt: 0.5 }}>
          Aquí tienes un resumen de la actividad del soporte técnico para hoy.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ flexWrap: { sm: "wrap", md: "nowrap" } }}>
        <StatCard color="#0a3d62" icon={<MailOutlined />} value="24" label="TOTAL ACTIVOS" chip="+12% vs ayer" chipColor="#dbeafe" chipText="#1d4ed8"/>
        <StatCard color="#f5b400" icon={<AssignmentOutlined />} value="18" label="PENDIENTES" chip="Activo" chipColor="#fef3c7" chipText="#92400e"/>
        <StatCard color="#ef4444" icon={<HighlightOffOutlined />} value="5" label="PRIORIDAD ALTA" chip="Atención" chipColor="#fee2e2" chipText="#991b1b"/>
        <StatCard color="#10b981" icon={<CheckCircleOutlined />} value="142" label="CERRADOS HOY" chip="92% Eficiencia" chipColor="#d1fae5" chipText="#065f46"/>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ p: 3, width: { md: 280 }, display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontWeight: 700, mb: 3 }}>Accesos Rápidos</Typography>
          <Button variant="outlined" endIcon={<ArrowForward />} startIcon={<ConfirmationNumberOutlined />} sx={{ justifyContent: "space-between", py: 1.5 }}>
            Mis Tickets
          </Button>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 }, flex: 1, overflowX: "auto" }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Tickets Recientes</Typography>
            <Link href="#" sx={{ fontSize: 13 }}>Ver todos</Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>Asunto</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>Prioridad</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
            { id: "#TK-2045", t: "Falla en proyector Aula 5", s: "Sede Rafaela · Hace 2h", p: "Urgente", pc: "#fef3c7", pt: "#92400e", st: "Abierto", sc: "#3b82f6" },
            { id: "#TK-2041", t: "Reseteo contraseña SIU", s: "Administración · Hace 5h", p: "Media", pc: "#e5e7eb", pt: "#374151", st: "En Proceso", sc: "#f59e0b" },
            { id: "#TK-2038", t: "Instalación Software CAD", s: "Laboratorio 1 · Ayer", p: "Baja", pc: "#e5e7eb", pt: "#374151", st: "Cerrado", sc: "#6b7280" },
        ].map((r) => (<TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{r.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.t}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{r.s}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={r.p} sx={{ bgcolor: r.pc, color: r.pt, fontWeight: 600 }}/>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.sc }}/>
                      <Typography sx={{ fontSize: 13 }}>{r.st}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onOpenTicket({ id: r.id, title: r.t })}>
                      <VisibilityOutlined fontSize="small"/>
                    </IconButton>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Stack>);
}
function StatCard({ color, icon, value, label, chip, chipColor, chipText, }) {
    return (<Paper sx={{ p: 2.5, flex: 1, borderLeft: `4px solid ${color}` }}>
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
        <Chip size="small" label={chip} sx={{ bgcolor: chipColor, color: chipText, fontWeight: 600, fontSize: 11 }}/>
      </Stack>
      <Typography sx={{ fontSize: 32, fontWeight: 800, mt: 1.5 }}>{value}</Typography>
      <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>{label}</Typography>
    </Paper>);
}
function TicketsTable({ onOpenTicket }) {
    const rows = [
        { id: "#TK-4829", t: "Problema acceso SIU Guaraní", c: "Sistemas", st: "EN PROGRESO", sc: "#fef3c7", stt: "#92400e", p: "ALTA", pc: "#ef4444", d: "12/05/2024" },
        { id: "#TK-4831", t: "Reposición de tóners Aula 3", c: "Soporte Físico", st: "ABIERTO", sc: "#e5e7eb", stt: "#374151", p: "MEDIA", pc: "#9ca3af", d: "12/05/2024" },
        { id: "#TK-4820", t: "Error carga de notas finales", c: "Alumnos", st: "RESUELTO", sc: "#dbeafe", stt: "#1d4ed8", p: "URGENTE", pc: "#ef4444", d: "11/05/2024" },
        { id: "#TK-4795", t: "Pedido de proyector - Lab 2", c: "Infraestructura", st: "CERRADO", sc: "#e5e7eb", stt: "#374151", p: "BAJA", pc: "#f59e0b", d: "10/05/2024" },
        { id: "#TK-4835", t: "Falla conexión Wi-Fi Comedor", c: "Sistemas", st: "ABIERTO", sc: "#e5e7eb", stt: "#374151", p: "MEDIA", pc: "#9ca3af", d: "12/05/2024" },
    ];
    return (<Stack spacing={3}>
      <Typography variant="h5">Lista de Tickets</Typography>
      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField placeholder="Buscar por ID, título o descripción..." size="small" fullWidth slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: "#9aa4b2" }}/></InputAdornment> } }}/>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: "wrap" }}>
            <Button variant="outlined" size="small">Categoría</Button>
            <Button variant="outlined" size="small">Estado</Button>
            <Button variant="outlined" size="small">Fechas</Button>
          </Stack>
        </Stack>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              {["ID", "TÍTULO", "CATEGORÍA", "ESTADO", "PRIORIDAD", "FECHA", "ACCIÓN"].map((h) => (<TableCell key={h} sx={{ color: "#6b7280", fontWeight: 700, fontSize: 12 }}>{h}</TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (<TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{r.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{r.t}</TableCell>
                <TableCell>{r.c}</TableCell>
                <TableCell><Chip size="small" label={r.st} sx={{ bgcolor: r.sc, color: r.stt, fontWeight: 700, fontSize: 11 }}/></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.pc }}/>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.p}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{r.d}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => onOpenTicket({ id: r.id, title: r.t })}>
                    <VisibilityOutlined fontSize="small"/>
                  </IconButton>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 2 }}>Mostrando 1-5 de 128 tickets</Typography>
      </Paper>
    </Stack>);
}
function PlaceholderSection({ title }) {
    return (<Paper sx={{ p: 6, textAlign: "center" }}>
      <Typography variant="h5" sx={{ mb: 1 }}>{title}</Typography>
      <Typography sx={{ color: "#6b7280" }}>Sección en construcción.</Typography>
    </Paper>);
}
/* ---------------- USER ---------------- */
function UserDashboard({ onLogout, user, tickets, onCreateTicket, mode, onToggleMode, }) {
    const [active, setActive] = useState("dashboard");
    const [openNew, setOpenNew] = useState(false);
    const items = [
        { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined fontSize="small"/> },
        { key: "tickets", label: "Mis Tickets", icon: <ConfirmationNumberOutlined fontSize="small"/> },
        { key: "settings", label: "Configuración", icon: <SettingsOutlined fontSize="small"/> },
    ];
    return (<>
      <AppShell items={items} active={active} onSelect={setActive} onLogout={onLogout} user={{ name: user.name, role: "Alumno UNRaf" }} mode={mode} onToggleMode={onToggleMode}>
        {active === "dashboard" && (<UserHome user={user} tickets={tickets} onOpenNew={() => setOpenNew(true)} onGoTickets={() => setActive("tickets")}/>)}
        {active === "tickets" && <UserTicketsTable tickets={tickets} onOpenNew={() => setOpenNew(true)}/>}
        {active === "settings" && (<SettingsSection person={user} mode={mode} onToggleMode={onToggleMode} legajo="2024-001284"/>)}
      </AppShell>
      <NewTicketDialog open={openNew} onClose={() => setOpenNew(false)} onCreate={(t) => {
            onCreateTicket(t);
            setOpenNew(false);
            setActive("tickets");
        }}/>
    </>);
}
function UserHome({ user, tickets, onOpenNew, onGoTickets, }) {
    const firstName = user.name.split(" ")[0];
    return (<Stack spacing={3}>
      <Box>
        <Typography variant="h4">¡Hola, {firstName}! ¿En qué podemos ayudarte hoy?</Typography>
        <Typography sx={{ color: "#6b7280", mt: 0.5 }}>
          Bienvenido a la plataforma de gestión académica y técnica de UNRaf. Aquí puedes realizar
          trámites o reportar inconvenientes.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper onClick={onOpenNew} sx={{
            flex: 2,
            p: 4,
            bgcolor: "primary.main",
            color: "#fff",
            minHeight: 200,
            backgroundImage: "linear-gradient(135deg, rgba(10,61,98,0.92), rgba(10,61,98,0.85))",
            cursor: "pointer",
        }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", mb: 2 }}>
            <AddCircleOutlined />
          </Avatar>
          <Typography variant="h5" sx={{ mb: 1 }}>Crear Nuevo Ticket</Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 420 }}>
            Inicia una nueva solicitud técnica o administrativa. El equipo correspondiente te contactará a la brevedad.
          </Typography>
        </Paper>

        <Paper onClick={onGoTickets} sx={{ flex: 1, p: 3, bgcolor: "secondary.main", minHeight: 200, cursor: "pointer" }}>
          <AssignmentOutlined sx={{ color: "rgba(0,0,0,0.4)", float: "right" }}/>
          <Typography variant="h5" sx={{ mb: 1 }}>Mis Trámites</Typography>
          <Typography sx={{ color: "rgba(0,0,0,0.7)", mb: 2 }}>
            Consulta el historial y seguimiento de tus solicitudes activas.
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", fontWeight: 700 }}>
            Ir al listado <ArrowForward fontSize="small"/>
          </Stack>
        </Paper>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ flex: 2, p: 3 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Tickets Recientes</Typography>
            <Link component="button" onClick={onGoTickets} sx={{ fontSize: 13 }}>Ver todos</Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>ID / ASUNTO</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>CATEGORÍA</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>ESTADO</TableCell>
                <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>FECHA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.slice(0, 5).map((r) => (<TableRow key={r.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{r.id} - {r.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{r.description}</Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={r.category} sx={{ bgcolor: "#f3f4f6" }}/></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.statusColor }}/>
                      <Typography sx={{ fontSize: 13 }}>{r.status}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{r.date}</TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </Paper>

        <Stack spacing={2.5} sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>
              MIS TRÁMITES ACTIVOS
            </Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 800, mt: 1 }}>
              {String(tickets.length).padStart(2, "0")}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
              ↗ 1 resuelto hoy
            </Typography>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>
              TIEMPO PROMEDIO DE RESPUESTA
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 800, mt: 1 }}>6h 15m</Typography>
            <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
              Basado en el equipo de Atención al Alumno
            </Typography>
          </Paper>
        </Stack>
      </Stack>
    </Stack>);
}
function UserTicketsTable({ tickets, onOpenNew }) {
    return (<Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5">Mis Tickets</Typography>
        <Button variant="contained" startIcon={<AddCircleOutlined />} onClick={onOpenNew}>
          Nuevo Ticket
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["ID", "TÍTULO", "CATEGORÍA", "ESTADO", "FECHA"].map((h) => (<TableCell key={h} sx={{ color: "#6b7280", fontWeight: 700, fontSize: 12 }}>{h}</TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((r) => (<TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{r.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{r.description}</Typography>
                  {r.attachments && r.attachments.length > 0 && (<Stack direction="row" spacing={0.5} sx={{ mt: 0.8, flexWrap: "wrap", gap: 0.5 }}>
                      {r.attachments.map((a, i) => (<Chip key={i} size="small" component="a" href={a.url} target="_blank" rel="noopener noreferrer" clickable icon={a.type === "application/pdf" ? (<PictureAsPdfOutlined sx={{ fontSize: 14 }}/>) : a.type.startsWith("image/") ? (<ImageOutlined sx={{ fontSize: 14 }}/>) : (<InsertDriveFileOutlined sx={{ fontSize: 14 }}/>)} label={a.name} sx={{ fontSize: 11, maxWidth: 200 }}/>))}
                    </Stack>)}
                </TableCell>
                <TableCell><Chip size="small" label={r.category} sx={{ bgcolor: "#f3f4f6" }}/></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.statusColor }}/>
                    <Typography sx={{ fontSize: 13 }}>{r.status}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: 13 }}>{r.date}</TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
        {tickets.length === 0 && (<Typography sx={{ textAlign: "center", color: "#6b7280", py: 4 }}>
            No tenés tickets todavía. Creá uno nuevo.
          </Typography>)}
      </Paper>
    </Stack>);
}
function NewTicketDialog({ open, onClose, onCreate, }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Tecnología");
    const [error, setError] = useState("");
    const [files, setFiles] = useState([]);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ACCEPT = "image/*,application/pdf";
    const handleFiles = (incoming) => {
        if (!incoming)
            return;
        setError("");
        const next = [...files];
        for (const f of Array.from(incoming)) {
            if (f.size > MAX_SIZE) {
                setError(`"${f.name}" supera el límite de 5 MB.`);
                continue;
            }
            if (!/^image\//.test(f.type) && f.type !== "application/pdf") {
                setError(`"${f.name}" no es una imagen ni PDF.`);
                continue;
            }
            if (next.length >= 5) {
                setError("Máximo 5 archivos por ticket.");
                break;
            }
            next.push(f);
        }
        setFiles(next);
    };
    const handleSubmit = () => {
        setError("");
        if (!title.trim() || !description.trim()) {
            setError("Completá el título y la descripción.");
            return;
        }
        const attachments = files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            url: URL.createObjectURL(f),
        }));
        const ticket = {
            id: `#${Math.floor(10000 + Math.random() * 89999)}`,
            title: title.trim(),
            description: description.trim(),
            category,
            status: "Abierto",
            statusColor: "#3b82f6",
            date: new Date().toLocaleDateString("es-AR"),
            attachments,
        };
        onCreate(ticket);
        setTitle("");
        setDescription("");
        setCategory("Tecnología");
        setFiles([]);
    };
    return (<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Crear Nuevo Ticket</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth size="small"/>
          <TextField select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth size="small">
            {["Tecnología", "Académica", "Sistemas", "Infraestructura", "Trámites"].map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </TextField>
          <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={4}/>

          <Box>
            <Button component="label" variant="outlined" startIcon={<AttachFileOutlined />} size="small">
              Adjuntar archivos
              <input type="file" hidden multiple accept={ACCEPT} onChange={(e) => handleFiles(e.target.files)}/>
            </Button>
            <Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>
              Imágenes o PDF · máx. 5 MB c/u · hasta 5 archivos
            </Typography>

            {files.length > 0 && (<Stack spacing={1} sx={{ mt: 1.5 }}>
                {files.map((f, i) => (<Box key={i} sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    border: "1px solid #e5e7eb",
                    borderRadius: 1.5,
                    bgcolor: "#f9fafb",
                }}>
                    {f.type === "application/pdf" ? (<PictureAsPdfOutlined sx={{ color: "#dc2626" }}/>) : f.type.startsWith("image/") ? (<ImageOutlined sx={{ color: "primary.main" }}/>) : (<InsertDriveFileOutlined />)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.name}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                        {(f.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      <CloseOutlined fontSize="small"/>
                    </IconButton>
                  </Box>))}
              </Stack>)}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Enviar Ticket</Button>
      </DialogActions>
    </Dialog>);
}
function ReportsSection() {
    return (<Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5">Reportes de Gestión</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            Monitoreo en tiempo real del rendimiento operativo de la UNRaf.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Últimos 30 días</Button>
          <Button variant="outlined">Exportar PDF</Button>
        </Stack>
      </Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <ReportKpi color="#0a3d62" label="TICKETS TOTALES" value="1,284" delta="↗ +12%" deltaColor="#10b981"/>
        <ReportKpi color="#0a3d62" label="LEAD TIME PROMEDIO" value="4.2h" delta="↘ -0.5h" deltaColor="#10b981"/>
        <ReportKpi color="#10b981" label="SATISFACCIÓN ESTUDIANTIL" value="94%" delta="Meta: 90%" deltaColor="#6b7280"/>
        <ReportKpi color="#ef4444" label="SLA EN RIESGO" value="12" delta="! Crítico" deltaColor="#ef4444"/>
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ flex: 1, p: 3, minHeight: 260 }}>
          <Typography sx={{ fontWeight: 700 }}>Eficiencia Operativa</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>Lead Time (horas) por área administrativa</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-end", height: 140, mt: 2 }}>
            {[60, 90, 45, 110, 75].map((h, i) => (<Box key={i} sx={{ flex: 1, height: h, bgcolor: "primary.main", opacity: 0.2 + i * 0.15, borderRadius: 1 }}/>))}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: "space-between" }}>
            {["IT Support", "Alumnos", "RRHH", "Académica", "Infra"].map((l) => (<Typography key={l} sx={{ fontSize: 11, color: "#6b7280", flex: 1, textAlign: "center" }}>{l}</Typography>))}
          </Stack>
        </Paper>
        <Paper sx={{ flex: 1, p: 3, minHeight: 260 }}>
          <Typography sx={{ fontWeight: 700 }}>Consultas por Categoría</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>Distribución porcentual de tickets</Typography>
          <Stack spacing={1.2} sx={{ mt: 2 }}>
            {[
            { l: "Académicos", v: 45, c: "#0a3d62" },
            { l: "Trámites", v: 28, c: "#f5b400" },
            { l: "Infraestructura", v: 15, c: "#10b981" },
            { l: "Otros", v: 12, c: "#6b7280" },
        ].map((r) => (<Box key={r.l}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13 }}>● {r.l}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.v}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={r.v} sx={{ height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { bgcolor: r.c } }}/>
              </Box>))}
          </Stack>
        </Paper>
      </Stack>
    </Stack>);
}
function ReportKpi({ color, label, value, delta, deltaColor }) {
    return (<Paper sx={{ flex: 1, p: 2.5, borderLeft: `4px solid ${color}` }}>
      <Typography sx={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 0.5 }}>{label}</Typography>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mt: 1 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{value}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: deltaColor }}>{delta}</Typography>
      </Stack>
    </Paper>);
}
function AreaManagementSection() {
    return (<Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4">Gestión de Áreas</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            Cola de trabajo del departamento:{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>Soporte Infraestructura</Box>
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Chip label="● 8 Pendientes" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }}/>
          <Chip label="● 3 En Proceso" sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }}/>
        </Stack>
      </Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Stack spacing={2.5} sx={{ width: { md: 260 } }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Filtros Activos</Typography>
            <Stack spacing={1}>
              {[["Cola Principal", "11", true], ["Asignados a mi", "4", false], ["Recientes", "", false]].map(([l, c, a]) => (<Box key={l} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.2, borderRadius: 1.5, bgcolor: a ? "rgba(10,61,98,0.08)" : "transparent", border: a ? "1px solid rgba(10,61,98,0.3)" : "1px solid transparent", cursor: "pointer" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: a ? 700 : 500 }}>{l}</Typography>
                  {c ? <Chip size="small" label={c} sx={{ bgcolor: "primary.main", color: "#fff", fontWeight: 700, height: 22 }}/> : null}
                </Box>))}
            </Stack>
            <Divider sx={{ my: 2 }}/>
            <Typography sx={{ fontSize: 11, color: "#6b7280", fontWeight: 700, mb: 1 }}>ESTADO DEL ÁREA</Typography>
            <Chip size="small" label="CAPACIDAD: 85%" sx={{ bgcolor: "#fef3c7", color: "#92400e", mb: 1 }}/>
            <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3 }}/>
          </Paper>
          <Paper sx={{ p: 3, bgcolor: "primary.main", color: "#fff" }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>ⓘ Protocolo de Emergencia Red</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>Revisar documentación actualizada de firewalls.</Typography>
          </Paper>
        </Stack>
        <Paper sx={{ flex: 1, p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Tickets Pendientes de Atención</Typography>
            <Link href="#" sx={{ fontSize: 13 }}>↻ Actualizar</Link>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["PRIORIDAD", "TICKET", "REMITENTE", "TIEMPO", "ACCIÓN"].map((h) => (<TableCell key={h} sx={{ color: "#6b7280", fontWeight: 700, fontSize: 11 }}>{h}</TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
            { p: "URGENTE", pc: "#fef3c7", pt: "#92400e", t: "Falla General WiFi Aulario 2", id: "#44219", r: "Ing. Martin Solis", time: "12 min ago", tc: "#dc2626" },
            { p: "NORMAL", pc: "#e5e7eb", pt: "#374151", t: "Instalación Software CAD - Lab 3", id: "#44215", r: "Soporte Alumnos", time: "45 min ago", tc: "#6b7280" },
            { p: "NORMAL", pc: "#e5e7eb", pt: "#374151", t: "Revisión de Proyector Comedor", id: "#44212", r: "Servicios Generales", time: "2h ago", tc: "#6b7280" },
        ].map((r) => (<TableRow key={r.id} hover>
                  <TableCell><Chip size="small" label={r.p} sx={{ bgcolor: r.pc, color: r.pt, fontWeight: 700 }}/></TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{r.t}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#6b7280" }}>ID: {r.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{r.r}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: r.tc, fontWeight: 600 }}>{r.time}</TableCell>
                  <TableCell><IconButton size="small"><VisibilityOutlined fontSize="small"/></IconButton></TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Stack>);
}
function KnowledgeBaseSection() {
    return (<Stack spacing={3}>
      <Typography variant="h4">Base de Conocimiento</Typography>
      <Typography sx={{ color: "#6b7280" }}>Documentación y artículos de ayuda para resolver consultas frecuentes.</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ flexWrap: "wrap" }}>
        {[
            { t: "Acceso al SIU Guaraní", c: "Sistemas", v: 1240 },
            { t: "Restablecer contraseña institucional", c: "Cuentas", v: 980 },
            { t: "Solicitar certificado de alumno regular", c: "Trámites", v: 745 },
            { t: "Conectarse a Wi-Fi UNRaf", c: "Infraestructura", v: 610 },
        ].map((a) => (<Paper key={a.t} sx={{ p: 3, flex: "1 1 280px", cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
            <MenuBookOutlined sx={{ color: "primary.main", mb: 1 }}/>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{a.t}</Typography>
            <Chip size="small" label={a.c} sx={{ bgcolor: "#f3f4f6", mb: 1 }}/>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{a.v} visitas</Typography>
          </Paper>))}
      </Stack>
    </Stack>);
}
function SettingsSection({ person, mode, onToggleMode, legajo, }) {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(false);
    const sections = ["Perfil Personal", "Notificaciones", "Seguridad", "Preferencias"];
    return (<Stack spacing={3}>
      <Typography variant="h4" sx={{ color: "primary.main" }}>Configuración</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        <Paper sx={{ width: { md: 220 }, p: 1.5, flexShrink: 0 }}>
          {sections.map((l, i) => (<Box key={l} sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: i === 0 ? "action.selected" : "transparent",
                fontWeight: i === 0 ? 700 : 500,
                fontSize: 14,
                cursor: "pointer",
                mb: 0.5,
                "&:hover": { bgcolor: "action.hover" },
            }}>
              {l}
            </Box>))}
        </Paper>
        <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Perfil Personal</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: { sm: "flex-start" } }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 32 }}>
                {person.name.charAt(0)}
              </Avatar>
              <Stack spacing={2} sx={{ flex: 1, width: "100%" }}>
                <TextField label="Nombre Completo" defaultValue={person.name} size="small" fullWidth key={person.email + "n"}/>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="Correo Institucional" defaultValue={person.email} size="small" fullWidth key={person.email + "e"}/>
                  <TextField label="Legajo" defaultValue={legajo} size="small" sx={{ width: { xs: "100%", sm: 200 } }}/>
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Preferencias</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Modo Oscuro</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Cambia la apariencia de toda la plataforma.
                </Typography>
              </Box>
              <FormControlLabel control={<Switch checked={mode === "dark"} onChange={onToggleMode}/>} label="" sx={{ m: 0 }}/>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Notificaciones</Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Alertas por Correo</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Recibir actualizaciones de tickets en {person.email}
                  </Typography>
                </Box>
                <Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)}/>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Notificaciones Push</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Alertas inmediatas en navegador y dispositivo móvil.
                  </Typography>
                </Box>
                <Switch checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)}/>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderLeft: "4px solid", borderColor: "primary.main" }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Seguridad</Typography>
            <Stack spacing={2}>
              <TextField label="Contraseña Actual" type="password" size="small" fullWidth/>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Nueva Contraseña" type="password" size="small" fullWidth/>
                <TextField label="Confirmar Nueva Contraseña" type="password" size="small" fullWidth/>
              </Stack>
              <Box>
                <Button variant="contained">Actualizar Contraseña</Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Stack>);
}
/* ---------------- TICKET DETAIL (Admin) ---------------- */
function TicketDetail({ ticket, onBack, admin, }) {
    const [reply, setReply] = useState("");
    const [messages, setMessages] = useState([
        { who: "Julián Martinez", role: "user", time: "Hoy, 10:45 AM", text: "Buenos días, no estoy pudiendo ingresar al campus. Me dice que mi usuario está bloqueado o que la contraseña es incorrecta, pero ayer funcionaba bien. Necesito subir un trabajo práctico antes del mediodía. ¡Gracias!" },
        { who: "Nota Interna - Agente García", role: "note", time: "Hoy, 09:17 AM", text: "Verificando logs en el servidor SIU. Parece haber desincronización en el LDAP de alumnos de tercer año." },
        { who: "Agente Soporte UNRaf", role: "agent", time: "Hoy, 09:25 AM", text: "Hola Julián, estamos revisando el sistema. Hubo un mantenimiento anoche y es posible que algunos perfiles necesiten re-sincronizarse. ¿Podrías intentar ingresar nuevamente en 10 minutos? Ya reiniciamos tu token de sesión." },
        { who: "Julián Martinez", role: "user", time: "Hoy, 09:30 AM", text: "Sigo con el mismo problema. Les adjunto la captura de pantalla de lo que me aparece." },
    ]);
    const handleSend = () => {
        if (!reply.trim())
            return;
        setMessages((m) => [
            ...m,
            { who: admin.name, role: "agent", time: "Ahora", text: reply.trim() },
        ]);
        setReply("");
    };
    return (<Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <IconButton onClick={onBack}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
            {ticket.id} · Creado el 14 Oct, 2023 - 10:45 AM
          </Typography>
          <Typography variant="h5" sx={{ wordBreak: "break-word" }}>{ticket.title}</Typography>
        </Box>
        <Chip label="EN PROCESO" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }}/>
        <Chip label="ALTA" sx={{ bgcolor: "#fee2e2", color: "#991b1b", fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }}/>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        {/* Sidebar */}
        <Stack spacing={2.5} sx={{ width: { lg: 280 }, flexShrink: 0 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Solicitante</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>J</Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Julián Martinez</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Estudiante - Ing. en Computación</Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 1.5 }}/>
            <DetailRow label="DNI" value="42.891.002"/>
            <DetailRow label="Email" value="j.martinez@unraf.edu.ar"/>
            <DetailRow label="Legajo" value="UNR-4922"/>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Línea de Tiempo</Typography>
            <Stack spacing={1.5}>
              {[
            { t: "Hoy, 09:15 AM", title: "Cambio de Estado", d: 'De "Pendiente" a "En Proceso" por Agente García.' },
            { t: "Ayer, 04:30 PM", title: "Ticket Derivado", d: "Mesa de Entradas derivó a Soporte Técnico." },
            { t: "14 Oct, 10:45 AM", title: "Ticket Creado", d: "El sistema registró la solicitud vía Web." },
        ].map((e, i) => (<Box key={i} sx={{ pl: 1.5, borderLeft: "2px solid", borderColor: i === 0 ? "primary.main" : "divider" }}>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{e.t}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{e.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{e.d}</Typography>
                </Box>))}
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

        {/* Conversation */}
        <Paper sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>● Historial de Mensajes</Typography>
            <Stack direction="row">
              <IconButton size="small"><PrintOutlined fontSize="small"/></IconButton>
              <IconButton size="small"><MoreVertOutlined fontSize="small"/></IconButton>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            {messages.map((m, i) => (<Box key={i} sx={{
                p: 1.8,
                borderRadius: 2,
                bgcolor: m.role === "agent" ? "primary.main" :
                    m.role === "note" ? "#fef9c3" : "action.hover",
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
              </Box>))}
          </Stack>

          <Divider sx={{ my: 2 }}/>

          <TextField placeholder="Escribí tu respuesta o seguimiento aquí..." value={reply} onChange={(e) => setReply(e.target.value)} multiline minRows={3} fullWidth/>
          <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
            <Button variant="contained" endIcon={<SendOutlined />} onClick={handleSend}>
              Enviar Respuesta
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Stack>);
}
function DetailRow({ label, value }) {
    return (<Stack direction="row" sx={{ justifyContent: "space-between", py: 0.4 }}>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 600, wordBreak: "break-word", textAlign: "right", ml: 1 }}>{value}</Typography>
    </Stack>);
}
