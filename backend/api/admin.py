from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Area, Categoria, Ticket, Respuesta


class UsuarioAdmin(UserAdmin):
    # UserAdmin no conoce los campos propios del modelo (rol, area): sin esto,
    # quedan ocultos en el panel y toda cuenta nueva se crea como ESTUDIANTE.
    fieldsets = UserAdmin.fieldsets + (
        ('Rol de la aplicación', {'fields': ('rol', 'area')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Rol de la aplicación', {'fields': ('rol', 'area')}),
    )
    list_display = UserAdmin.list_display + ('rol', 'area')
    list_filter = UserAdmin.list_filter + ('rol', 'area')


# Registramos los modelos para verlos en el panel
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Area)
admin.site.register(Categoria)
admin.site.register(Ticket)
admin.site.register(Respuesta)
