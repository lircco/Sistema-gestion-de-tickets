import { test, expect } from "@playwright/test";

test.describe("Flujo de Alumno", () => {
  test("debe poder loguearse y crear un ticket", async ({ page }) => {
    // 1. Navegar y Loguearse
    await page.goto("/");
    const emailInput = page
      .getByPlaceholder("usuario@gmail.com")
      .or(page.getByRole("textbox", { name: /email/i }))
      .first();
    await emailInput.fill("alumno_e2e@test.com");
    await page.getByPlaceholder("••••••••").first().fill("password123");
    await page.locator('button[type="submit"]').click();

    // 2. Verificar que entró al Dashboard de Alumno
    await expect(page).toHaveURL(/\//);
    await expect(page.locator("text=Mis Tickets")).toBeVisible();

    // 3. Abrir modal de Nuevo Ticket
    await page.locator("text=Crear Nuevo Ticket").click();

    // 4. Completar Formulario
    await page.getByLabel(/Título/i).fill("Problema con el aula virtual");
    await page.getByLabel(/Área Responsable/i).click();
    await page.getByRole("option", { name: "Soporte Técnico" }).click();

    await page.getByLabel(/Categoría/i).click();
    await page.getByRole("option", { name: "Falla de Software" }).click();

    await page.getByLabel(/Descripción/i).fill("No puedo acceder a la materia de Programación.");

    // 5. Enviar Ticket
    await page.getByRole("button", { name: /Enviar Ticket/i }).click();

    // 6. Verificar que el modal se cierra y aparece en la tabla
    await expect(page.locator("text=Problema con el aula virtual")).toBeVisible();
    await expect(page.locator("text=ABIERTO").first()).toBeVisible();
  });

  test("debe poder acceder a Base de Conocimiento con usuario alumno, buscar y leer un artículo sin contadores de visitas", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByPlaceholder("usuario@gmail.com").fill("alumno@unraf.edu.ar");
    await page.getByPlaceholder("••••••••").first().fill("alumno123");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\//);

    // Navegar a Base de Conocimiento desde la sidebar de Alumno
    await expect(page.locator("text=Base de Conocimiento")).toBeVisible();
    await page.locator("text=Base de Conocimiento").click();
    await expect(page).toHaveURL(/\/kb/);
    await expect(page.locator('h4:has-text("Base de Conocimiento")')).toBeVisible();

    // Validar chips de categorías y buscador
    await expect(page.getByPlaceholder(/Buscar por título/i)).toBeVisible();
    await expect(page.locator("text=TODOS")).toBeVisible();

    // Filtrar/Buscar artículo
    const searchInput = page.getByPlaceholder(/Buscar por título/i);
    await searchInput.fill("SIU");
    await expect(page.locator("text=Acceso al SIU Guaraní")).toBeVisible();

    // Abrir artículo y verificar contenido en el modal
    await page.locator("text=Acceso al SIU Guaraní").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("text=¿Cómo ingresar por primera vez?")).toBeVisible();

    // Verificar que no se muestran contadores de visitas ni vistas
    await expect(page.locator("text=/\\d+\\s*visitas/i")).not.toBeVisible();
    await expect(page.locator("text=/\\d+\\s*vistas/i")).not.toBeVisible();
    await expect(page.locator("text=4.000")).not.toBeVisible();

    // Cerrar modal
    await page.getByRole("button", { name: "Cerrar", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
