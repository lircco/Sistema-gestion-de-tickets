from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Usuario


@override_settings(STAFF_REGISTRATION_CODE="codigo-de-prueba")
class RegistroRolesPrivilegiadosTests(APITestCase):
    def setUp(self):
        self.url = reverse("registro-list")
        self.area = Area.objects.create(nombre="Soporte")

    def _datos(self, username, **extra):
        datos = {
            "username": username,
            "email": f"{username}@example.com",
            "password": "ClaveNueva123!",
            "password_confirm": "ClaveNueva123!",
            "first_name": "Nombre",
            "last_name": "Apellido",
        }
        datos.update(extra)
        return datos

    def test_no_se_puede_registrar_supervisor_aunque_tenga_codigo(self):
        response = self.client.post(self.url, self._datos("jefe", rol="SUPERVISOR", auth_code="codigo-de-prueba"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("rol", response.data)
        self.assertFalse(Usuario.objects.filter(username="jefe").exists())

    def test_el_codigo_viejo_hardcodeado_ya_no_sirve(self):
        response = self.client.post(self.url, self._datos("staff1", rol="STAFF", auth_code="UNRAF2026", area=self.area.id))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("auth_code", response.data)

    def test_staff_con_codigo_correcto_se_registra_sin_privilegios_de_admin(self):
        response = self.client.post(self.url, self._datos("staff2", rol="STAFF", auth_code="codigo-de-prueba", area=self.area.id))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        usuario = Usuario.objects.get(username="staff2")
        self.assertEqual(usuario.rol, Usuario.Roles.STAFF)
        self.assertFalse(usuario.is_superuser)

    def test_staff_sin_codigo_es_rechazado(self):
        response = self.client.post(self.url, self._datos("staff3", rol="STAFF", area=self.area.id))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(STAFF_REGISTRATION_CODE="")
    def test_sin_codigo_configurado_el_registro_de_staff_esta_deshabilitado(self):
        response = self.client.post(self.url, self._datos("staff4", rol="STAFF", auth_code="", area=self.area.id))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("rol", response.data)

    def test_estudiante_se_registra_sin_codigo(self):
        response = self.client.post(self.url, self._datos("alumno"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Usuario.objects.get(username="alumno").rol, Usuario.Roles.ESTUDIANTE)
