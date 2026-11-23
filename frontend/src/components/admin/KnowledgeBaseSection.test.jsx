import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import KnowledgeBaseSection, { DEFAULT_ARTICLES } from "./KnowledgeBaseSection";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    getArticulos: vi.fn(),
    marcarLecturaArticulo: vi.fn(),
  },
}));

const mockArticles = [
  {
    id: 1,
    titulo: "Acceso al SIU Guaraní",
    categoria: "Sistemas",
    resumen: "Guía de acceso al portal SIU Guaraní.",
    contenido: "### 1. Pasos de acceso\nIngresá con tu DNI.\n- Paso 1\n- Paso 2",
  },
  {
    id: 2,
    titulo: "Conectarse a Wi-Fi UNRaf",
    categoria: "Infraestructura",
    resumen: "Configuración para conectarse a las redes inalámbricas.",
    contenido: "### 1. Conexión WiFi\nElegí la red UNRaf_Alumnos.",
  },
];

describe("KnowledgeBaseSection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders title and loads articles from API without view counters", async () => {
    api.getArticulos.mockResolvedValueOnce(mockArticles);

    render(<KnowledgeBaseSection />);

    expect(screen.getByText("Base de Conocimiento")).toBeDefined();

    await waitFor(() => {
      expect(api.getArticulos).toHaveBeenCalled();
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
      expect(screen.getByText("Conectarse a Wi-Fi UNRaf")).toBeDefined();
    });

    // Validar que no hay contadores de vistas ni en cabecera ni en tarjetas
    expect(screen.queryByText(/visitas/i)).toBeNull();
    expect(screen.queryByText(/vistas/i)).toBeNull();
  });

  it("filters articles by search input", async () => {
    api.getArticulos.mockResolvedValueOnce(mockArticles);

    render(<KnowledgeBaseSection />);

    await waitFor(() => {
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(searchInput, { target: { value: "Wi-Fi" } });

    await waitFor(() => {
      expect(screen.queryByText("Acceso al SIU Guaraní")).toBeNull();
      expect(screen.getByText("Conectarse a Wi-Fi UNRaf")).toBeDefined();
    });
  });

  it("filters articles by category chip", async () => {
    api.getArticulos.mockResolvedValueOnce(mockArticles);

    render(<KnowledgeBaseSection />);

    await waitFor(() => {
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });

    const infraChip = screen.getAllByText("Infraestructura")[0];
    fireEvent.click(infraChip);

    await waitFor(() => {
      expect(screen.queryByText("Acceso al SIU Guaraní")).toBeNull();
      expect(screen.getByText("Conectarse a Wi-Fi UNRaf")).toBeDefined();
    });
  });

  it("opens reader modal and calls api.marcarLecturaArticulo without displaying view counts", async () => {
    api.getArticulos.mockResolvedValueOnce(mockArticles);
    api.marcarLecturaArticulo.mockResolvedValueOnce({ id: 1, visitas: 1241 });

    render(<KnowledgeBaseSection />);

    await waitFor(() => {
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });

    const articleCard = screen.getByText("Acceso al SIU Guaraní");
    fireEvent.click(articleCard);

    await waitFor(() => {
      expect(api.marcarLecturaArticulo).toHaveBeenCalledWith(1);
      expect(screen.getByText("Pasos de acceso")).toBeDefined();
      expect(screen.getByText("Ingresá con tu DNI.")).toBeDefined();
    });

    // Validar que dentro del modal no hay contador de visitas
    expect(screen.queryByText(/1241/)).toBeNull();
    expect(screen.queryByText(/visitas/i)).toBeNull();
    expect(screen.queryByText(/vistas/i)).toBeNull();

    // Close dialog
    const closeBtn = screen.getByRole("button", { name: "Cerrar" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Ingresá con tu DNI.")).toBeNull();
    });
  });

  it("falls back to default articles if api call fails", async () => {
    api.getArticulos.mockRejectedValueOnce(new Error("Network error"));

    render(<KnowledgeBaseSection />);

    await waitFor(() => {
      expect(screen.getByText(DEFAULT_ARTICLES[0].titulo)).toBeDefined();
    });
    // Validar que no hay contadores de vistas incluso con artículos por defecto
    expect(screen.queryByText(/visitas/i)).toBeNull();
  });

  it("handles copy link and helpful actions inside reader modal", async () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    api.getArticulos.mockResolvedValueOnce(mockArticles);
    api.marcarLecturaArticulo.mockResolvedValueOnce({ id: 1 });

    render(<KnowledgeBaseSection />);

    await waitFor(() => {
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Acceso al SIU Guaraní"));

    await waitFor(() => {
      expect(screen.getByText("Copiar enlace")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Copiar enlace"));
    expect(writeTextMock).toHaveBeenCalled();
    expect(screen.getByText("Enlace del artículo copiado al portapapeles.")).toBeDefined();

    fireEvent.click(screen.getByText("Me resultó útil"));
    expect(
      screen.getByText("¡Gracias por tu valoración! Nos ayuda a mejorar la documentación."),
    ).toBeDefined();
  });

  it("shows empty state when no articles match filter and resets on Limpiar filtros click", async () => {
    api.getArticulos.mockResolvedValueOnce(mockArticles);

    render(<KnowledgeBaseSection />);

    await waitFor(() => {
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(searchInput, { target: { value: "Inexistente123" } });

    await waitFor(() => {
      expect(screen.getByText("No se encontraron artículos")).toBeDefined();
    });

    const resetBtn = screen.getByRole("button", { name: "Limpiar filtros" });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });
  });

  it("blocks access for non-student roles (STAFF and SUPERVISOR)", () => {
    const { rerender } = render(<KnowledgeBaseSection user={{ rol: "STAFF" }} />);
    expect(screen.getByText("Acceso no permitido")).toBeDefined();
    expect(screen.getByText(/exclusivo para estudiantes/i)).toBeDefined();

    rerender(<KnowledgeBaseSection admin={{ rol: "SUPERVISOR" }} />);
    expect(screen.getByText("Acceso no permitido")).toBeDefined();
  });

  it("allows access for ESTUDIANTE role", async () => {
    api.getArticulos.mockResolvedValueOnce(mockArticles);

    render(<KnowledgeBaseSection user={{ rol: "ESTUDIANTE" }} />);

    expect(screen.getByText("Base de Conocimiento")).toBeDefined();
    expect(screen.queryByText("Acceso no permitido")).toBeNull();

    await waitFor(() => {
      expect(api.getArticulos).toHaveBeenCalled();
      expect(screen.getByText("Acceso al SIU Guaraní")).toBeDefined();
    });
  });
});
