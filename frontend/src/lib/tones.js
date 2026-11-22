// Tonos semánticos para etiquetas, chips y avisos, con contraste AA (>= 4.5:1)
// tanto en tema claro como en oscuro. En claro: fondo pastel + texto oscuro;
// en oscuro: fondo translúcido + texto claro (sobre background.paper #1e293b).
const TONES = {
  blue: { light: ["#dbeafe", "#1d4ed8"], dark: ["rgba(59,130,246,0.2)", "#93c5fd"] },
  amber: { light: ["#fef3c7", "#92400e"], dark: ["rgba(245,158,11,0.2)", "#fcd34d"] },
  green: { light: ["#d1fae5", "#065f46"], dark: ["rgba(16,185,129,0.2)", "#6ee7b7"] },
  red: { light: ["#fee2e2", "#991b1b"], dark: ["rgba(239,68,68,0.2)", "#fca5a5"] },
  gray: { light: ["#f3f4f6", "#374151"], dark: ["rgba(148,163,184,0.2)", "#e2e8f0"] },
};

export const STATUS_TONE = { ABIERTO: "blue", EN_PROGRESO: "amber", CERRADO: "green" };
export const PRIORITY_TONE = { ALTA: "red", MEDIA: "amber", BAJA: "gray" };

/** Devuelve { bg, fg } del tono para el modo dado ("light" | "dark"). */
export function toneColors(tone, mode) {
  const [bg, fg] = (TONES[tone] || TONES.gray)[mode === "dark" ? "dark" : "light"];
  return { bg, fg };
}

/** Función `sx` de MUI que aplica fondo y color de texto del tono según el tema. */
export const toneSx = (tone) => (theme) => {
  const { bg, fg } = toneColors(tone, theme.palette.mode);
  return { bgcolor: bg, color: fg };
};
