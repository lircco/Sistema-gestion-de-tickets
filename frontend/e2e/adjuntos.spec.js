import { test, expect } from "@playwright/test";
import { crearTicket, loginAlumno } from "./helpers";

// PNG válido de 1x1 píxel
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

test.describe("Adjuntos", () => {
  test("el alumno sube un adjunto y lo abre por el endpoint autenticado", async ({ page }) => {
    await loginAlumno(page);
    await crearTicket(page, "Ticket E2E con adjunto", {
      name: "captura.png",
      mimeType: "image/png",
      buffer: PNG_1X1,
    });

    // El botón "Ver adjunto" está en el listado de "Mis Tickets"
    await page.getByText("Mis Tickets", { exact: true }).first().click();
    const fila = page.locator("tr", { hasText: "Ticket E2E con adjunto" }).first();
    await expect(fila).toBeVisible();

    // "Ver adjunto" descarga el archivo con el token y lo abre en una pestaña nueva
    const [respuesta, pestana] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/adjunto/")),
      page.waitForEvent("popup"),
      fila.getByText("Ver adjunto").click(),
    ]);
    expect(respuesta.status()).toBe(200);
    expect(respuesta.headers()["content-type"]).toContain("image/png");
    await pestana.waitForURL(/^blob:/);
  });

  test("el backend rechaza un tipo de archivo no permitido", async ({ page }) => {
    await loginAlumno(page);
    const token = await page.evaluate(() => localStorage.getItem("access_token"));
    const headers = { Authorization: `Bearer ${token}` };
    const api = "http://localhost:8000/api";
    const [area] = await (await page.request.get(`${api}/areas/`, { headers })).json();
    const [categoria] = await (await page.request.get(`${api}/categorias/`, { headers })).json();

    const respuesta = await page.request.post(`${api}/tickets/`, {
      headers,
      multipart: {
        titulo: "Adjunto no permitido",
        descripcion: "d",
        area_responsable: String(area.id),
        categoria: String(categoria.id),
        archivo_adjunto: {
          name: "script.html",
          mimeType: "text/html",
          buffer: Buffer.from("<script></script>"),
        },
      },
    });
    expect(respuesta.status()).toBe(400);
    expect(await respuesta.json()).toHaveProperty("archivo_adjunto");
  });
});
