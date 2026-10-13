from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Usuario


class RestablecerPasswordTests(APITestCase):
    def setUp(self):
        self.url = reverse("restablecer_password")
        self.usuario = Usuario.objects.create_user(
            username="alumno_reset", email="alumno_reset@example.com", password="CodigoTemporal123"
        )

    def _post(self, **datos):
        base = {"email": "alumno_reset@example.com", "codigo": "CodigoTemporal123", "nueva_password": "NuevaClave456!"}
        base.update(datos)
        return self.client.post(self.url, base)

    def test_restablece_con_codigo_correcto(self):
        response = self._post()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("NuevaClave456!"))

    def test_rechaza_una_contrasena_que_no_cumple_los_validadores(self):
        response = self._post(nueva_password="123")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("CodigoTemporal123"))

    def test_email_inexistente_y_codigo_incorrecto_responden_igual(self):
        inexistente = self._post(email="nadie@example.com")
        codigo_malo = self._post(codigo="Incorrecto")
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
