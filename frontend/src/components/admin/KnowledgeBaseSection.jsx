import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  MenuBookOutlined,
  SearchOutlined,
  ClearOutlined,
  ArrowForwardOutlined,
  CloseOutlined,
  ContentCopyOutlined,
  ThumbUpOutlined,
  RefreshOutlined,
  HelpOutlineOutlined,
} from "@mui/icons-material";
import { api } from "../../lib/api";

export const DEFAULT_ARTICLES = [
  {
    id: 1,
    titulo: "Acceso al SIU Guaraní",
    categoria: "Sistemas",
    resumen: "Guía paso a paso para acceder por primera vez o recuperar el acceso al portal de autogestión SIU Guaraní.",
    contenido: `El sistema SIU Guaraní es la plataforma de gestión académica donde podés consultar tu plan de estudio, historia académica, inscribirte a cursadas y exámenes finales, y solicitar constancias oficiales.

### 1. ¿Cómo ingresar por primera vez?
- Accedé desde el navegador a la dirección oficial: **guarani.unraf.edu.ar**.
- Tu **Usuario** corresponde a tu número de Documento Nacional de Identidad (DNI) sin puntos ni espacios.
- La **Contraseña inicial** es asignada durante el proceso de inscripción y notificada a tu correo institucional (@unraf.edu.ar). Si no la recibiste, probá utilizando tu DNI como clave provisoria.

### 2. Olvido o bloqueo de contraseña
- Si ingresaste la clave incorrectamente o no la recordás, hacé clic en el enlace **"¿Olvidaste tu contraseña o sos nuevo usuario?"** en la pantalla principal del SIU.
- Ingresá tu número de DNI o tu correo electrónico institucional.
- Te llegará un correo con un enlace temporal para generar una nueva contraseña segura. Recordá revisar la carpeta de Correo no deseado o Spam.

### 3. Asistencia adicional
- Si el problema persiste o tus datos no coinciden, iniciá un ticket en UnrafTickets seleccionando el área **Sistemas / Alumnado** o dirigite a la oficina de Bedelía.`,
  },
  {
    id: 2,
    titulo: "Restablecer contraseña institucional",
    categoria: "Cuentas",
    resumen: "Instrucciones para recuperar tu acceso a la cuenta institucional UNRaf, correo y servicios vinculados.",
    contenido: `Tu cuenta institucional (@unraf.edu.ar) te brinda acceso al ecosistema digital de la universidad: correo electrónico, campus virtual, UnrafTickets y redes internas.

### 1. Recuperación automática desde UnrafTickets
- Dirigite a la pantalla de inicio de sesión de **UnrafTickets**.
- Hacé clic en **"¿Olvidaste tu contraseña?"** debajo del formulario de ingreso.
- Ingresá el correo electrónico asociado a tu cuenta.
- El sistema te enviará un código numérico de verificación de 6 dígitos con validez por 15 minutos.
- Ingresá el código en la pantalla y definí tu nueva contraseña segura.

### 2. Requisitos de seguridad para la nueva clave
- Debe contener un mínimo de **8 caracteres**.
- Debe incluir una combinación de letras mayúsculas, minúsculas y al menos un número.
- Evitá utilizar tu fecha de nacimiento o tu número de documento.

### 3. ¿No recibiste el correo?
- Asegurate de escribir la dirección de correo correctamente.
- Si no tenés acceso a tu casilla alternativa o tu cuenta quedó bloqueada por intentos fallidos, comunicate con **Soporte Técnico** a través de soporte@unraf.edu.ar.`,
  },
  {
    id: 3,
    titulo: "Solicitar certificado de alumno regular",
    categoria: "Trámites",
    resumen: "Cómo emitir y validar de manera 100% online tu constancia de alumno regular con validez oficial.",
    contenido: `El Certificado de Alumno Regular acredita tu condición de estudiante activo en la Universidad Nacional de Rafaela para presentar ante organismos públicos, transporte, obras sociales y empleadores.

### 1. Emisión digital desde SIU Guaraní
- Iniciá sesión en el **SIU Guaraní** con tu DNI y contraseña.
- En el menú superior, navegá a la sección **Trámites** > **Solicitud de Constancias y Certificados**.
- Seleccioná la propuesta formativa correspondiente (tu carrera de grado o pregrado).
- Elegí el tipo de constancia: **"Certificado de Alumno Regular"**.
- El documento se generará inmediatamente en formato PDF para su descarga e impresión.

### 2. Validez y verificación digital
- Cada certificado cuenta con un **código de validación único** y un código QR al pie de la página.
- Cualquier entidad u organismo puede verificar la autenticidad del documento ingresando al verificador público de la universidad sin necesidad de firma manuscrita ni sello físico.

### 3. Requisitos académicos
- Para emitir el certificado debés tener la matrícula anual activa y cumplir con las condiciones académicas mínimas de la carrera.`,
  },
  {
    id: 4,
    titulo: "Conectarse a Wi-Fi UNRaf",
    categoria: "Infraestructura",
    resumen: "Guía de configuración para conectarte a las redes inalámbricas universitarias desde laptops y celulares.",
    contenido: `La universidad cuenta con cobertura Wi-Fi de alta velocidad en todos sus edificios, aulas, laboratorios y áreas comunes del campus.

### 1. Redes disponibles
- **UNRaf_Alumnos**: Red destinada al estudiantado activo.
- **UNRaf_Institucional**: Red para docentes, nodocentes y personal administrativo.

### 2. Parámetros de conexión (Seguridad WPA2-Enterprise)
- **Método EAP**: PEAP
- **Autenticación de Fase 2**: MSCHAPv2
- **Certificado de CA**: "No validar" (o "Confiar en el certificado del sistema")
- **Identidad**: Tu correo institucional completo (o número de DNI según tu rol).
- **Contraseña**: La misma contraseña de tu cuenta institucional.

### 3. Solución de problemas comunes
- Si el dispositivo indica "Fallo de autenticación", eliminá u "olvidá" la red guardada y volvé a ingresar las credenciales.
- Verificá que la fecha y hora de tu dispositivo estén sincronizadas con la red horaria de Argentina.
- Si requerís soporte en el campus, acercate a la mesa de ayuda de Informática o abrí un ticket en el área de Infraestructura.`,
  },
  {
    id: 5,
    titulo: "Uso de Aulas Virtuales y Campus Moodle",
    categoria: "Sistemas",
    resumen: "Información para acceder al campus virtual, matricularse en materias y entregar actividades.",
    contenido: `El Campus Virtual de la UNRaf funciona sobre la plataforma Moodle y es el entorno donde se desarrollan las actividades pedagógicas complementarias y a distancia.

### 1. Acceso a la plataforma
- Ingresá a **campus.unraf.edu.ar**.
- Iniciá sesión con tus credenciales institucionales unificadas.
- En tu panel "Mis cursos" encontrarás las aulas correspondientes al cuatrimestre vigente.

### 2. Matriculación y sincronización
- La sincronización entre SIU Guaraní y el Campus Virtual se realiza de forma automática dentro de las 48 horas posteriores a tu confirmación de inscripción a cursada.
- Si no visualizás una materia en la que estás inscripto, corroborá en el SIU Guaraní que tu inscripción esté en estado "Aceptada".

### 3. Entrega de tareas y foros
- Verificá los formatos permitidos (generalmente PDF) y el límite de tamaño de archivo (máximo 20 MB por entrega).`,
  },
  {
    id: 6,
    titulo: "Protocolo de Mantenimiento y Reserva de Equipos",
    categoria: "Infraestructura",
    resumen: "Procedimiento para solicitar proyectores, netbooks o salas multimedia para actividades académicas.",
    contenido: `Para garantizar la disponibilidad de recursos tecnológicos en clases, exámenes y eventos institucionales:

### 1. Quiénes pueden solicitar equipos
- Docentes, coordinadores de carrera y personal no docente debidamente acreditado.
- Los estudiantes pueden solicitar soporte a través del docente a cargo de la cátedra.

### 2. Antelación para la reserva
- Las reservas deben solicitarse con al menos **24 horas de antelación** a través de UnrafTickets en el área de **Soporte Infraestructura**.
- Detallar el aula, horario de inicio y finalización, y requerimientos técnicos específicos (micrófono, proyector HDMI, puntero láser, audio).

### 3. Devolución y cuidado
- El solicitante es responsable de la recepción y entrega de los equipos en la mesa técnica correspondiente.`,
  },
];

const CATEGORY_COLORS = {
  Sistemas: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  Cuentas: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  Trámites: { bg: "#f3e8ff", text: "#7e22ce", border: "#e9d5ff" },
  Infraestructura: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  General: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
};

const renderFormattedText = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Box component="strong" key={index} sx={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </Box>
      );
    }
    return part;
  });
};

const renderMarkdownContent = (content) => {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <Box component="ul" key={`list-${elements.length}`} sx={{ pl: 3, my: 1 }}>
          {currentList.map((item, idx) => (
            <Typography component="li" key={idx} sx={{ mb: 0.5, fontSize: 14 }}>
              {renderFormattedText(item)}
            </Typography>
          ))}
        </Box>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith("#")) {
      flushList();
      const heading = line.replace(/^#+\s*(?:\d+[\.\)]\s*)?/, "").trim();
      elements.push(
        <Typography
          key={`h-${idx}`}
          variant="h6"
          sx={{ fontWeight: 700, mt: 3, mb: 1, color: "primary.main" }}
        >
          {heading}
        </Typography>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      currentList.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushList();
      elements.push(
        <Typography key={`p-${idx}`} sx={{ mb: 1.5, fontSize: 14 }}>
          {renderFormattedText(line)}
        </Typography>
      );
    }
  });

  flushList();
  return elements;
};

export default function KnowledgeBaseSection({ user, admin }) {
  // Verificación de acceso exclusivo para rol Alumno (ESTUDIANTE)
  const currentRole = user?.rol || admin?.rol;
  if (currentRole && currentRole !== "ESTUDIANTE") {
    return (
      <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
        <Typography variant="h6" color="error" sx={{ fontWeight: 700, mb: 1 }}>
          Acceso no permitido
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          El módulo de Base de Conocimiento es de acceso exclusivo para estudiantes.
        </Typography>
      </Paper>
    );
  }

  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [activeArticle, setActiveArticle] = useState(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const loadArticles = useCallback(async (query = "") => {
    setIsLoading(true);
    try {
      const data = await api.getArticulos(query);
      const list = Array.isArray(data) ? data : data?.results || [];
      if (!query && list.length === 0) {
        setArticles(DEFAULT_ARTICLES);
      } else {
        setArticles(list.length > 0 ? list : DEFAULT_ARTICLES);
      }
    } catch (err) {
      console.warn("No se pudo cargar desde el endpoint, usando base de artículos locales:", err);
      setArticles(DEFAULT_ARTICLES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles("");
  }, [loadArticles]);

  const categories = useMemo(() => {
    const cats = new Set();
    articles.forEach((a) => {
      if (a.categoria) cats.add(a.categoria);
    });
    return ["TODOS", ...Array.from(cats)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCategory =
        selectedCategory === "TODOS" ||
        (a.categoria || "").toUpperCase() === selectedCategory.toUpperCase();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesQuery =
        (a.titulo || "").toLowerCase().includes(query) ||
        (a.categoria || "").toLowerCase().includes(query) ||
        (a.resumen || "").toLowerCase().includes(query) ||
        (a.contenido || "").toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const handleOpenArticle = async (article) => {
    setActiveArticle(article);
    setReaderOpen(true);

    try {
      await api.marcarLecturaArticulo(article.id);
    } catch {
      // Ignorar silenciosamente si no se puede registrar la lectura en backend
    }
  };

  const handleCopyLink = () => {
    if (activeArticle) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(window.location.href);
      }
      setSnackbar({
        open: true,
        message: "Enlace del artículo copiado al portapapeles.",
        severity: "success",
      });
    }
  };

  const handleMarkHelpful = () => {
    setSnackbar({
      open: true,
      message: "¡Gracias por tu valoración! Nos ayuda a mejorar la documentación.",
      severity: "success",
    });
  };

  return (
    <Stack spacing={3}>
      {/* HEADER SECTION */}
      <Box
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Base de Conocimiento
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
            Documentación oficial y artículos de resolución de dudas para estudiantes.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Chip
            icon={<MenuBookOutlined fontSize="small" />}
            label={`${articles.length} Artículos`}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Tooltip title="Actualizar artículos">
            <IconButton
              onClick={() => loadArticles(searchQuery)}
              size="small"
              aria-label="Actualizar artículos"
            >
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* SEARCH AND FILTER TOOLBAR */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por título, categoría o contenido (ej: wifi, SIU, contraseña)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")} aria-label="Limpiar búsqueda">
                      <ClearOutlined fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          {/* CATEGORY CHIPS */}
          <Box className="flex flex-wrap gap-2" sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  color={isSelected ? "primary" : "default"}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": { bgcolor: isSelected ? "primary.dark" : "action.hover" },
                  }}
                />
              );
            })}
          </Box>
        </Stack>
      </Paper>

      {isLoading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {/* ARTICLES GRID */}
      {filteredArticles.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
          <HelpOutlineOutlined sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            No se encontraron artículos
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            No hay artículos que coincidan con &ldquo;{searchQuery}&rdquo; en la categoría seleccionada.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("TODOS");
            }}
          >
            Limpiar filtros
          </Button>
        </Paper>
      ) : (
        <Box
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {filteredArticles.map((a) => {
            const catStyle = CATEGORY_COLORS[a.categoria] || CATEGORY_COLORS.General;
            return (
              <Paper
                key={a.id || a.titulo}
                onClick={() => handleOpenArticle(a)}
                elevation={1}
                className="flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRadius: 2.5,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 6,
                    borderColor: "primary.main",
                  },
                }}
              >
                {/* CATEGORY ROW */}
                <Box sx={{ mb: 1.5 }}>
                  <Chip
                    size="small"
                    label={a.categoria}
                    sx={{
                      bgcolor: catStyle.bg,
                      color: catStyle.text,
                      border: `1px solid ${catStyle.border}`,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                </Box>

                {/* ICON & TITLE */}
                <Stack direction="row" spacing={1.2} sx={{ alignItems: "flex-start", mb: 1 }}>
                  <MenuBookOutlined sx={{ color: "primary.main", fontSize: 22, mt: 0.2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.3,
                      flex: 1,
                      color: "text.primary",
                    }}
                  >
                    {a.titulo}
                  </Typography>
                </Stack>

                {/* RESUMEN EXCERPT */}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    mb: 2.5,
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.5,
                  }}
                >
                  {a.resumen || a.contenido?.slice(0, 120) || "Documentación y guía de soporte paso a paso."}
                </Typography>

                {/* BOTTOM ACTION LINK */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "primary.main",
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    Leer artículo completo
                  </Typography>
                  <ArrowForwardOutlined fontSize="small" />
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* ARTICLE READER MODAL / DIALOG */}
      <Dialog
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        {activeArticle && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      size="small"
                      label={activeArticle.categoria}
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {activeArticle.titulo}
                  </Typography>
                </Box>
                <IconButton onClick={() => setReaderOpen(false)} size="small" aria-label="Cerrar diálogo">
                  <CloseOutlined />
                </IconButton>
              </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 3 }}>
              {activeArticle.resumen && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  {activeArticle.resumen}
                </Alert>
              )}

              <Box sx={{ typography: "body1", lineHeight: 1.7, color: "text.primary" }}>
                {renderMarkdownContent(activeArticle.contenido)}
              </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyOutlined />}
                  onClick={handleCopyLink}
                >
                  Copiar enlace
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ThumbUpOutlined />}
                  onClick={handleMarkHelpful}
                >
                  Me resultó útil
                </Button>
              </Stack>
              <Button variant="contained" onClick={() => setReaderOpen(false)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* SNACKBAR FEEDBACK */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
