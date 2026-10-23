from datetime import datetime, timedelta
from unittest import mock

from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.core import mail
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario


class RestablecerPasswordTests(APITestCase):
    def setUp(self):
        self.url = reverse("restablecer_password")
        self.usuario = Usuario.objects.create_user(
            username="alumno_reset", email="alumno_reset@example.com", password="ClaveOriginal123"
        )
        self.codigo = default_token_generator.make_token(self.usuario)

    def _post(self, **datos):
        base = {"email": "alumno_reset@example.com", "codigo": self.codigo, "nueva_password": "NuevaClave456!"}
        base.update(datos)
        return self.client.post(self.url, base)

    def test_restablece_con_codigo_correcto(self):
        response = self._post()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("NuevaClave456!"))

    def test_la_contrasena_actual_no_sirve_como_codigo(self):
        response = self._post(codigo="ClaveOriginal123")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_el_codigo_sirve_una_sola_vez(self):
        self.assertEqual(self._post().status_code, status.HTTP_200_OK)
        response = self._post(nueva_password="OtraClave789!")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("NuevaClave456!"))

    def test_el_codigo_vence(self):
        mas_tarde = datetime.now() + timedelta(hours=2)
        with mock.patch.object(PasswordResetTokenGenerator, "_now", return_value=mas_tarde):
            response = self._post()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rechaza_una_contrasena_que_no_cumple_los_validadores(self):
        response = self._post(nueva_password="123")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("ClaveOriginal123"))

    def test_email_inexistente_y_codigo_incorrecto_responden_igual(self):
        inexistente = self._post(email="nadie@example.com")
        codigo_malo = self._post(codigo="codigo-invalido")
        self.assertEqual(inexistente.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(codigo_malo.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(inexistente.data, codigo_malo.data)

    def test_emails_duplicados_no_rompen_el_endpoint(self):
        Usuario.objects.create_user(
            username="otro", email="alumno_reset@example.com", password="OtraClave789"
        )
        response = self._post()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("NuevaClave456!"))

    def test_faltan_datos(self):
        response = self.client.post(self.url, {"email": "alumno_reset@example.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class FlujoCompletoRecuperacionTests(APITestCase):
    def test_pedir_codigo_y_usarlo(self):
        usuario = Usuario.objects.create_user(
            username="flujo", email="flujo@example.com", password="ClaveOriginal123"
        )
        self.client.post(reverse("recuperar_password"), {"email": "flujo@example.com"})
        self.assertEqual(len(mail.outbox), 1)
        codigo = next(
            linea.strip() for linea in mail.outbox[0].body.splitlines()
            if default_token_generator.check_token(usuario, linea.strip())
        )
        # El pedido no cambió la contraseña
        usuario.refresh_from_db()
        self.assertTrue(usuario.check_password("ClaveOriginal123"))

        response = self.client.post(reverse("restablecer_password"), {
            "email": "flujo@example.com", "codigo": codigo, "nueva_password": "NuevaClave456!"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usuario.refresh_from_db()
        self.assertTrue(usuario.check_password("NuevaClave456!"))
