from rest_framework import permissions

# Campos del ticket que solo puede modificar el personal autorizado
CAMPOS_GESTION = {'estado', 'prioridad', 'area_responsable'}


class PuedeGestionarTicket(permissions.BasePermission):
    """
    Controla quién puede modificar los campos de gestión de un ticket
    (estado, prioridad, area_responsable):
    - SUPERVISOR (o is_staff de Django): cualquier ticket.
    - STAFF: solo tickets de su propia área.
    - ESTUDIANTE: nunca.
    El resto de las operaciones queda como antes (la visibilidad ya viene
    filtrada por get_queryset()).
    """
    message = 'No tenés permiso para gestionar este ticket.'

    def has_object_permission(self, request, view, obj):
        # Solo aplica a PATCH/PUT que toquen campos de gestión
        if request.method not in ('PATCH', 'PUT'):
            return True
        if not CAMPOS_GESTION & set(request.data.keys()):
            return True

        user = request.user
        rol = getattr(user, 'rol', None)
        if rol == 'SUPERVISOR' or user.is_staff:
            return True
        if rol == 'STAFF' and user.area_id is not None and user.area_id == obj.area_responsable_id:
            return True
        return False
