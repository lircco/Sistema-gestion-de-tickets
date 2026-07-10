# Guía del Proyecto y del Agente (AGENTS.md)

Este documento explica la composición del proyecto, cómo operar en él y las reglas estrictas para los agentes que realicen modificaciones.

## Composición del Proyecto

El sistema es una plataforma de gestión de tickets dividida en dos partes principales:

1.  **Backend (Directorio `backend/`):**
    - **Framework:** Django con Django REST Framework (DRF).
    - **Base de Datos:** SQLite (desarrollo).
    - **Autenticación:** Session-based Auth de Django.
    - **Características:** Modelos para Áreas, Categorías, Usuarios y Tickets. Incluye envío de notificaciones por email y seguridad a nivel de fila (los estudiantes solo ven sus tickets).

2.  **Frontend (Directorio `frontend/`):**
    - **Framework:** React con Vite.
    - **Enrutado:** TanStack Router.
    - **UI:** Material UI (MUI) y Tailwind CSS.
    - **Gestión de Estado:** TanStack Query.

---

## Cómo Correr los Comandos

Para trabajar en el proyecto, utiliza los siguientes comandos (asegúrate de estar en el directorio correspondiente):

### 1. Ejecución con Docker Compose (Recomendado para Producción/Despliegue)

El stack completo puede ser levantado utilizando contenedores Docker.

1. **Crear la red externa de Nginx:**
   ```bash
   docker network create nginx-proxy
   ```
2. **Construir y levantar contenedores:**
   ```bash
   docker compose build
   docker compose up -d
   ```

### 2. Ejecución de Desarrollo Local

#### Backend

1.  **Activar entorno:** `.venv` en la raíz del proyecto.
    - Git Bash: `source .venv/Scripts/activate`.
    - PowerShell: `.\.venv\Scripts\Activate.ps1`.
2.  **Migraciones:** `python manage.py migrate`.
3.  **Servidor:** `python manage.py runserver`.

#### Frontend

1.  **Instalar dependencias:** `npm install`.
2.  **Servidor de desarrollo:** `npm run dev`.

---

## Cómo Correr los Tests

- **Backend:** Entra a `backend/` y corre `.\venv\Scripts\python.exe manage.py test api`.
- **Frontend:** Entra a `frontend/` y corre `powershell.exe -ExecutionPolicy Bypass -Command "npm run test"`.

---

## Reglas de Trabajo y Git (Mandatorio)

**IMPORTANTE:** Cada vez que modifiques o crees un archivo, debes realizar un `git add .` y un `git commit` antes de realizar cualquier otro cambio o continuar con la tarea.

### Formato de Commits

Todos los mensajes de commit deben seguir esta convención:

- `feat`: Una nueva característica para el usuario.
- `fix`: Arregla un bug que afecta al usuario.
- `perf`: Cambios que mejoran el rendimiento del sitio.
- `build`: Cambios en el sistema de build, tareas de despliegue o instalación.
- `ci`: Cambios en la integración continua.
- `docs`: Cambios en la documentación.
- `refactor`: Refactorización del código como cambios de nombre de variables o funciones.
- `style`: Cambios de formato, tabulaciones, espacios o puntos y coma, etc; no afectan al usuario.
- `test`: Añade tests o refactoriza uno existente.

Ejemplo: `feat: implementar filtrado de tickets por área`
Uso de la voz pasiva refleja en español
---

## Despliegue (Nginx + Producción)

Para desplegar en un entorno de producción con Nginx, sigue estos pasos:

### 1. Variables de Entorno

Configura las siguientes variables de entorno en el servidor:

- `DJANGO_SECRET_KEY`: Una clave aleatoria y segura.
- `DJANGO_DEBUG`: `False`.
- `DJANGO_ALLOWED_HOSTS`: Dominio o IP del servidor (ej: `misitio.com,1.2.3.4`).
- `CORS_ALLOWED_ORIGINS`: URL del frontend (si aplica).
- `CSRF_TRUSTED_ORIGINS`: URL del frontend.

### 2. Backend

1.  Recolectar archivos estáticos: `python manage.py collectstatic`.
2.  Ejecutar con un servidor WSGI como Gunicorn: `gunicorn config.wsgi:application`.

### 3. Frontend

1.  Construir el proyecto: `npm run build`.
2.  Los archivos generados en `frontend/dist` deben ser servidos por Nginx.

### 4. Nginx

Utiliza el archivo `nginx.conf.example` como base para configurar el servidor. Este archivo maneja:

- Servicio de archivos estáticos y media.
- Proxy inverso para la API de Django.
- Soporte para Single Page Application (SPA) con React.
