from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Categoria, Ticket, Usuario


class BorradoDeTicketsTests(APITestCase):
    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte")
        self.categoria = Categoria.objects.create(nombre="General")
        self.alumno = Usuario.objects.create_user(username="alumno", password="x")
        self.staff = Usuario.objects.create_user(
            username="staff", password="x", rol=Usuario.Roles.STAFF, area=self.area
        )
        self.supervisor = Usuario.objects.create_user(
            username="sup", password="x", rol=Usuario.Roles.SUPERVISOR
        )
        self.ticket = Ticket.objects.create(
            titulo="t", descripcion="d", creado_por=self.alumno,
            area_responsable=self.area, categoria=self.categoria,
        )
        self.url = reverse("ticket-detail", args=[self.ticket.id])

    def _borrar(self, usuario):
        self.client.force_authenticate(usuario)
        return self.client.delete(self.url)

    def test_alumno_no_puede_borrar_su_ticket(self):
        self.assertEqual(self._borrar(self.alumno).status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Ticket.objects.filter(id=self.ticket.id).exists())

    def test_staff_no_puede_borrar_tickets_de_su_area(self):
        self.assertEqual(self._borrar(self.staff).status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Ticket.objects.filter(id=self.ticket.id).exists())

    def test_supervisor_puede_borrar(self):
        self.assertEqual(self._borrar(self.supervisor).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Ticket.objects.filter(id=self.ticket.id).exists())

    def test_superusuario_puede_borrar(self):
        superuser = Usuario.objects.create_superuser(username="admin_root", password="x", email="root@example.com")
        self.assertEqual(self._borrar(superuser).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Ticket.objects.filter(id=self.ticket.id).exists())

    def test_alumno_bloqueado_en_has_permission_antes_de_buscar_objeto(self):
        self.client.force_authenticate(self.alumno)
        url_inexistente = reverse("ticket-detail", args=[999999])
        response = self.client.delete(url_inexistente)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_bloqueado_en_has_permission_antes_de_buscar_objeto(self):
        self.client.force_authenticate(self.staff)
        url_inexistente = reverse("ticket-detail", args=[999999])
        response = self.client.delete(url_inexistente)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_el_resto_de_la_gestion_sigue_igual(self):
        self.client.force_authenticate(self.staff)
        response = self.client.patch(self.url, {"estado": "EN_PROGRESO"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
