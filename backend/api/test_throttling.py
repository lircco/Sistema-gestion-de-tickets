from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario

LIMITE_BAJO = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_THROTTLE_CLASSES": ("api.throttling.AutenticacionRateThrottle",),
    "DEFAULT_THROTTLE_RATES": {"auth": "3/minute"},
}


@override_settings(REST_FRAMEWORK=LIMITE_BAJO)
class LimiteIntentosAutenticacionTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.usuario = Usuario.objects.create_user(username="alumno", password="ClaveCorrecta123!")

    def tearDown(self):
        cache.clear()

    def test_login_por_token_se_bloquea_al_superar_el_limite(self):
        url = reverse("token_obtain_pair")
        for _ in range(3):
            response = self.client.post(url, {"username": "alumno", "password": "incorrecta"})
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.post(url, {"username": "alumno", "password": "ClaveCorrecta123!"})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_recuperar_password_se_bloquea_al_superar_el_limite(self):
        url = reverse("recuperar_password")
        for _ in range(3):
            self.assertEqual(self.client.post(url, {"email": "x@example.com"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post(url, {"email": "x@example.com"}).status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_el_limite_es_por_ip(self):
        url = reverse("recuperar_password")
        for _ in range(3):
            self.client.post(url, {"email": "x@example.com"}, REMOTE_ADDR="10.0.0.1")
        bloqueado = self.client.post(url, {"email": "x@example.com"}, REMOTE_ADDR="10.0.0.1")
        otra_ip = self.client.post(url, {"email": "x@example.com"}, REMOTE_ADDR="10.0.0.2")
        self.assertEqual(bloqueado.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(otra_ip.status_code, status.HTTP_200_OK)

    def test_el_resto_de_la_api_no_se_limita(self):
        self.client.force_authenticate(self.usuario)
        for _ in range(6):
            self.assertEqual(self.client.get(reverse("ticket-list")).status_code, status.HTTP_200_OK)
