import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: {
    getTickets: vi.fn(),
    getStats: vi.fn(),
    getCategorias: vi.fn(),
    getAreas: vi.fn(),
    getArticulos: vi.fn(),
  },
}));

describe("Dashboard Knowledge Base Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTickets.mockResolvedValue([]);
    api.getStats.mockResolvedValue({ total: 0, abiertos: 0, cerrados: 0, en_progreso: 0 });
    api.getCategorias.mockResolvedValue([]);
    api.getAreas.mockResolvedValue([]);
    api.getArticulos.mockResolvedValue([]);
  });

  it("AdminDashboard does not contain Base de Conocimiento for Staff", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminDashboard
          onLogout={vi.fn()}
          admin={{ username: "staff_it", rol: "STAFF", first_name: "Staff", last_name: "IT" }}
          mode="light"
          onToggleMode={vi.fn()}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Lista de Tickets")).toBeDefined();
    });

    expect(screen.queryByText("Base de Conocimiento")).toBeNull();
  });

  it("AdminDashboard does not contain Base de Conocimiento for Supervisor", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminDashboard
          onLogout={vi.fn()}
          admin={{
            username: "supervisor",
            rol: "SUPERVISOR",
            first_name: "Supervisor",
            last_name: "Admin",
          }}
          mode="light"
          onToggleMode={vi.fn()}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Lista de Tickets")).toBeDefined();
    });

    expect(screen.queryByText("Base de Conocimiento")).toBeNull();
  });

  it("UserDashboard contains Base de Conocimiento for Estudiante", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <UserDashboard
          onLogout={vi.fn()}
          user={{ username: "alumno", rol: "ESTUDIANTE", first_name: "Alumno", last_name: "Test" }}
          mode="light"
          onToggleMode={vi.fn()}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mis Tickets")).toBeDefined();
    });

    expect(screen.getByText("Base de Conocimiento")).toBeDefined();
  });
});
