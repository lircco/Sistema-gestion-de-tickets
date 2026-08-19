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
        self.user = Usuario.objects.create_user(
            username="tecnico", 
            password="password123", 
            rol=Usuario.Roles.STAFF, 
            area=self.area,
            email="tecnico@example.com"
        )
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
        
        # Verificar que se registró el email
        from api.models import RegistroEmail
        self.assertEqual(RegistroEmail.objects.count(), 1)
        registro = RegistroEmail.objects.first()
        self.assertTrue(registro.exitoso)

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

class SecurityTests(APITestCase):
    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte IT")
        self.categoria = Categoria.objects.create(nombre="Redes")
        self.estudiante1 = Usuario.objects.create_user(
            username="estudiante1", 
            password="password123", 
            rol=Usuario.Roles.ESTUDIANTE,
            email="e1@example.com"
        )
        self.estudiante2 = Usuario.objects.create_user(
            username="estudiante2", 
            password="password123", 
            rol=Usuario.Roles.ESTUDIANTE,
            email="e2@example.com"
        )
        
        self.ticket1 = Ticket.objects.create(
            titulo="Ticket de Estudiante 1",
            descripcion="D1",
            creado_por=self.estudiante1,
            area_responsable=self.area,
            categoria=self.categoria
        )

    def test_estudiante_cannot_see_others_tickets(self):
        self.client.login(username="estudiante2", password="password123")
        url = reverse('ticket-list')
        response = self.client.get(url)
        
        # DeberÃ­a ver 0 tickets porque no creÃ³ ninguno
        self.assertEqual(len(response.data['results']), 0)

    def test_estudiante_cannot_access_others_ticket_detail(self):
        self.client.login(username="estudiante2", password="password123")
        url = reverse('ticket-detail', args=[self.ticket1.id])
        response = self.client.get(url)

        # DeberÃ­a ser 404 Not Found si no tiene permiso
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CambiarPasswordTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(
            username="alumno1",
            password="ClaveVieja123",
            rol=Usuario.Roles.ESTUDIANTE,
            email="alumno1@example.com"
        )
        self.client.login(username="alumno1", password="ClaveVieja123")

    def test_cambiar_password_exitoso(self):
        url = reverse('cambiar_password')
        response = self.client.post(url, {"password_actual": "ClaveVieja123", "password_nueva": "ClaveNueva456"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ClaveNueva456"))

    def test_cambiar_password_actual_incorrecta(self):
        url = reverse('cambiar_password')
        response = self.client.post(url, {"password_actual": "incorrecta", "password_nueva": "ClaveNueva456"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ClaveVieja123"))

    def test_cambiar_password_nueva_no_cumple_validadores(self):
        url = reverse('cambiar_password')
        response = self.client.post(url, {"password_actual": "ClaveVieja123", "password_nueva": "123"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ClaveVieja123"))

    def test_cambiar_password_requiere_autenticacion(self):
        self.client.logout()
        url = reverse('cambiar_password')
        response = self.client.post(url, {"password_actual": "ClaveVieja123", "password_nueva": "ClaveNueva456"})
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
