import React from "react";
import { Alert } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

/** Aviso que reemplaza al editor de mensajes cuando el ticket está cerrado. */
export default function ClosedChatNotice() {
  return (
    <Alert severity="info" icon={<LockOutlined fontSize="small" />}>
      Este ticket está cerrado. La conversación quedó en modo solo lectura y no se pueden enviar más
      mensajes.
    </Alert>
  );
}
