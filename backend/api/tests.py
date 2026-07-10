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
        
        # Debería ser 404 Not Found si no tiene permiso
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SuperusuarioRolTests(TestCase):
    """
    Tests para verificar que la señal asignar_rol_superusuario funciona correctamente.
    Issue #45: Al crear un superusuario con createsuperuser, debería tener rol SUPERVISOR.
    """

    def test_superusuario_obtiene_rol_supervisor(self):
        """Un superusuario creado programáticamente debe tener rol SUPERVISOR tras la señal."""
        superuser = Usuario.objects.create_superuser(
            username="admin_test",
            password="admin123",
            email="admin@test.com"
        )
        # Refresca desde la base de datos para obtener el valor actualizado por la señal
        superuser.refresh_from_db()
        self.assertEqual(
            superuser.rol,
            Usuario.Roles.SUPERVISOR,
            "Un superusuario debe tener rol SUPERVISOR automáticamente"
        )

    def test_usuario_normal_mantiene_rol_estudiante(self):
        """Un usuario normal (no superusuario) debe conservar su rol ESTUDIANTE."""
        usuario = Usuario.objects.create_user(
            username="alumno_test",
            password="alumno123",
            email="alumno@test.com"
        )
        usuario.refresh_from_db()
        self.assertEqual(
            usuario.rol,
            Usuario.Roles.ESTUDIANTE,
            "Un usuario normal debe mantener el rol ESTUDIANTE"
        )

    def test_usuario_staff_existente_que_se_vuelve_superusuario(self):
        """Si un usuario existente es promovido a superusuario, debe obtener rol SUPERVISOR."""
        usuario = Usuario.objects.create_user(
            username="staff_test",
            password="staff123",
            email="staff@test.com",
            rol=Usuario.Roles.STAFF
        )
        # Promovemos a superusuario
        usuario.is_superuser = True
        usuario.save()
        usuario.refresh_from_db()
        self.assertEqual(
            usuario.rol,
            Usuario.Roles.SUPERVISOR,
            "Un usuario promovido a superusuario debe obtener rol SUPERVISOR"
        )
