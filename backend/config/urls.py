from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

# 1. Importamos las vistas de SimpleJWT para el login
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 2. ESTAS SON LAS RUTAS QUE NECESITA REACT PARA EL LOGIN Y LOS TOKENS
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Conectamos todas las rutas de la app 'api' bajo el prefijo 'api/'
    path('api/', include('api.urls')), 
    path('api-auth/', include('rest_framework.urls')),

    # Servir archivos de medios (fotos de perfil, adjuntos)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)