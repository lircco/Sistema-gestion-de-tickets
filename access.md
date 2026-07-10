Guía de Acceso Local (Windows)

Esta guía explica cómo acceder localmente al frontend y al backend de la aplicación utilizando el proxy inverso `nginx-proxy`.
 
## Requisitos Previos

1.  **Contenedor de `nginx-proxy` activo:**

    El contenedor `nginx-proxy` ya se encuentra corriendo y escuchando en los puertos `80` y `443` en tu host Docker. Si en algún momento necesitas volver a levantarlo, puedes usar el siguiente comando:

```bash
docker run -d -p 80:80 -p 443:443 --name nginx-proxy --network nginx-proxy -v /var/run/docker.sock:/tmp/docker.sock:ro nginxproxy/nginx-proxy
```

2.  **Servicios de la Aplicación Levantados:**

    Los contenedores de la aplicación deben estar en ejecución:

Crear las imágenes: `docker compose build`

Levantar los contenedores: `docker-compose up -d`

---

## Configuración del Archivo `hosts` en Windows

Para que el navegador pueda resolver los dominios virtuales del proyecto (`app2.academia.ar` y `api.app2.academia.ar`) hacia tu máquina local (`127.0.0.1`), debes configurar el archivo de hosts de Windows:

1.  Abre el menú de inicio, busca **Bloc de notas**.
  
2.  Haz clic derecho y selecciona **Ejecutar como administrador**.
  
3.  Abre el archivo localizado en:
  

    `C:\Windows\System32\drivers\etc\hosts`

4.  Agrega las siguientes líneas al final del archivo:

    127.0.0.1 app2.academia.ar

    127.0.0.1 api.app2.academia.ar

5.  Guarda el archivo.

---

## Direcciones de Acceso

Una vez configurado el archivo `hosts`, puedes acceder a los servicios directamente desde tu navegador web:

-   **Frontend (React/Vite):** [http://app2.academia.ar](http://app2.academia.ar)
  
-   **Backend (Django REST Framework API):** [http://api.app2.academia.ar](http://api.app2.academia.ar)
  
-   **Adminer (Gestor de Base de Datos):** [http://localhost:8080](http://localhost:8080) (este servicio expone su puerto directamente).