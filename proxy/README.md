# Caddy Proxy Reverso

Este directorio contiene la configuración y la definición de Docker Compose para el contenedor de **Caddy** que actúa como **Proxy Reverso** central del sistema con **HTTPS automático (TLS)**.

---

## 🏗️ Arquitectura y Puertos

Caddy se encarga de recibir las peticiones entrantes en los puertos expuestos y redirigirlas a los servicios correspondientes dentro de la red Docker (`nginx-proxy`):

| Puerto Host | Servicio Destino | Contenedor Destino | Descripción |
| :--- | :--- | :--- | :--- |
| **80** | Frontend / Redirect HTTPS | `app2-frontend:80` | HTTP plano (o redirección a HTTPS en dominios) |
| **443** | Frontend / API (HTTPS) | `app2-frontend:80` / `app2-backend:8000` | HTTPS con certificados Let's Encrypt automáticos |
| **8000** | Backend (Django REST Framework) | `app2-backend:8000` | API REST directa |
| **8081** | Adminer | `app2-adminer:8080` | Gestor Web de Base de Datos PostgreSQL |

---

## 🔒 HTTPS Automático y Compatibilidad con Localhost

Caddy se adapta al entorno automáticamente a través de las variables en el `.env`:

* **En desarrollo local (localhost):**  
  Si no se configuran dominios (`DOMAIN_FRONTEND` vacío o no definido), Caddy levanta en `http://localhost` por HTTP sin emitir certificados ni arrojar errores.
* **En producción / Máquina Virtual con dominio:**  
  Si configuras `DOMAIN_FRONTEND=tudominio.com` y `DOMAIN_BACKEND=api.tudominio.com`, Caddy solicita, instala y renueva automáticamente certificados válidos de Let's Encrypt para el puerto 443, y redirige el tráfico HTTP (80) a HTTPS (443).
* **Acceso directo por IP:**  
  Si accedes directamente por la IP pública (ej: `http://34.28.10.146`), Caddy responde por HTTP plano sin exigir certificados.

---

## 🚀 Instrucciones de Despliegue

### 1. Iniciar el Proxy Caddy

Desde la raíz del proyecto o entrando a la carpeta `proxy/`:

```bash
cd proxy
docker compose up -d
cd ..
```

> **Nota:** Esto creará automáticamente la red de Docker bridge llamada `nginx-proxy` e iniciará el contenedor `caddy-proxy`.

---

### 2. Iniciar el Stack Principal (Backend, Frontend, Adminer y Base de Datos)

Regresa a la raíz del repositorio y levanta los servicios:

```bash
docker compose up -d --build
```

---

## 📁 Archivos del Módulo

* **`Caddyfile`**: Configuración de Caddy con reglas de `reverse_proxy`, límites de tamaño de archivo (`request_body`) y soporte para dominios públicos con HTTPS o localhost.
* **`docker-compose.yml`**: Configuración de Docker Compose para desplegar el contenedor `caddy-proxy` expuesto en los puertos 80, 443, 8000 y 8081 con volúmenes persistentes para certificados (`caddy_data` y `caddy_config`).

---

## 🔍 Comandos de Verificación y Diagnóstico

* **Ver estado de los contenedores:**
  ```bash
  docker compose ps
  ```

* **Ver logs de Caddy:**
  ```bash
  docker compose -f proxy/docker-compose.yml logs -f
  ```

* **Probar respuestas con `curl`:**
  ```bash
  curl -I http://localhost:80        # Frontend
  curl -I http://localhost:8000/api/ # Backend API
  curl -I http://localhost:8081       # Adminer DB Admin
  ```
