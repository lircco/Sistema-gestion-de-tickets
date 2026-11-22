import { test, expect } from '@playwright/test';

test.describe('Flujo de Administrador', () => {
  test('debe poder loguearse, ver tickets y responder', async ({ page }) => {
    // 1. Navegar y Loguearse como Admin

    await page.goto('/');
    
    // Cambiar al tab de admin
    await page.locator('text=Admin').click();
    await page.waitForLoadState('networkidle');
    
    // El frontend para admin pide "Nombre de Usuario" sin @
    await page.getByPlaceholder('Ej. Pedro Gonzalez').fill('admin_e2e');
    await page.getByPlaceholder('••••••••').first().fill('password123');
    await page.locator('button[type="submit"]').click();

    // 2. Verificar que entró al Dashboard Global de Admin
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=Tickets Recientes')).toBeVisible();

    // 3. Verificar que exista un ticket reciente en la tabla
    const ticketRow = page.locator('tbody tr').first();
    await expect(ticketRow).toBeVisible();
    
    // 4. Hacer clic en el botón de "Ver Detalle" (Ojo al icono de ojo)
    await ticketRow.getByRole('button').click();

    // 5. Verificar que estamos en la vista de detalle
    await expect(page.locator('text=Historial de Mensajes')).toBeVisible();

    // 6. Enviar una respuesta
    await page.getByPlaceholder('Escribí tu respuesta o seguimiento aquí...').fill('Estamos trabajando en tu solicitud. Saludos.');
    await page.getByRole('button', { name: /Enviar Respuesta/i }).click();

    // 7. Verificar que la respuesta aparece en el historial
    await expect(page.locator('p', { hasText: 'Estamos trabajando en tu solicitud.' }).first()).toBeVisible();
  });

  test('staff no debe ver ni tener acceso a Base de Conocimiento', async ({ page }) => {
    await page.goto('/');
    
    // Cambiar al tab de staff
    await page.locator('text=Staff').click();
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Ej. Pedro Gonzalez').fill('staff_it');
    await page.getByPlaceholder('••••••••').first().fill('staff123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin/);
    // Verificar que Base de Conocimiento NO está en el menú de navegación de Staff
    await expect(page.locator('text=Base de Conocimiento')).not.toBeVisible();

    // Intentar navegar manualmente a la ruta /admin/kb
    await page.goto('/admin/kb');
    await expect(page.locator('text=Página no encontrada')).toBeVisible();
    await expect(page.locator('h4:has-text("Base de Conocimiento")')).not.toBeVisible();
  });

  test('supervisor no debe ver ni tener acceso a Base de Conocimiento', async ({ page }) => {
    await page.goto('/');
    
    // Cambiar al tab de admin/supervisor
    await page.locator('text=Admin').click();
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Ej. Pedro Gonzalez').fill('supervisor');
    await page.getByPlaceholder('••••••••').first().fill('UnrafSup2026!');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin/);
    // Verificar que Base de Conocimiento NO está en el menú de navegación de Supervisor
    await expect(page.locator('text=Base de Conocimiento')).not.toBeVisible();

    // Intentar navegar manualmente a la ruta /admin/kb
    await page.goto('/admin/kb');
    await expect(page.locator('text=Página no encontrada')).toBeVisible();
    await expect(page.locator('h4:has-text("Base de Conocimiento")')).not.toBeVisible();
  });
});
