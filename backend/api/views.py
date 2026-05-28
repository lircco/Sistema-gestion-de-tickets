from rest_framework import viewsets, filters
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
    queryset = Ticket.objects.all().order_by('-creado_el')
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination
    
    # Habilitamos la búsqueda
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'descripcion', 'estado'] # React podrá buscar por estos campos

    def perform_create(self, serializer):
        # Asigna automáticamente el creador al usuario logueado
        serializer.save(creado_por=self.request.user)

    # 3. Endpoint personalizado para el Dashboard (Estadísticas en tiempo real)
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        # Calculamos en tiempo real como acordamos antes
        stats = Ticket.objects.aggregate(
            total=Count('id'),
            abiertos=Count('id', filter=models.Q(estado='ABIERTO')),
            en_progreso=Count('id', filter=models.Q(estado='EN_PROGRESO')),
            cerrados=Count('id', filter=models.Q(estado='CERRADO'))
        )
        return Response(stats)