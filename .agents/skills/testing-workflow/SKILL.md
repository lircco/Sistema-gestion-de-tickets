---
name: testing-workflow
description: Instrucciones detalladas sobre cómo ejecutar las pruebas (Unitarias y E2E) tanto del frontend como del backend, y cómo medir la cobertura del código. Utiliza esta skill siempre que debas correr pruebas para validar cambios o medir la cobertura del proyecto.
---

# Flujo de Pruebas (Testing Workflow)

El proyecto cuenta con múltiples niveles de testing. A continuación, se detallan los comandos y directivas para ejecutar las pruebas correctamente en cada área.

## 1. Backend (Django REST Framework)

El backend utiliza el sistema de pruebas integrado de Django y la herramienta `coverage` para medir qué porcentaje del código está siendo testeado.

- **Activar el entorno virtual:** 
  Asegúrate de tener el entorno activado antes de correr pruebas (`.venv/Scripts/Activate.ps1`).
- **Comando Básico:** `python manage.py test api`
- **Comando con Cobertura (Recomendado):**
  Para probar y generar el reporte de cobertura:
  ```powershell
  $env:DATABASE_URL="sqlite:///db.sqlite3"
  coverage run manage.py test api
  coverage report
  ```
  *(Nota: Para obtener un reporte en formato XML para GitHub Actions, se debe ejecutar `coverage xml` posteriormente).*

---

## 2. Frontend Unit & Integration (Vitest)

El frontend usa Vitest para pruebas unitarias de componentes, hooks y utilidades.

- **Comando Básico:** `npm run test` (desde la carpeta `frontend/`).
- **Comando con Cobertura:** `npm run test:coverage`
  Esto generará un reporte detallado en consola sobre el porcentaje de líneas y sentencias cubiertas, y guardará los resultados para los pipelines CI.

---

## 3. Frontend End-to-End (Playwright)

Para probar la plataforma completa (navegador + frontend + backend), se utiliza Playwright.

- **Pre-requisito importante:** La base de datos debe ser preparada (seeded) antes de ejecutar las pruebas E2E y el servidor Django local debe estar ejecutándose o Playwright lo levantará automáticamente si el `webServer` en `playwright.config.js` lo permite.
- **Preparar datos E2E:** 
  ```powershell
  # (Desde backend)
  python manage.py seed_e2e_data
  ```
- **Comando para Ejecutar E2E:** 
  ```powershell
  # (Desde frontend)
  npx playwright test
  ```
- *(Nota: Si faltan los navegadores de Playwright en el entorno, instala con `npx playwright install --with-deps chromium`).*
