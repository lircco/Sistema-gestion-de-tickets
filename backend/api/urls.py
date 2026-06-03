from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, AreaViewSet, CategoriaViewSet, RegistroUsuarioViewSet, UsuarioActualView

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'registro', RegistroUsuarioViewSet, basename='registro')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', UsuarioActualView.as_view(), name='usuario-actual'),
]