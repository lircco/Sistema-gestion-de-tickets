from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet, 
    AreaViewSet, 
    CategoriaViewSet, 
    RegistroUsuarioViewSet, 
    UsuarioActualView, 
    LoginView, 
    LogoutView,
    RecuperarPasswordView  # <-- Vista importada correctamente
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'registro', RegistroUsuarioViewSet, basename='registro')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UsuarioActualView.as_view(), name='usuario-actual'),
    # --- RUTA DE RECUPERACIÓN ---
    path('auth/recuperar-password/', RecuperarPasswordView.as_view(), name='recuperar_password'),
]
