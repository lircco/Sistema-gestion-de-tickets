from rest_framework import permissions

# Campos del ticket que solo puede modificar el personal autorizado
CAMPOS_GESTION = {'estado', 'prioridad', 'area_responsable'}


class PuedeGestionarTicket(permissions.BasePermission):
    """
    Controla quién puede modificar los campos de gestión de un ticket
    (estado, prioridad, area_responsable):
    - SUPERVISOR (o is_staff de Django): cualquier ticket.
    - STAFF: solo tickets de su propia área (STAFF de otra área recibe 403 acá).
    - ESTUDIANTE: no se bloquea con 403 en este permiso; TicketSerializer.get_fields()
      ya marca esos campos como read_only para ESTUDIANTE, así que el PATCH
      responde 200 y los ignora en silencio.
    Además, solo un SUPERVISOR (o superusuario) puede eliminar tickets.
    El resto de las operaciones queda como antes (la visibilidad ya viene
    filtrada por get_queryset()).
    """
    message = 'No tenés permiso para gestionar este ticket.'

    def has_permission(self, request, view):
        if request.method == 'DELETE':
            user = request.user
            if user.is_superuser or getattr(user, 'rol', None) == 'SUPERVISOR':
                return True
            self.message = 'Solo un supervisor puede eliminar tickets.'
            return False
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method == 'DELETE':
            if user.is_superuser or getattr(user, 'rol', None) == 'SUPERVISOR':
                return True
            self.message = 'Solo un supervisor puede eliminar tickets.'
            return False

        # Solo aplica a PATCH/PUT que toquen campos de gestión
        if request.method not in ('PATCH', 'PUT'):
            return True
        if not CAMPOS_GESTION & set(request.data.keys()):
            return True

        rol = getattr(user, 'rol', None)
        if rol != 'STAFF':
            return True
        return user.area_id is not None and user.area_id == obj.area_responsable_id
