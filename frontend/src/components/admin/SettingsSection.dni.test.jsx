import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsSection from "./SettingsSection";
import { api } from "../../lib/api";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../lib/api", () => ({
  api: {
    getAreas: vi.fn().mockResolvedValue([]),
    updateMe: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock("../../lib/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    setUser: vi.fn(),
  }),
}));

describe("SettingsSection - DNI y Foto de Perfil (Issue #97)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el campo DNI editable y el botón Guardar cuando el usuario no tiene DNI cargado", () => {
    render(
      <SettingsSection
        person={{ name: "Juan Perez", email: "juan@unraf.edu.ar", dni: null }}
        mode="light"
        onToggleMode={() => {}}
        legajo="2024-001"
      />,
    );

    const dniInput = screen.getByLabelText(/DNI/i);
    expect(dniInput).toBeDefined();
    expect(dniInput.disabled).toBe(false);
    expect(screen.getByRole("button", { name: /Guardar DNI/i })).toBeDefined();
  });

  it("bloquea el campo DNI si el usuario ya tiene un DNI registrado", () => {
    render(
      <SettingsSection
        person={{ name: "Juan Perez", email: "juan@unraf.edu.ar", dni: "40123456" }}
        mode="light"
        onToggleMode={() => {}}
        legajo="2024-001"
      />,
    );

    const dniInput = screen.getByLabelText(/DNI/i);
    expect(dniInput.disabled).toBe(true);
    expect(dniInput.value).toBe("40123456");
    expect(screen.queryByRole("button", { name: /Guardar DNI/i })).toBeNull();
    expect(screen.getByText(/El DNI ya fue registrado y no se puede modificar/i)).toBeDefined();
  });

  it("guarda el DNI correctamente y luego lo bloquea", async () => {
    api.updateMe.mockResolvedValueOnce({ dni: "40123456" });

    render(
      <SettingsSection
        person={{ name: "Juan Perez", email: "juan@unraf.edu.ar", dni: "" }}
        mode="light"
        onToggleMode={() => {}}
        legajo="2024-001"
      />,
    );

    const dniInput = screen.getByLabelText(/DNI/i);
    fireEvent.change(dniInput, { target: { value: "40123456" } });

    const guardarBtn = screen.getByRole("button", { name: /Guardar DNI/i });
    fireEvent.click(guardarBtn);

    await waitFor(() => {
      expect(api.updateMe).toHaveBeenCalledWith({ dni: "40123456" });
      expect(screen.getByText(/DNI registrado correctamente/i)).toBeDefined();
    });

    expect(dniInput.disabled).toBe(true);
  });

  it("muestra el botón para cambiar foto de perfil", () => {
    render(
      <SettingsSection
        person={{ name: "Juan Perez", email: "juan@unraf.edu.ar", foto_perfil: null }}
        mode="light"
        onToggleMode={() => {}}
        legajo="2024-001"
      />,
    );

    expect(screen.getByRole("button", { name: /Cambiar foto/i })).toBeDefined();
  });
});
