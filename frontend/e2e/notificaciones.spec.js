import { test, expect } from "@playwright/test";
import { crearTicket, loginAlumno, loginStaff } from "./helpers";

const campana = (page) =>
  page.locator("button", { has: page.getByTestId("NotificationsNoneOutlinedIcon") });

test.describe("Notificaciones in-app", () => {
  test("al crear un ticket, avisa al alumno y al staff del área", async ({ page, browser }) => {
    await loginAlumno(page);
    await crearTicket(page, "Ticket E2E para notificaciones");

    // El alumno ve el aviso de alta y puede marcar todo como leído
    await campana(page).click();
    await expect(page.getByText("Tu ticket ha sido generado exitosamente").first()).toBeVisible();
    await page.getByRole("button", { name: "Limpiar todo" }).click();
    await campana(page).click();
    await expect(page.getByRole("button", { name: "Limpiar todo" })).toHaveCount(0);

    // El staff del área recibe el aviso del ticket nuevo
    const contextoStaff = await browser.newContext();
    const paginaStaff = await contextoStaff.newPage();
    await loginStaff(paginaStaff);
    await campana(paginaStaff).click();
    await expect(
      paginaStaff.getByText(/asignado a tu área: Ticket E2E para notificaciones/).first(),
    ).toBeVisible();
    await contextoStaff.close();
  });
});
