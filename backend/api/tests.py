from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Area, Categoria, Usuario, Ticket

class ModelTests(TestCase):
    def test_create_area(self):
        area = Area.objects.create(nombre="Soporte", descripcion="Soporte técnico")
        self.assertEqual(str(area), "Soporte")

    def test_create_categoria(self):
        cat = Categoria.objects.create(nombre="Hardware", descripcion="Problemas de hardware")
        self.assertEqual(str(cat), "Hardware")

    def test_create_usuario(self):
        user = Usuario.objects.create_user(username="testuser", password="password123", rol=Usuario.Roles.ESTUDIANTE)
        self.assertEqual(user.rol, Usuario.Roles.ESTUDIANTE)
        self.assertIn("testuser", str(user))

class APITests(APITestCase):
    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte IT")
        self.categoria = Categoria.objects.create(nombre="Redes")
        self.user = Usuario.objects.create_user(username="tecnico", password="password123", rol=Usuario.Roles.STAFF, area=self.area)
        self.client.login(username="tecnico", password="password123")

    def test_get_tickets_authenticated(self):
        url = reverse('ticket-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_ticket(self):
        url = reverse('ticket-list')
        data = {
            "titulo": "No funciona el WiFi",
            "descripcion": "En el aula 3 no conecta",
            "area_responsable": self.area.id,
            "categoria": self.categoria.id,
            "prioridad": "ALTA"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 1)
        ticket = Ticket.objects.first()
        self.assertEqual(ticket.titulo, "No funciona el WiFi")
        self.assertEqual(ticket.creado_por, self.user)

    def test_ticket_estadisticas(self):
        Ticket.objects.create(
            titulo="T1", descripcion="D1", creado_por=self.user, 
            area_responsable=self.area, categoria=self.categoria, estado='ABIERTO'
        )
        url = reverse('ticket-estadisticas')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 1)
        self.assertEqual(response.data['abiertos'], 1)
