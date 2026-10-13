from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Usuario


class AutoasignacionAreaTests(APITestCase):
    def setUp(self):
        self.url = reverse("usuario-actual")
        self.soporte = Area.objects.create(nombre="Soporte")
        self.alumnado = Area.objects.create(nombre="Alumnado")

    def _login(self, **extra):
        datos = {"username": "u", "password": "Clave123!", "rol": Usuario.Roles.STAFF}
        datos.update(extra)
        usuario = Usuario.objects.create_user(**datos)
        self.client.force_authenticate(usuario)
        return usuario

    def test_staff_sin_area_puede_elegirla(self):
        usuario = self._login()
        response = self.client.patch(self.url, {"area": self.soporte.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usuario.refresh_from_db()
        self.assertEqual(usuario.area, self.soporte)

    def test_staff_con_area_no_puede_cambiarla(self):
        usuario = self._login(area=self.soporte)
        response = self.client.patch(self.url, {"area": self.alumnado.id})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        usuario.refresh_from_db()
        self.assertEqual(usuario.area, self.soporte)

    def test_volver_a_guardar_la_misma_area_no_falla(self):
        self._login(area=self.soporte)
        response = self.client.patch(self.url, {"area": self.soporte.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_estudiante_no_puede_asignarse_area(self):
        usuario = self._login(rol=Usuario.Roles.ESTUDIANTE)
        response = self.client.patch(self.url, {"area": self.soporte.id})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        usuario.refresh_from_db()
        self.assertIsNone(usuario.area)

    def test_area_inexistente_o_vacia_devuelve_400(self):
        self._login()
        self.assertEqual(self.client.patch(self.url, {"area": 9999}).status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.patch(self.url, {"area": ""}).status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.patch(self.url, {"area": "abc"}).status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_sin_area_no_cambia_nada(self):
        self._login(area=self.soporte)
        response = self.client.patch(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
