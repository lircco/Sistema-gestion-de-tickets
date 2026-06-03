# UnrafTickets - Sistema de Gestión de Tickets

Plataforma institucional para la gestión de tickets de soporte técnico, diseñada para la UNRaf.

## Composición del Proyecto

- **Backend:** Django + Django REST Framework.
- **Frontend:** React + Vite + TanStack Router + MUI + Tailwind.

## Inicio Rápido

Para levantar el entorno de desarrollo completo (Backend y Frontend) con un solo comando, utiliza:

```bash
./run_dev.sh
```

Esto iniciará el servidor de Django en `http://127.0.0.1:8000` y el de Vite en `http://localhost:5173`.

---

## Otros Comandos

### Ejecución de Pruebas
Para correr todos los tests del sistema:
```bash
./run_tests.sh
```

Para más detalles sobre la arquitectura, convenciones y comandos específicos, consulta el archivo [AGENTS.md](./AGENTS.md).
