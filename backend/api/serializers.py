from rest_framework import serializers
from .models import Ticket, Usuario, Area, Categoria, Respuesta

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'area']

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'rol']
        extra_kwargs = {
            'rol': {'read_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        validated_data['rol'] = 'ESTUDIANTE'
        user = Usuario.objects.create_user(password=password, **validated_data)
        return user

class RespuestaSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_rol = serializers.CharField(source='autor.rol', read_only=True)

    class Meta:
        model = Respuesta
        fields = ['id', 'mensaje', 'creado_el', 'autor_nombre', 'autor_rol']

    def get_autor_nombre(self, obj):
        nombre = f"{obj.autor.first_name} {obj.autor.last_name}".strip()
        return nombre or obj.autor.username


class TicketSerializer(serializers.ModelSerializer):
    # Agregamos campos de solo lectura para mostrar nombres en vez de IDs en el frontend
    creado_por_nombre = serializers.CharField(source='creado_por.username', read_only=True)
    creado_por_email = serializers.EmailField(source='creado_por.email', read_only=True)
    creado_por_first_name = serializers.CharField(source='creado_por.first_name', read_only=True)
    creado_por_last_name = serializers.CharField(source='creado_por.last_name', read_only=True)
    creado_por_rol = serializers.CharField(source='creado_por.rol', read_only=True)
    area_nombre = serializers.CharField(source='area_responsable.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    respuestas = RespuestaSerializer(many=True, read_only=True)

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