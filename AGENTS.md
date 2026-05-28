# Guía de Pruebas (AGENTS.md)

Este documento detalla cómo ejecutar y mantener las pruebas para el sistema de tickets, tanto en el backend como en el frontend.

## Estructura de Pruebas

### Backend (Django)
- **Framework:** Django Test Framework (unittest).
- **Cobertura:** `coverage.py`.
- **Ubicación:** `backend/api/tests.py`.
- **Comandos:**
  - Ejecutar tests: `python manage.py test api`
  - Ejecutar con cobertura: `coverage run manage.py test api`
  - Ver reporte: `coverage report`

### Frontend (React/Vite)
- **Framework:** Vitest + React Testing Library.
- **Cobertura:** `@vitest/coverage-v8`.
- **Ubicación:** `frontend/src/**/*.test.{js,jsx}`.
- **Comandos:**
  - Ejecutar tests: `npm test`
  - Ejecutar con cobertura: `npm run test:coverage`

## Ejecución Automatizada

Se ha proporcionado un script de Bash `run_tests.sh` en la raíz del proyecto para ejecutar todas las pruebas secuencialmente:

```bash
./run_tests.sh
```

**Nota para entornos Windows:** Si tienes problemas de permisos con `npm`, el script utiliza `powershell.exe -ExecutionPolicy Bypass` para asegurar la ejecución correcta.

## Notas de Implementación (Peculiaridades)

- **Ejecución de NPM:** En algunos sistemas Windows, la ejecución de scripts de PowerShell está deshabilitada. Si `npm test` falla, usa:
  `powershell.exe -ExecutionPolicy Bypass -Command "npm test"`
- **Importaciones en Backend:** Para evitar errores de `ImportError` al correr `manage.py test`, se recomienda usar importaciones absolutas (ej. `from api.models import ...`) en los archivos de prueba.
- **Archivos Ignorados:** Las pruebas del frontend en `src/lib/` podrían estar ignoradas por el `.gitignore` global si existe una regla para `lib/`. Se usó `git add -f` para incluirlas.

## Registro de Cambios (Commits)
Al modificar o crear un archivo haz un add . y un commit antes de seguir.

1. `feat: configurar vitest y scripts de pruebas en el frontend`
2. `test: agregar pruebas unitarias para la utilidad cn`
3. `feat: agregar coverage a las dependencias del backend`
4. `test: agregar pruebas de modelos y api para el backend con cobertura`
5. `ci: agregar script run_tests.sh para ejecución unificada de pruebas`
