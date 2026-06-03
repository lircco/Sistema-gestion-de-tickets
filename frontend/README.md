# Sistema de Gestión de Tickets - UNRaf

Este es el frontend del Sistema de Gestión de Tickets de la UNRaf, desarrollado con React y TanStack Start.

## Tecnologías Principales
- **Framework:** React + TanStack Start (SSR)
- **Ruteo:** TanStack Router
- **Estilos:** Tailwind CSS + Material UI (MUI)
- **Componentes:** Shadcn UI
- **Estado/Queries:** TanStack Query

## Configuración
El frontend está configurado para comunicarse con un backend Django en `http://localhost:8000` mediante un proxy en Vite.

## Desarrollo
Para iniciar el entorno de desarrollo:
```bash
npm install
npm run dev
```

El sistema generará automáticamente el árbol de rutas en `src/routeTree.gen.js`.

## Cleanup Note
Este proyecto fue limpiado para eliminar configuraciones específicas de Lovable y TypeScript, manteniendo un flujo de trabajo basado puramente en JSX/JS.
