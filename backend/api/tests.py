from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Area, Categoria, Usuario, Ticket, Respuesta

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


class SuperuserRolSignalTests(TestCase):
    def test_createsuperuser_asigna_rol_supervisor(self):
        admin = Usuario.objects.create_superuser(username="admin1", password="password123", email="admin1@example.com")
        admin.refresh_from_db()
        self.assertEqual(admin.rol, Usuario.Roles.SUPERVISOR)

    def test_usuario_normal_mantiene_rol_estudiante(self):
        user = Usuario.objects.create_user(username="estudiante3", password="password123", rol=Usuario.Roles.ESTUDIANTE)
        user.refresh_from_db()
        self.assertEqual(user.rol, Usuario.Roles.ESTUDIANTE)

    def test_promocion_a_superusuario_actualiza_el_rol(self):
        user = Usuario.objects.create_user(username="staff1", password="password123", rol=Usuario.Roles.STAFF)
        self.assertEqual(user.rol, Usuario.Roles.STAFF)

        user.is_superuser = True
        user.save()
        user.refresh_from_db()
        self.assertEqual(user.rol, Usuario.Roles.SUPERVISOR)


class TicketDetailDatosRealesTests(APITestCase):
    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte IT")
        self.categoria = Categoria.objects.create(nombre="Redes")
        self.estudiante = Usuario.objects.create_user(
            username="alumno2", password="password123", rol=Usuario.Roles.ESTUDIANTE,
            email="alumno2@example.com", first_name="Maria", last_name="Lopez"
        )
        self.staff = Usuario.objects.create_user(
            username="agente1", password="password123", rol=Usuario.Roles.STAFF,
            area=self.area, email="agente1@example.com", first_name="Carlos", last_name="Diaz"
        )
        self.ticket = Ticket.objects.create(
            titulo="Falla de proyector", descripcion="El proyector no prende",
            creado_por=self.estudiante, area_responsable=self.area, categoria=self.categoria
        )
        Respuesta.objects.create(ticket=self.ticket, autor=self.staff, mensaje="Ya lo estamos revisando")
        self.client.login(username="agente1", password="password123")

    def test_ticket_detail_incluye_datos_reales_del_solicitante(self):
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['creado_por_first_name'], 'Maria')
        self.assertEqual(response.data['creado_por_last_name'], 'Lopez')
        self.assertEqual(response.data['creado_por_email'], 'alumno2@example.com')
        self.assertEqual(response.data['creado_por_rol'], 'ESTUDIANTE')

    def test_ticket_detail_incluye_respuestas_reales(self):
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.get(url)
        self.assertEqual(len(response.data['respuestas']), 1)
        respuesta = response.data['respuestas'][0]
        self.assertEqual(respuesta['mensaje'], 'Ya lo estamos revisando')
        self.assertEqual(respuesta['autor_nombre'], 'Carlos Diaz')
        self.assertEqual(respuesta['autor_rol'], 'STAFF')


class TicketAccionesRapidasTests(APITestCase):
    def setUp(self):
        self.area1 = Area.objects.create(nombre="Soporte IT")
        self.area2 = Area.objects.create(nombre="Mesa de Entradas")
        self.categoria = Categoria.objects.create(nombre="Redes")
        self.estudiante = Usuario.objects.create_user(
            username="alumno3", password="password123", rol=Usuario.Roles.ESTUDIANTE, email="alumno3@example.com"
        )
        self.staff = Usuario.objects.create_user(
            username="agente2", password="password123", rol=Usuario.Roles.STAFF,
            area=self.area1, email="agente2@example.com", first_name="Lucia", last_name="Fernandez"
        )
        self.ticket = Ticket.objects.create(
            titulo="Ticket de prueba", descripcion="desc",
            creado_por=self.estudiante, area_responsable=self.area1, categoria=self.categoria,
            estado="ABIERTO", prioridad="MEDIA"
        )

    def test_staff_puede_responder_un_ticket(self):
        self.client.login(username="agente2", password="password123")
        url = reverse('ticket-responder', args=[self.ticket.id])
        response = self.client.post(url, {"mensaje": "Estamos revisando tu caso"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Respuesta.objects.count(), 1)
        respuesta = Respuesta.objects.first()
        self.assertEqual(respuesta.mensaje, "Estamos revisando tu caso")
        self.assertEqual(respuesta.autor, self.staff)
        self.assertEqual(respuesta.ticket, self.ticket)

    def test_responder_con_mensaje_vacio_falla(self):
        self.client.login(username="agente2", password="password123")
        url = reverse('ticket-responder', args=[self.ticket.id])
        response = self.client.post(url, {"mensaje": "   "})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Respuesta.objects.count(), 0)

    def test_staff_puede_cambiar_estado_del_ticket(self):
        self.client.login(username="agente2", password="password123")
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.patch(url, {"estado": "CERRADO"}, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.estado, "CERRADO")

    def test_staff_puede_derivar_el_ticket_a_otra_area(self):
        self.client.login(username="agente2", password="password123")
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.patch(url, {"area_responsable": self.area2.id}, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.area_responsable, self.area2)

    def test_estudiante_no_puede_cambiar_estado_de_su_propio_ticket(self):
        self.client.login(username="alumno3", password="password123")
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.patch(url, {"estado": "CERRADO"}, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.estado, "ABIERTO")

    def test_estudiante_no_puede_derivar_su_propio_ticket(self):
        self.client.login(username="alumno3", password="password123")
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.patch(url, {"area_responsable": self.area2.id}, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.area_responsable, self.area1)
