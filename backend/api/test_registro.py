from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario


class RegistroSoloCreacionTests(APITestCase):
    def setUp(self):
        self.victima = Usuario.objects.create_user(
            username="victima", password="ClaveSecreta123!", email="victima@example.com"
        )
        self.url_lista = reverse("registro-list")
        self.url_detalle = f"{self.url_lista}{self.victima.id}/"

    def test_registro_crea_un_usuario(self):
        response = self.client.post(self.url_lista, {
            "username": "nuevo",
            "email": "nuevo@example.com",
            "password": "ClaveNueva123!",
            "password_confirm": "ClaveNueva123!",
            "first_name": "Nuevo",
            "last_name": "Usuario",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", response.data)
        self.assertTrue(Usuario.objects.filter(username="nuevo").exists())

    def test_anonimo_no_puede_listar_usuarios(self):
        response = self.client.get(self.url_lista)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_anonimo_no_puede_ver_un_usuario(self):
        response = self.client.get(self.url_detalle)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_anonimo_no_puede_borrar_usuarios(self):
        response = self.client.delete(self.url_detalle)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Usuario.objects.filter(id=self.victima.id).exists())

    def test_anonimo_no_puede_modificar_usuarios(self):
        response = self.client.patch(self.url_detalle, {"email": "atacante@example.com"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.victima.refresh_from_db()
        self.assertEqual(self.victima.email, "victima@example.com")
