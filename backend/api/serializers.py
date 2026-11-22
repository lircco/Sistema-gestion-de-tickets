import hmac

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import Ticket, Usuario, Area, Categoria, Respuesta, Notificacion, Articulo

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'area', 'dni', 'foto_perfil']

    def get_foto_perfil(self, obj):
        if not obj.foto_perfil:
            return None
        return obj.foto_perfil.url

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    auth_code = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'rol', 'area', 'auth_code']

    def validate_email(self, value):
        # El email no es único en la base, pero el login por email y la recuperación
        # de contraseña asumen una sola cuenta por dirección.
        if value and Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Ya existe una cuenta registrada con este email.')
        return value

    def validate(self, data):
        if data['password'] != data.get('password_confirm'):
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
            
        rol = data.get('rol', 'ESTUDIANTE')
        if rol == 'SUPERVISOR':
            # Un supervisor es superusuario: lo crea un administrador, no el registro público.
            raise serializers.ValidationError({'rol': 'Las cuentas de supervisor las crea un administrador.'})
        if rol == 'STAFF':
            codigo_esperado = settings.STAFF_REGISTRATION_CODE
            if not codigo_esperado:
                raise serializers.ValidationError({'rol': 'El registro como Staff no está habilitado.'})
            auth_code = data.get('auth_code') or ''
            if not hmac.compare_digest(auth_code.encode(), codigo_esperado.encode()):
                raise serializers.ValidationError({'auth_code': 'Código de autorización inválido para registrarse como Staff.'})

        # Mismas reglas que al cambiar o restablecer la contraseña (AUTH_PASSWORD_VALIDATORS).
        # El usuario tentativo permite detectar contraseñas parecidas a sus datos.
        usuario_tentativo = Usuario(
            username=data.get('username', ''),
            email=data.get('email', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
        )
        try:
            validate_password(data['password'], user=usuario_tentativo)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        validated_data.pop('auth_code', None)
        password = validated_data.pop('password')
        if 'rol' not in validated_data:
            validated_data['rol'] = 'ESTUDIANTE'
        user = Usuario.objects.create_user(password=password, **validated_data)
        return user

class RespuestaSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_rol = serializers.CharField(source='autor.rol', read_only=True)
    autor_dni = serializers.CharField(source='autor.dni', read_only=True)
    autor_foto_perfil = serializers.SerializerMethodField()

    class Meta:
        model = Respuesta
        fields = ['id', 'mensaje', 'creado_el', 'autor_nombre', 'autor_rol', 'autor_dni', 'autor_foto_perfil']

    def get_autor_nombre(self, obj):
        nombre = f"{obj.autor.first_name} {obj.autor.last_name}".strip()
        return nombre or obj.autor.username

    def get_autor_foto_perfil(self, obj):
        if not obj.autor or not obj.autor.foto_perfil:
            return None
        return obj.autor.foto_perfil.url


class TicketSerializer(serializers.ModelSerializer):
    # Agregamos campos de solo lectura para mostrar nombres en vez de IDs en el frontend
    creado_por_nombre = serializers.CharField(source='creado_por.username', read_only=True)
    creado_por_email = serializers.EmailField(source='creado_por.email', read_only=True)
    creado_por_first_name = serializers.CharField(source='creado_por.first_name', read_only=True)
    creado_por_last_name = serializers.CharField(source='creado_por.last_name', read_only=True)
    creado_por_rol = serializers.CharField(source='creado_por.rol', read_only=True)
    creado_por_dni = serializers.CharField(source='creado_por.dni', read_only=True)
    creado_por_foto_perfil = serializers.SerializerMethodField()
    area_nombre = serializers.CharField(source='area_responsable.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    respuestas = RespuestaSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['creado_por', 'creado_el', 'actualizado_el']

    def get_creado_por_foto_perfil(self, obj):
        if not obj.creado_por or not obj.creado_por.foto_perfil:
            return None
        return obj.creado_por.foto_perfil.url

    # Mismas reglas que el frontend (imágenes o PDF, hasta 5 MB), aplicadas en el servidor.
    # SVG queda afuera a propósito: puede contener scripts.
    EXTENSIONES_ADJUNTO = {'.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp'}
    MAX_ADJUNTO_BYTES = 5 * 1024 * 1024

    def validate_archivo_adjunto(self, archivo):
        if not archivo:
            return archivo
        if not archivo.name.lower().endswith(tuple(self.EXTENSIONES_ADJUNTO)):
            raise serializers.ValidationError('Solo se permiten imágenes (PNG, JPG, GIF, WEBP) o PDF.')
        if archivo.size > self.MAX_ADJUNTO_BYTES:
            raise serializers.ValidationError('El archivo supera el límite de 5 MB.')
        return archivo
    
    # Agregamos este método para modificar los campos al vuelo
    def get_fields(self):
        # Traemos todos los campos originales
        fields = super().get_fields()
        
        # Obtenemos el 'request' para saber quién está logueado
        request = self.context.get('request')
        
        if request and getattr(request.user, 'rol', None) == 'ESTUDIANTE':
            # Estado y prioridad los maneja el staff (Acciones Rápidas del detalle):
            # el estudiante no los elige ni al crear (toman ABIERTO y MEDIA) ni al
            # editar. El área sí la elige al crear, pero no puede reasignarla después.
            bloqueados = ['estado', 'prioridad']
            if self.instance is not None:
                bloqueados.append('area_responsable')
            for campo in bloqueados:
                if campo in fields:
                    fields[campo].read_only = True

        return fields

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'usuario', 'ticket', 'mensaje', 'leida', 'creada_el']
        read_only_fields = ['id', 'usuario', 'ticket', 'mensaje', 'creada_el']


class ArticuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Articulo
        fields = ['id', 'titulo', 'resumen', 'contenido', 'categoria', 'visitas', 'creado_el', 'actualizado_el']
