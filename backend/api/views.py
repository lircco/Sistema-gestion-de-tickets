from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count
from django.db import models
from .models import Ticket
from .serializers import TicketSerializer

# 1. Configuración de Paginación
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# 2. El ViewSet del Ticket
class TicketViewSet(viewsets.ModelViewSet):
    # Ya no usamos queryset estático acá
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination
    
    # SOLUCIÓN 1: Acá DEBE ser IsAuthenticated para proteger los tickets
    permission_classes = [permissions.IsAuthenticated] 
    
    # Habilitamos la búsqueda
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'descripcion', 'estado']

    # SOLUCIÓN 2: Recuperamos la validación de roles
    def get_queryset(self):
        user = self.request.user
        # Si es Staff o Supervisor, ve todos los tickets
        if user.rol in ['STAFF', 'SUPERVISOR'] or user.is_staff:
            return Ticket.objects.all().order_by('-creado_el')
        # Si es Estudiante, SOLO ve los suyos
        return Ticket.objects.filter(creado_por=user).order_by('-creado_el')

    def perform_create(self, serializer):
        # Como exigimos IsAuthenticated, self.request.user siempre será válido
        serializer.save(creado_por=self.request.user)

    # 3. Endpoint personalizado para el Dashboard
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        stats = Ticket.objects.aggregate(
            total=Count('id'),
            abiertos=Count('id', filter=models.Q(estado='ABIERTO')),
            en_progreso=Count('id', filter=models.Q(estado='EN_PROGRESO')),
            cerrados=Count('id', filter=models.Q(estado='CERRADO'))
        )
        return Response(stats)
