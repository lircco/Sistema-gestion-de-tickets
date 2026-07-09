# UnrafTickets - Sistema de Gestión de Tickets

Plataforma institucional para la gestión de tickets de soporte técnico, diseñada para la UNRaf.

## Composición del Proyecto

- **Backend:** Django + Django REST Framework.
- **Frontend:** React + Vite + TanStack Router + MUI + Tailwind.

## Inicio Rápido con Docker

El proyecto está preparado para correr en contenedores Docker mediante Docker Compose.

### 1. Crear la red externa de Nginx
El archivo de Docker Compose requiere una red externa llamada `nginx-proxy` para la comunicación y el ruteo inverso. Créala antes de levantar los servicios:

```bash
docker network create nginx-proxy
```

### 2. Levantar el entorno completo
Para construir y levantar todos los servicios (Base de datos, Backend, Frontend y Adminer) en segundo plano:

```bash
docker compose build
docker compose up -d
```

---

## Desarrollo Local (Sin Docker)

Si prefieres correr los servicios localmente para desarrollo:

### Entorno virtual

El proyecto usa un único entorno virtual en la raíz: `.venv/`.

Si necesitás recrearlo, ejecutá desde la raíz:

```bash
python -m venv .venv
```

En Git Bash sobre Windows, activalo con:

```bash
source .venv/Scripts/activate
```

Luego instalá las dependencias del backend con:

```bash
.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
```

Para más detalles sobre la arquitectura, convenciones, ejecución de pruebas y comandos específicos, consulta el archivo [AGENTS.md](./AGENTS.md).
