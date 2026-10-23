from django.contrib.auth import authenticate
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario


class LoginUnificadoTests(APITestCase):
    def setUp(self):
        self.url = reverse("login")
        self.usuario = Usuario.objects.create_user(
            username="pgonzalez", password="ClaveCorrecta123!", first_name="Pedro", last_name="Gonzalez"
        )

    def test_login_por_username(self):
        response = self.client.post(self.url, {"username": "pgonzalez", "password": "ClaveCorrecta123!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "pgonzalez")

    def test_login_por_nombre_y_apellido(self):
        response = self.client.post(self.url, {"username": "pedro gonzalez", "password": "ClaveCorrecta123!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "pgonzalez")

    def test_password_incorrecta(self):
        response = self.client.post(self.url, {"username": "Pedro Gonzalez", "password": "otra"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_usuario_inactivo_no_entra_por_nombre(self):
        self.usuario.is_active = False
        self.usuario.save()
        self.assertIsNone(authenticate(username="Pedro Gonzalez", password="ClaveCorrecta123!"))
        response = self.client.post(self.url, {"username": "Pedro Gonzalez", "password": "ClaveCorrecta123!"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_usuario_inactivo_no_obtiene_token_por_nombre(self):
        self.usuario.is_active = False
        self.usuario.save()
        response = self.client.post(
            reverse("token_obtain_pair"), {"username": "Pedro Gonzalez", "password": "ClaveCorrecta123!"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
