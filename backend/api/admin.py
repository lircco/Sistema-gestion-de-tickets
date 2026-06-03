from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Area, Categoria, Ticket, Respuesta

# Registramos los modelos para verlos en el panel
admin.site.register(Usuario,UserAdmin)
admin.site.register(Area)
admin.site.register(Categoria)
admin.site.register(Ticket)
admin.site.register(Respuesta)