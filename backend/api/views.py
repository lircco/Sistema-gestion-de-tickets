from rest_framework import viewsets, filters, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count
from django.db import models

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
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Sesión cerrada correctamente'})