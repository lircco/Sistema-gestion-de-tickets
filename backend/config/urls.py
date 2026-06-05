from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# 1. Importamos las vistas de SimpleJWT para el login
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Conectamos todas las rutas de la app 'api' bajo el prefijo 'api/'
    path('api/', include('api.urls')), 
    path('api-auth/', include('rest_framework.urls')),
    
    # 2. ESTAS SON LAS RUTAS QUE NECESITA REACT PARA EL LOGIN Y LOS TOKENS
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)