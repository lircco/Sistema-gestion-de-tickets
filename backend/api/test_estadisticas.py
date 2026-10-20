from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Categoria, Ticket, Usuario


class EstadisticasPorRolTests(APITestCase):
    def setUp(self):
        self.url = reverse("ticket-estadisticas")
        self.soporte = Area.objects.create(nombre="Soporte")
        self.alumnado = Area.objects.create(nombre="Alumnado")
        categoria = Categoria.objects.create(nombre="General")
        self.alumno1 = Usuario.objects.create_user(username="a1", password="x")
        self.alumno2 = Usuario.objects.create_user(username="a2", password="x")
        self.staff = Usuario.objects.create_user(
            username="s1", password="x", rol=Usuario.Roles.STAFF, area=self.soporte
        )
        self.supervisor = Usuario.objects.create_user(
            username="sup", password="x", rol=Usuario.Roles.SUPERVISOR
        )
        for creador, area, estado in [
            (self.alumno1, self.soporte, "ABIERTO"),
            (self.alumno1, self.alumnado, "CERRADO"),
            (self.alumno2, self.soporte, "EN_PROGRESO"),
            (self.alumno2, self.alumnado, "ABIERTO"),
        ]:
            Ticket.objects.create(
                titulo="t", descripcion="d", creado_por=creador,
                area_responsable=area, categoria=categoria, estado=estado,
            )

    def _stats(self, usuario):
        self.client.force_authenticate(usuario)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data

    def test_estudiante_solo_ve_sus_tickets(self):
        stats = self._stats(self.alumno1)
        self.assertEqual(stats["total"], 2)
        self.assertEqual(stats["abiertos"], 1)
        self.assertEqual(stats["cerrados"], 1)
        self.assertEqual(stats["en_progreso"], 0)

    def test_staff_solo_ve_los_de_su_area(self):
        stats = self._stats(self.staff)
        self.assertEqual(stats["total"], 2)
        self.assertEqual(stats["abiertos"], 1)
        self.assertEqual(stats["en_progreso"], 1)

    def test_supervisor_ve_todos(self):
        self.assertEqual(self._stats(self.supervisor)["total"], 4)
