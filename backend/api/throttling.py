from rest_framework.settings import api_settings
from rest_framework.throttling import SimpleRateThrottle


class AutenticacionRateThrottle(SimpleRateThrottle):
    """
    Limita por IP los POST a los endpoints de autenticación (login, registro y
    recuperación de contraseña) para frenar fuerza bruta y envíos masivos de mails.
    El resto de la API no se ve afectada.
    """
    scope = 'auth'
    RUTAS = {
        'token_obtain_pair',
        'login',
        'registro-list',
        'recuperar_password',
        'restablecer_password',
    }

    def get_rate(self):
        # Se lee en cada pedido para respetar override_settings en los tests.
        return api_settings.DEFAULT_THROTTLE_RATES.get(self.scope)

    def get_cache_key(self, request, view):
        match = getattr(request, 'resolver_match', None)
        if request.method != 'POST' or match is None or match.url_name not in self.RUTAS:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}
