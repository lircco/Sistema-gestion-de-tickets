import { expect } from "@playwright/test";

// Usuarios creados por `manage.py seed_e2e_data`
export async function loginAlumno(page) {
  await page.goto("/");
  await page.getByPlaceholder("usuario@gmail.com").fill("alumno_e2e@test.com");
  await page.getByPlaceholder("••••••••").first().fill("password123");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("text=Mis Tickets")).toBeVisible();
}

export async function loginStaff(page) {
  await page.goto("/");
  await page.locator("text=Admin").click();
  await page.getByPlaceholder("Ej. Pedro Gonzalez").fill("admin_e2e");
  await page.getByPlaceholder("••••••••").first().fill("password123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin/);
}

// Crea un ticket desde el formulario del alumno (opcionalmente con un adjunto)
export async function crearTicket(page, titulo, adjunto = null) {
  await page.locator("text=Crear Nuevo Ticket").click();
  await page.getByLabel(/Título/i).fill(titulo);
  await page.getByLabel(/Área Responsable/i).click();
  await page.getByRole("option", { name: "Soporte Técnico" }).click();
  await page.getByLabel(/Categoría/i).click();
  await page.getByRole("option", { name: "Falla de Software" }).click();
  await page.getByLabel(/Descripción/i).fill("Ticket creado por los tests E2E.");
  if (adjunto) {
    await page.locator('input[type="file"]').setInputFiles(adjunto);
  }
  await page.getByRole("button", { name: /Enviar Ticket/i }).click();
  const fila = page.locator("tr", { hasText: titulo });
  await expect(fila).toBeVisible();
  return fila;
}
