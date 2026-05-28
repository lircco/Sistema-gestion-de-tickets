# Guía del Proyecto y del Agente (AGENTS.md)

Este documento explica la composición del proyecto, cómo operar en él y las reglas estrictas para los agentes que realicen modificaciones.

## Composición del Proyecto

El sistema es una plataforma de gestión de tickets dividida en dos partes principales:

1.  **Backend (Directorio `backend/`):**
    *   **Framework:** Django con Django REST Framework (DRF).
    *   **Base de Datos:** SQLite (desarrollo).
    *   **Autenticación:** Session-based Auth de Django.
    *   **Características:** Modelos para Áreas, Categorías, Usuarios y Tickets. Incluye envío de notificaciones por email y seguridad a nivel de fila (los estudiantes solo ven sus tickets).

2.  **Frontend (Directorio `frontend/`):**
    *   **Framework:** React con Vite.
    *   **Enrutado:** TanStack Router.
    *   **UI:** Material UI (MUI) y Tailwind CSS.
    *   **Gestión de Estado:** TanStack Query.

---

## Cómo Correr los Comandos

Para trabajar en el proyecto, utiliza los siguientes comandos (asegúrate de estar en el directorio correspondiente):

### Backend
1.  **Activar entorno:** `.\venv\Scripts\activate` (Windows).
2.  **Migraciones:** `python manage.py migrate`.
3.  **Servidor:** `python manage.py runserver`.

### Frontend
1.  **Instalar dependencias:** `npm install`.
2.  **Servidor de desarrollo:** `npm run dev`.

---

## Cómo Correr los Tests

Existen dos formas de ejecutar las pruebas:

### 1. Ejecución Unificada (Recomendado)
Desde la raíz del proyecto, ejecuta el script automatizado:
```bash
./run_tests.sh
```

### 2. Ejecución Individual
*   **Backend:** Entra a `backend/` y corre `.\venv\Scripts\python.exe manage.py test api`.
*   **Frontend:** Entra a `frontend/` y corre `powershell.exe -ExecutionPolicy Bypass -Command "npm run test"`.

---

## Reglas de Trabajo y Git (Mandatorio)

**IMPORTANTE:** Cada vez que modifiques o crees un archivo, debes realizar un `git add .` y un `git commit` antes de realizar cualquier otro cambio o continuar con la tarea.

### Formato de Commits
Todos los mensajes de commit deben seguir esta convención:

*   `feat`: Una nueva característica para el usuario.
*   `fix`: Arregla un bug que afecta al usuario.
*   `perf`: Cambios que mejoran el rendimiento del sitio.
*   `build`: Cambios en el sistema de build, tareas de despliegue o instalación.
*   `ci`: Cambios en la integración continua.
*   `docs`: Cambios en la documentación.
*   `refactor`: Refactorización del código como cambios de nombre de variables o funciones.
*   `style`: Cambios de formato, tabulaciones, espacios o puntos y coma, etc; no afectan al usuario.
*   `test`: Añade tests o refactoriza uno existente.

Ejemplo: `feat: implementar filtrado de tickets por área`
