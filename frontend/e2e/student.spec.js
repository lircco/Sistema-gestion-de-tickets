import { test, expect } from '@playwright/test';

test.describe('Flujo de Alumno', () => {
  test('debe poder loguearse y crear un ticket', async ({ page }) => {
    // 1. Navegar y Loguearse
    await page.goto('/');
    await page.getByPlaceholder('usuario@gmail.com').fill('alumno_e2e@test.com');
    await page.getByPlaceholder('••••••••').first().fill('password123');
    await page.locator('button[type="submit"]').click();

    // 2. Verificar que entró al Dashboard de Alumno
    await expect(page).toHaveURL(/\//);
    await expect(page.locator('text=Mis Tickets')).toBeVisible();

    // 3. Abrir modal de Nuevo Ticket
    await page.locator('text=Crear Nuevo Ticket').click();
    
    // 4. Completar Formulario
    await page.getByLabel(/Título/i).fill('Problema con el aula virtual');
    await page.getByLabel(/Área Responsable/i).click();
    await page.getByRole('option', { name: 'Soporte Técnico' }).click();
    
    await page.getByLabel(/Categoría/i).click();
    await page.getByRole('option', { name: 'Falla de Software' }).click();

    await page.getByLabel(/Descripción/i).fill('No puedo acceder a la materia de Programación.');
    
    // 5. Enviar Ticket
    await page.getByRole('button', { name: /Enviar Ticket/i }).click();

    // 6. Verificar que el modal se cierra y aparece en la tabla
    await expect(page.locator('text=Problema con el aula virtual')).toBeVisible();
    await expect(page.locator('text=ABIERTO').first()).toBeVisible();
  });
});
