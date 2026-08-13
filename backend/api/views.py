# --- REEMPLAZÁ TUS IMPORTS DE ARRIBA POR ESTOS ---
from rest_framework import viewsets, filters, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView  # <-- SÚPER IMPORTANTE PARA TU NUEVA CLASE
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count
from django.db import models
from django.core.mail import send_mail
from django.conf import settings

from .models import Ticket, Usuario, Area, Categoria
from .serializers import TicketSerializer, RegistroSerializer, AreaSerializer, CategoriaSerializer, UsuarioSerializer

class RegistroUsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'descripcion', 'estado']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'rol') and user.rol in ['STAFF', 'SUPERVISOR'] or user.is_staff:
            return Ticket.objects.all().order_by('-creado_el')
        return Ticket.objects.filter(creado_por=user).order_by('-creado_el')

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        stats = Ticket.objects.aggregate(
            total=Count('id'),
            abiertos=Count('id', filter=models.Q(estado='ABIERTO')),
            en_progreso=Count('id', filter=models.Q(estado='EN_PROGRESO')),
            cerrados=Count('id', filter=models.Q(estado='CERRADO'))
        )
        return Response(stats)


class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [permissions.IsAuthenticated]


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class UsuarioActualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        usuario = request.user
        data = {
            'id': usuario.id,
            'username': usuario.username,
            'email': usuario.email,
            'first_name': usuario.first_name,
            'rol': usuario.rol if hasattr(usuario, 'rol') else 'ESTUDIANTE',
            'is_staff': usuario.is_staff
        }
        return Response(data)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response(UsuarioSerializer(user).data)
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({'message': 'Sesión cerrada correctamente'})


# --- VISTA DE RECUPERACIÓN DE CONTRASEÑA ---
class RecuperarPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Por favor, ingrese un correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Corrección: Buscamos si el usuario existe por su email
            usuario = Usuario.objects.get(email=email)
            
            nueva_clave = "Unraf2026"
            usuario.set_password(nueva_clave)
            usuario.save()

            # Configuramos el mensaje para Gmail
            asunto = 'Contraseña cambiada con éxito - UnrafTickets'
            mensaje = f'Hola {usuario.first_name or usuario.username},\n\nTu contraseña ha sido restablecida con éxito para el sistema UnrafTickets.\n\nTu nueva contraseña temporal para ingresar es: {nueva_clave}\n\nPor favor, iniciá sesión y cambiala desde tu perfil.\n\nSaludos,\nSoporte Técnico Institucional.'
            email_desde = settings.EMAIL_HOST_USER
            emails_destino = [email]

            # Enviamos el correo real
            send_mail(asunto, mensaje, email_desde, emails_destino, fail_silently=False)

            return Response({'message': 'Correo enviado correctamente.'}, status=status.HTTP_200_OK)

        except Usuario.DoesNotExist:
            # Corrección de Sintaxis: Captura correcta si el usuario no existe
            return Response({'error': 'No se encontró ningún usuario registrado con ese correo electrónico.'}, status=status.HTTP_404_NOT_FOUND)
        