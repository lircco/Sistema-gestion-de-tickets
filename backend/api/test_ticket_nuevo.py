from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Categoria, Ticket, Usuario


class CreacionDeTicketPorAlumnoTests(APITestCase):
    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte")
        self.categoria = Categoria.objects.create(nombre="General")
        self.alumno = Usuario.objects.create_user(username="alumno", password="x")
        self.staff = Usuario.objects.create_user(
            username="staff", password="x", rol=Usuario.Roles.STAFF, area=self.area
        )
        self.url = reverse("ticket-list")

    def _crear(self, usuario, **extra):
        self.client.force_authenticate(usuario)
        datos = {"titulo": "t", "descripcion": "d", "area_responsable": self.area.id, "categoria": self.categoria.id}
        datos.update(extra)
        return self.client.post(self.url, datos)

    def test_alumno_no_puede_crear_un_ticket_cerrado_ni_elegir_prioridad(self):
        response = self._crear(self.alumno, estado="CERRADO", prioridad="ALTA")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = Ticket.objects.get(id=response.data["id"])
        self.assertEqual(ticket.estado, Ticket.Estados.ABIERTO)
        self.assertEqual(ticket.prioridad, Ticket.Prioridades.MEDIA)

    def test_alumno_sigue_eligiendo_el_area_al_crear(self):
        otra = Area.objects.create(nombre="Alumnado")
        response = self._crear(self.alumno, area_responsable=otra.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.get(id=response.data["id"]).area_responsable, otra)

    def test_staff_puede_fijar_la_prioridad_al_crear(self):
        response = self._crear(self.staff, prioridad="ALTA")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.get(id=response.data["id"]).prioridad, Ticket.Prioridades.ALTA)
