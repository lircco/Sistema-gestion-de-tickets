# Documentación del Módulo de Modelos (Backend)

> **Nota (octubre 2026):** este documento se convirtió del `.docx` original sin cambiar su contenido. Algunas partes describen el diseño inicial y difieren del código actual (`backend/api/models.py`):
>
> - Los estados del ticket son `ABIERTO`, `EN_PROGRESO` y `CERRADO` (`Ticket.Estados`), y además hay prioridad (`BAJA`, `MEDIA`, `ALTA`).
> - Las fechas se llaman `creado_el` y `actualizado_el`.
> - Los roles no usan Grupos de Django: el modelo `Usuario` (que extiende `AbstractUser`) tiene un campo `rol` (`ESTUDIANTE`, `STAFF`, `SUPERVISOR`) y un `area` para el personal.
> - Las respuestas se agregan con `POST /api/tickets/<id>/responder/`.
> - Existe además el modelo `RegistroEmail`, con el historial de notificaciones enviadas.

## 1. Introducción

El backend de la aplicación, desarrollado en Django, utiliza un sistema de Mapeo Objeto-Relacional (ORM) para gestionar la persistencia de los datos. El diseño de la base de datos se centra en la trazabilidad de las consultas de los estudiantes y la eficiencia en la gestión por parte de los administradores.

## 2. Diagrama de Entidad-Relación

La arquitectura se basa en una estructura jerárquica donde los tickets se agrupan por categorías y mantienen un historial de respuestas vinculadas. Esta normalización y diseño relacional es fundamental para garantizar la integridad referencial en sistemas de información académica (Chen, 2023).

## 3. Especificación de Modelos

### 3.1 Modelo Categoría

Este modelo permite clasificar las consultas para facilitar su asignación a los departamentos correspondientes.

- **Campos principales:**

  - nombre: Identificador único de la categoría (ej. "Inscripciones", "Becas", "Exámenes").

  - descripción: Información adicional sobre qué tipo de dudas abarca la categoría.

### 3.2 Modelo Área (Estructura Organizativa)

Para gestionar la derivación de consultas, se implementó la entidad Area. Este modelo representa los distintos departamentos de la institución (por ejemplo, Bienestar Universitario, Alumnado, Deportes). Funciona como un agrupador principal, permitiendo que los tickets sean filtrados y atendidos exclusivamente por el personal designado a dicha área, optimizando así el flujo de trabajo.

### 3.3 Modelo Ticket (Entidad Central)

Es el núcleo del sistema. Almacena la información del remitente y el estado actual del proceso de consulta.

- **Relacionalidad de Autoría (creado_por):** Se abandonó el registro de datos planos (nombre, DNI) en favor de una relación de clave foránea (ForeignKey) con el modelo de Usuarios. Esto exige que el estudiante esté autenticado en el sistema, garantizando la trazabilidad histórica de todas sus consultas y permitiéndole visualizar el estado de sus tickets previos.

- **Doble Clasificación (area_responsable y categoría):** Cada ticket se vincula obligatoriamente a un Área específica para su resolución, y secundariamente a una Categoría temática. Esta estructura bidimensional permite escalar el sistema en el futuro (ej. el área "Alumnado" puede tener las categorías "Exámenes" o "Inscripciones").

- **Gestión de Archivos:** El campo archivo_adjunto utiliza FileField, lo que permite la carga versátil de imágenes y documentos PDF, proporcionando contexto visual a la duda planteada. Los archivos se almacenan en el servidor de medios (MEDIA_ROOT), manteniendo la base de datos ligera y eficiente, siguiendo las mejores prácticas oficiales de almacenamiento estructurado para no comprometer el rendimiento general (Django Software Foundation, s.f.).

- **Lógica de Estados:** Se implementó una tupla de opciones (ESTADOS_TICKET) que limita el flujo de trabajo a tres estados controlados: *Pendiente*, *En Revisión* y *Resuelto*. Esto garantiza la integridad de los datos y facilita la generación de métricas de desempeño.

- **Trazabilidad Temporal:** Los campos fecha_creacion y fecha_actualizacion utilizan metadatos automáticos de Django para registrar la cronología exacta de la interacción.

### 3.4 Modelo Respuesta

Permite el intercambio de mensajes entre el administrador y el estudiante dentro del mismo hilo del ticket.

- **Relación:** Mantiene una relación de clave foránea (ForeignKey) con el Ticket, permitiendo que un solo ticket tenga múltiples respuestas (relación uno a muchos).

### 3.5 Arquitectura de Roles y Permisos (RBAC)

Si bien el diagrama de entidades define tres actores principales (Usuario, Área Responsable y Supervisor), a nivel de base de datos se optó por un enfoque integrado utilizando el sistema de Autenticación de Django (django.contrib.auth). En lugar de crear tablas separadas para cada rol, todos son instancias del modelo User, diferenciados mediante el sistema de Grupos y Permisos. Esta metodología sigue el modelo estándar de la industria conocido como Control de Acceso Basado en Roles (RBAC), el cual minimiza errores, vulnerabilidades y simplifica la administración del sistema (Sandhu et al., 1996).

- **Usuarios (Estudiantes):** Poseen permisos estándar. Solo pueden crear tickets y aplicar operaciones de lectura (GET) exclusivamente sobre los tickets donde figuren en el campo creado_por.

- **Área Responsable:** Se configuran como usuarios *Staff* agrupados por departamento. Tienen permisos de actualización (UPDATE) para cambiar el estado, responder o derivar el ticket modificando el campo area_responsable.

- **Supervisores:** Poseen privilegios administrativos globales. Son los únicos con capacidad de ejecutar operaciones de borrado (DELETE) sobre la entidad Ticket y poseen acceso de lectura sin restricciones de área.

## 4. Arquitectura de Rutas y Navegación (API Endpoints)

La exposición de los modelos se realiza mediante una interfaz de programación de aplicaciones (API) diseñada bajo el estilo arquitectónico REST. Las rutas se han estructurado de forma jerárquica y semántica, facilitando la integración con el frontend y asegurando la escalabilidad del sistema.

### 4.1 Estrategia de Enrutamiento

Se implementaron URLs amigables (slugs y IDs numéricos) que permiten una navegación intuitiva. La seguridad de estas rutas está vinculada directamente a la Matriz de Roles (RBAC) definida en la sección anterior, donde cada endpoint valida el token de sesión y los permisos del usuario antes de procesar la solicitud.

### 4.2 Tabla de Endpoints Principales

| **Recurso**    | **Método** | **Endpoint**                    | **Descripción**                    |
|----------------|------------|---------------------------------|------------------------------------|
| **Tickets**    | GET        | /api/tickets/                   | Lista tickets (filtrados por rol). |
|                | POST       | /api/tickets/                   | Creación de una nueva consulta.    |
|                | GET        | /api/tickets/\<id\>/            | Detalle de un ticket específico.   |
|                | PATCH      | /api/tickets/\<id\>/            | Actualización de estado o área.    |
| **Respuestas** | POST       | /api/tickets/\<id\>/respuestas/ | Agregar mensaje al hilo.           |
| **Catálogos**  | GET        | /api/categorias/                | Listado de categorías disponibles. |
|                | GET        | /api/areas/                     | Listado de áreas responsables.     |

### 4.3 Implementación en Django (urls.py)

A continuación, se detalla la configuración técnica de las rutas utilizando los controladores (Views) del sistema:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, CategoriaViewSet, AreaViewSet

# Uso de Routers para consistencia en las rutas REST
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'categorias', CategoriaViewSet)
router.register(r'areas', AreaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    # Endpoint adicional para respuestas dentro de un ticket
    path('api/tickets/<int:ticket_id>/respuestas/',
         TicketViewSet.as_view({'post': 'agregar_respuesta'}),
         name='ticket-respuestas'),
]
```

## 5. Consideraciones de Seguridad y Validación

Aunque el modelo define la estructura, la integridad de la información se refuerza mediante:

- **Validación de Identidad:** El uso del correo electrónico para notificaciones de estado.

- **Restricción de Acceso:** La relación con el modelo User de Django asegura que solo usuarios con permisos de staff (administradores) puedan ser asignados para responder los tickets.

## 6. Matriz de Roles y Permisos (RBAC)

La arquitectura soporta tres niveles de acceso basados en la tabla de acciones definida para el proyecto, implementando de manera práctica los lineamientos corporativos de RBAC (IBM, 2024):

| **Actor**                | **Acciones Permitidas**                                                                   |
|--------------------------|-------------------------------------------------------------------------------------------|
| **Usuario (Estudiante)** | Crear tickets, consultar estado de sus tickets personales.                                |
| **Área Responsable**     | Consultar tickets asignados al área, responder consultas, derivar a otras áreas.          |
| **Supervisor**           | Ver todos los tickets existentes, actualizar estados de forma global, eliminar registros. |

## 7. Conclusión Técnica

La estructura de modelos propuesta garantiza una base sólida para el desarrollo de las vistas y URLs. La separación de responsabilidades entre Áreas y Usuarios asegura que el sistema sea escalable y capaz de manejar el flujo de consultas de toda la comunidad universitaria.

## 8. Referencias Bibliográficas

- Chen, W. (2023). *Database Design and Implementation*. Arkansas Tech University. Online Research Commons.

- Django Software Foundation. (s.f.). *Managing files y FileField documentation*. Recuperado de la documentación oficial de Django.

- IBM. (2024). *Role-Based Access Control (RBAC) Implementation Guide*.

- International Journal of Advanced Research in Science, Communication and Technology (IJARSCT). (2024). *Comprehensive Research on Python, Django, and the Power of Web Development Libraries*.

- Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). *Role-Based Access Control Models*. IEEE Computer, 29(2), 38-47.
