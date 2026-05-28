from rest_framework import serializers
from .models import Ticket, Usuario, Area, Categoria

class TicketSerializer(serializers.ModelSerializer):
    # Agregamos campos de solo lectura para mostrar nombres en vez de IDs en el frontend
    creado_por_nombre = serializers.CharField(source='creado_por.username', read_only=True)
    area_nombre = serializers.CharField(source='area_responsable.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['creado_por', 'creado_el', 'actualizado_el']
    
    # Agregamos este método para modificar los campos al vuelo
    def get_fields(self):
        # Traemos todos los campos originales
        fields = super().get_fields()
        
        # Obtenemos el 'request' para saber quién está logueado
        request = self.context.get('request')
        
        # Si el usuario está logueado y su rol es ESTUDIANTE
        if request and hasattr(request.user, 'rol') and request.user.rol == 'ESTUDIANTE':
            # Bloqueamos el campo estado para que sea solo de lectura
            if 'estado' in fields:
                fields['estado'].read_only = True
                
        return fields