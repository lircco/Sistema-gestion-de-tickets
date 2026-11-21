import { describe, it, expect } from "vitest";
import { ESTADO_LABELS, estadoLabel } from "./estados";

describe("estadoLabel", () => {
  it("devuelve la etiqueta legible de cada estado conocido", () => {
    expect(estadoLabel("ABIERTO")).toBe("Abierto");
    expect(estadoLabel("EN_PROGRESO")).toBe("En Progreso");
    expect(estadoLabel("CERRADO")).toBe("Cerrado");
  });

  it("nunca muestra guiones en un estado desconocido", () => {
    expect(estadoLabel("EN_ESPERA_DE_ALUMNO")).toBe("EN ESPERA DE ALUMNO");
  });

  it("devuelve cadena vacía si no hay estado", () => {
    expect(estadoLabel(undefined)).toBe("");
  });

  it("ninguna etiqueta contiene guiones", () => {
    Object.values(ESTADO_LABELS).forEach((l) => expect(l).not.toMatch(/[_-]/));
  });
});
