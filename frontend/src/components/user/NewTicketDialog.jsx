import React, { useState, useEffect } from "react";
import { Box, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Typography, Alert, LinearProgress } from "@mui/material";
import { AttachFileOutlined, PictureAsPdfOutlined, ImageOutlined, InsertDriveFileOutlined, CloseOutlined } from "@mui/icons-material";
import { api } from "../../lib/api";

export default function NewTicketDialog({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    api.getCategorias().then((d) => setCategories(d.results || d)).catch(() => {});
    api.getAreas().then((d) => setAreas(d.results || d)).catch(() => {});
  }, []);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategoryId("");
    setAreaId("");
    setFiles([]);
    setError("");
  };

  const MAX_SIZE = 5 * 1024 * 1024;
  const ACCEPT = "image/*,application/pdf";

  const handleFiles = (incoming) => {
    if (!incoming) return;
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

  const handleSubmit = async () => {
    setError("");
    if (!title.trim() || !description.trim() || !categoryId || !areaId) {
      setError("Completá todos los campos requeridos.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", title.trim());
    formData.append("descripcion", description.trim());
    formData.append("categoria", categoryId);
    formData.append("area_responsable", areaId);
    files.forEach((file) => formData.append("archivo_adjunto", file));

    setSubmitting(true);
    try {
      await api.createTicket(formData);
      onCreated?.();
      onClose();
      reset();
    } catch (err) {
      setError(err.message || "Error al crear el ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Crear Nuevo Ticket</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth size="small" />
          <Stack direction="row" spacing={2}>
            <TextField select label="Categoría" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth size="small">
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Área Responsable" value={areaId} onChange={(e) => setAreaId(e.target.value)} fullWidth size="small">
              {areas.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={4} />
          <Box>
            <Button component="label" variant="outlined" startIcon={<AttachFileOutlined />} size="small">
              Adjuntar archivos
              <input type="file" hidden multiple accept={ACCEPT} onChange={(e) => handleFiles(e.target.files)} />
            </Button>
            <Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>
              Imágenes o PDF · máx. 5 MB c/u · hasta 5 archivos
            </Typography>
            {files.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {files.map((f, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, border: "1px solid #e5e7eb", borderRadius: 1.5, bgcolor: "#f9fafb" }}>
                    {f.type === "application/pdf" ? <PictureAsPdfOutlined sx={{ color: "#dc2626" }} /> : f.type.startsWith("image/") ? <ImageOutlined sx={{ color: "primary.main" }} /> : <InsertDriveFileOutlined />}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: "#6b7280" }}>{(f.size / 1024).toFixed(1)} KB</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                      <CloseOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {submitting && <LinearProgress />}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>Enviar Ticket</Button>
      </DialogActions>
    </Dialog>
  );
}
