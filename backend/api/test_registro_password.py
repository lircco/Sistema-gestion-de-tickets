from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario


class RegistroValidaPasswordTests(APITestCase):
    def setUp(self):
        self.url = reverse("registro-list")

    def _registrar(self, password, username="nuevo"):
        return self.client.post(self.url, {
            "username": username,
            "email": f"{username}@example.com",
            "password": password,
            "password_confirm": password,
            "first_name": "Juan",
            "last_name": "Perez",
        })

    def test_rechaza_contrasenas_debiles(self):
        for password in ("1", "12345678", "password", "nuevo123"):
            response = self._registrar(password)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, password)
            self.assertIn("password", response.data)
        self.assertFalse(Usuario.objects.filter(username="nuevo").exists())

    def test_acepta_una_contrasena_robusta(self):
        response = self._registrar("Tickets-Unraf-2026")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Usuario.objects.get(username="nuevo").check_password("Tickets-Unraf-2026"))
