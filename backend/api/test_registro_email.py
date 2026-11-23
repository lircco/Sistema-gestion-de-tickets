from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario


class RegistroEmailUnicoTests(APITestCase):
    def setUp(self):
        self.url = reverse("registro-list")
        Usuario.objects.create_user(username="existente", password="x", email="juan.perez@unraf.edu.ar")

    def _registrar(self, username, email):
        return self.client.post(self.url, {
            "username": username,
            "email": email,
            "password": "Tickets-Unraf-2026",
            "password_confirm": "Tickets-Unraf-2026",
            "first_name": "Juan",
            "last_name": "Perez",
        })

    def test_rechaza_un_email_ya_registrado(self):
        response = self._registrar("otro", "juan.perez@unraf.edu.ar")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertFalse(Usuario.objects.filter(username="otro").exists())

    def test_la_comparacion_no_distingue_mayusculas(self):
        response = self._registrar("otro", "Juan.Perez@UNRAF.edu.ar")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_un_email_nuevo_se_registra(self):
        response = self._registrar("nuevo", "nuevo@unraf.edu.ar")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
