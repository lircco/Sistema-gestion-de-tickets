import { test, expect } from '@playwright/test';

test.describe('Flujo de Administrador', () => {
  test('debe poder loguearse, ver tickets y responder', async ({ page }) => {
    // 1. Navegar y Loguearse como Admin

    await page.goto('/');
    
    // Cambiar al tab de admin
    await page.locator('text=Soy Administrador').click();
    
    // El frontend para admin pide "Nombre de Usuario" sin @
    await page.getByPlaceholder('Ej. Pedro Gonzalez').fill('admin_e2e');
    await page.getByPlaceholder('••••••••').first().fill('password123');
    await page.locator('button[type="submit"]').click();

    // 2. Verificar que entró al Dashboard Global de Admin
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=Tickets Recientes')).toBeVisible();

    // 3. Verificar que exista el ticket "Ticket de Prueba Global" creado por el seeder
    const ticketRow = page.locator('tr', { hasText: 'Ticket de Prueba Global' });
    await expect(ticketRow).toBeVisible();
    
    // 4. Hacer clic en el botón de "Ver Detalle" (Ojo al icono de ojo)
    // Asumimos que la fila es clickeable o tiene un botón con aria-label "Ver detalle" o similar.
    // En este caso, buscaremos el botón dentro de la fila:
    await ticketRow.getByRole('button').click();

    // 5. Verificar que estamos en la vista de detalle
    await expect(page.locator('text=Línea de Tiempo')).toBeVisible();

    // 6. Enviar una respuesta
    await page.getByPlaceholder('Escribí tu respuesta o seguimiento aquí...').fill('Estamos trabajando en tu solicitud. Saludos.');
    await page.getByRole('button', { name: /Enviar Respuesta/i }).click();

    // 7. Verificar que la respuesta aparece en el historial
    await expect(page.locator('text=Estamos trabajando en tu solicitud.')).toBeVisible();
  });
});
