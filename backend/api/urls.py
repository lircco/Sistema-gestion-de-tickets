from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, LoginView, LogoutView, UserView, AreaViewSet, CategoriaViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'categorias', CategoriaViewSet, basename='categoria')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserView.as_view(), name='me'),
]