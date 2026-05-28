from rest_framework import viewsets, filters, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count
from django.db import models
from .models import Ticket, Area, Categoria
from .serializers import TicketSerializer, UsuarioSerializer, AreaSerializer, CategoriaSerializer

# 1. Configuración de Paginación
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# 2. El ViewSet del Ticket
class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]

    # Habilitamos la bÃºsqueda
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'descripcion', 'estado'] # React podrÃ¡ buscar por estos campos

    def get_queryset(self):
        user = self.request.user
        # Si el usuario es SUPERVISOR, ve todo
        if hasattr(user, 'rol') and user.rol == 'SUPERVISOR':
            return Ticket.objects.all().order_by('-creado_el')
        # Si es STAFF, ve solo los de su Ã¡rea
        elif hasattr(user, 'rol') and user.rol == 'STAFF':
            return Ticket.objects.filter(area_responsable=user.area).order_by('-creado_el')
        # Si es ESTUDIANTE, ve solo los suyos
        return Ticket.objects.filter(creado_por=user).order_by('-creado_el')

    def perform_create(self, serializer):
        # Asigna automÃ¡ticamente el creador al usuario logueado
        serializer.save(creado_por=self.request.user)

    # 3. Endpoint personalizado para el Dashboard (EstadÃ­sticas en tiempo real)
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        # Usamos el queryset filtrado para las estadÃ­sticas
        queryset = self.get_queryset()
        stats = queryset.aggregate(
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

# 4. Vistas de Autenticación
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
    def post(self, request):
        logout(request)
        return Response({'message': 'Sesión cerrada correctamente'})

class UserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response(UsuarioSerializer(request.user).data)
        return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)