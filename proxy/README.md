# Nginx Proxy Reverso

Este directorio contiene la configuración y la definición de Docker Compose para el contenedor de Nginx que actúa como **Proxy Reverso** central del sistema.

---

## 🏗️ Arquitectura y Puertos

El Proxy Nginx se encarga de recibir las peticiones entrantes en los puertos expuestos y redirigirlas a los servicios correspondientes dentro de la red Docker (`nginx-proxy`):

| Puerto Host | Servicio Destino | Contenedor Destino | Descripción |
| :--- | :--- | :--- | :--- |
| **80** | Frontend (React / Vite) | `app2-frontend:80` | Aplicación web principal |
| **8000** | Backend (Django REST Framework) | `app2-backend:8000` | API REST |
| **8081** | Adminer | `app2-adminer:8080` | Gestor Web de Base de Datos PostgreSQL |

---

## 🚀 Instrucciones de Despliegue

### 1. Iniciar el Proxy Nginx

Desde la raíz del proyecto o entrando a la carpeta `proxy/`:

```bash
cd proxy
docker compose up -d
```

> **Nota:** Esto creará automáticamente la red de Docker bridge llamada `nginx-proxy` e iniciará el contenedor `nginx-proxy`.

---

### 2. Iniciar el Stack Principal (Backend, Frontend, Adminer y Base de Datos)

Regresa a la raíz del repositorio y levanta los servicios:

```bash
cd ..
docker compose up -d --build
```

---

## 📁 Archivos del Módulo

* **`default.conf`**: Configuración de Nginx montada como volumen en `/etc/nginx/conf.d/default.conf`. Contiene las reglas `proxy_pass` y resolución de nombres vía DNS de Docker (`127.0.0.11`).
* **`docker-compose.yml`**: Configuración de Docker Compose para desplegar el contenedor `nginx-proxy` expuesto en los puertos 80, 8000 y 8081.

---

## 🔍 Comandos de Verificación y Diagnóstico

* **Ver estado de los contenedores:**
  ```bash
  docker compose ps
  ```

* **Ver logs del Proxy:**
  ```bash
  docker compose -f proxy/docker-compose.yml logs -f
  ```

* **Probar respuestas con `curl`:**
  ```bash
  curl -I http://localhost:80       # Frontend
  curl -I http://localhost:8000/api/ # Backend API
  curl -I http://localhost:8081      # Adminer DB Admin
  ```
