# UnrafTickets — Sistema de Gestión de Tickets

> Plataforma institucional para la gestión de tickets de soporte técnico de la **Universidad Nacional de Rafaela (UNRaf)**.

---

## 📋 Descripción

UnrafTickets es una aplicación web full-stack que permite a los alumnos de la UNRaf crear y hacer seguimiento de tickets de soporte técnico y administrativo. El personal de soporte puede gestionar, responder y cerrar los tickets desde un panel de administración dedicado.

---

## 🛠️ Tecnologías utilizadas

### Backend
- **Python 3.x** + **Django** + **Django REST Framework (DRF)**
- **PostgreSQL** (producción) / configuración via variables de entorno
- **Autenticación:** JWT (JSON Web Tokens) con `djangorestframework-simplejwt`
- **Envío de emails:** SMTP

### Frontend
- **React 18** + **Vite**
- **TanStack Router** (enrutado)
- **Material UI (MUI)** + **Tailwind CSS** (estilos)
- **TanStack Query** (gestión de estado del servidor)

### Infraestructura
- **Docker** + **Docker Compose**
- **Nginx** (reverse proxy)

---

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado)

**Requisitos:** Docker y Docker Compose instalados.

```bash
# 1. Crear la red externa requerida por Nginx
docker network create nginx-proxy

# 2. Construir y levantar todos los servicios
docker compose build
docker compose up -d
```

#### Configurar el archivo `hosts` (acceso local)

Agregá las siguientes líneas al archivo `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 app2.academia.ar
127.0.0.1 api.app2.academia.ar
```

#### URLs de acceso

| Servicio | URL |
|----------|-----|
| Frontend (React) | http://app2.academia.ar |
| API (Django) | http://api.app2.academia.ar |
| Adminer (DB) | http://localhost:8080 |

---

### Opción 2: Desarrollo Local (sin Docker)

#### Backend

```bash
# 1. Crear y activar el entorno virtual (desde la raíz del proyecto)
python -m venv .venv

# Git Bash / Linux / macOS:
source .venv/Scripts/activate

# PowerShell:
.\.venv\Scripts\Activate.ps1

# 2. Instalar dependencias
pip install -r backend/requirements.txt

# 3. Aplicar migraciones
cd backend
python manage.py migrate

# 4. Iniciar el servidor
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Estructura del Proyecto

```
ticket-project-ic-unraf/
├── backend/                  # API Django REST Framework
│   ├── api/                  # Aplicación principal
│   │   ├── models.py         # Modelos: Usuario, Ticket, Area, Categoria, Respuesta
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── views.py          # ViewSets y APIViews
│   │   ├── signals.py        # Señales (notificaciones por email, roles)
│   │   └── tests.py          # Tests unitarios y de integración
│   ├── config/               # Configuración de Django
│   │   ├── settings.py
│   │   └── urls.py
│   └── manage.py
├── frontend/                 # Aplicación React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/        # Componentes del dashboard de administración
│   │   │   ├── user/         # Componentes del dashboard de alumnos
│   │   │   ├── shared/       # Componentes reutilizables
│   │   │   ├── AppShell.jsx  # Shell principal con navbar y sidebar
│   │   │   └── LoginScreen.jsx
│   │   └── lib/
│   │       └── api.js        # Cliente HTTP hacia la API
│   └── vite.config.js
├── docker-compose.yml
├── README.md
├── AGENTS.md                 # Guía para agentes y contribuyentes
└── access.md                 # Guía de acceso local con Docker
```

---

## 🧪 Cómo correr los tests

### Backend

Los tests del backend requieren la base de datos PostgreSQL (correr Docker primero):

```bash
# Opción 1: Dentro del contenedor Docker
docker compose exec backend python manage.py test api

# Opción 2: Local (requiere PostgreSQL corriendo)
cd backend
python manage.py test api
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 👥 Equipo

<!-- COMPLETAR: Agregar los integrantes del grupo con nombre, legajo y rol -->

| Nombre | Legajo | Rol |
|--------|--------|-----|
| <!-- Nombre --> | <!-- Legajo --> | <!-- Rol --> |
| <!-- Nombre --> | <!-- Legajo --> | <!-- Rol --> |
| <!-- Nombre --> | <!-- Legajo --> | <!-- Rol --> |

---

## 📄 Licencia

Proyecto académico — Universidad Nacional de Rafaela (UNRaf). Todos los derechos reservados.
