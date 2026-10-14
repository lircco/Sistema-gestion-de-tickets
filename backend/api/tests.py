from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Area, Categoria, Usuario, Ticket, Respuesta, Notificacion

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


class RecuperarPasswordTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(
            username="alumno_recuperar",
            password="PasswordOriginal123",
            rol=Usuario.Roles.ESTUDIANTE,
            email="alumno_recuperar@example.com"
        )
        self.url = reverse('recuperar_password')

    def test_recuperar_password_usuario_existente(self):
        response = self.client.post(self.url, {"email": "alumno_recuperar@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        # La contraseña cambió y no es la contraseña fija insegura
        self.assertFalse(self.user.check_password("PasswordOriginal123"))
        self.assertFalse(self.user.check_password("Unraf2026"))

    def test_recuperar_password_usuario_inexistente_retorna_200(self):
        # Evitar enumeración de usuarios
        response = self.client.post(self.url, {"email": "inexistente@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_recuperar_password_sin_email(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class NotificacionesTests(APITestCase):
    def setUp(self):
        self.area1 = Area.objects.create(nombre="Soporte IT")
        self.area2 = Area.objects.create(nombre="Redes")
        self.categoria = Categoria.objects.create(nombre="Equipos")

        self.estudiante = Usuario.objects.create_user(
            username="alumno_notif",
            password="password123",
            first_name="Juan",
            last_name="Perez",
            rol=Usuario.Roles.ESTUDIANTE,
            email="alumno_notif@example.com"
        )
        self.staff1 = Usuario.objects.create_user(
            username="staff_it1",
            password="password123",
            first_name="Carlos",
            last_name="Gomez",
            rol=Usuario.Roles.STAFF,
            area=self.area1,
            email="staff1@example.com"
        )
        self.staff2 = Usuario.objects.create_user(
            username="staff_it2",
            password="password123",
            first_name="Lucia",
            last_name="Mendez",
            rol=Usuario.Roles.STAFF,
            area=self.area1,
            email="staff2@example.com"
        )
        self.staff_redes = Usuario.objects.create_user(
            username="staff_redes",
            password="password123",
            first_name="Marcos",
            last_name="Torres",
            rol=Usuario.Roles.STAFF,
            area=self.area2,
            email="staff_redes@example.com"
        )

    def test_creacion_ticket_notifica_estudiante_y_staff_area(self):
        self.client.login(username="alumno_notif", password="password123")
        url = reverse('ticket-list')
        data = {
            "titulo": "Monitor roto",
            "descripcion": "El monitor parpadea",
            "area_responsable": self.area1.id,
            "categoria": self.categoria.id,
            "prioridad": "MEDIA"
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        ticket_id = res.data['id']

        # Notificación al estudiante
        notif_estudiante = Notificacion.objects.filter(usuario=self.estudiante)
        self.assertEqual(notif_estudiante.count(), 1)
        self.assertEqual(notif_estudiante.first().mensaje, "Tu ticket ha sido generado exitosamente")
        self.assertEqual(notif_estudiante.first().ticket_id, ticket_id)

        # Notificación al staff de area1
        notif_staff1 = Notificacion.objects.filter(usuario=self.staff1)
        self.assertEqual(notif_staff1.count(), 1)
        self.assertIn(f"Nuevo ticket #{ticket_id} asignado a tu área", notif_staff1.first().mensaje)

        notif_staff2 = Notificacion.objects.filter(usuario=self.staff2)
        self.assertEqual(notif_staff2.count(), 1)

        # Staff de otra área no debe tener notificación
        notif_redes = Notificacion.objects.filter(usuario=self.staff_redes)
        self.assertEqual(notif_redes.count(), 0)

    def test_nuevo_mensaje_estudiante_notifica_staff_formato_estricto(self):
        ticket = Ticket.objects.create(
            titulo="Consulta",
            descripcion="Dudas",
            creado_por=self.estudiante,
            area_responsable=self.area1,
            categoria=self.categoria
        )
        self.client.login(username="alumno_notif", password="password123")
        url = reverse('ticket-responder', args=[ticket.id])
        res = self.client.post(url, {"mensaje": "Hola tengo una duda"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        notif = Notificacion.objects.filter(usuario=self.staff1).first()
        self.assertIsNotNone(notif)
        expected = f"Alumno Perez te ha enviado un mensaje con respecto al ticket #{ticket.id}, Equipos"
        self.assertEqual(notif.mensaje, expected)

    def test_nuevo_mensaje_staff_notifica_estudiante(self):
        ticket = Ticket.objects.create(
            titulo="Consulta",
            descripcion="Dudas",
            creado_por=self.estudiante,
            area_responsable=self.area1,
            categoria=self.categoria
        )
        self.client.login(username="staff_it1", password="password123")
        url = reverse('ticket-responder', args=[ticket.id])
        res = self.client.post(url, {"mensaje": "Hola Juan, ya lo revisamos"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        notif = Notificacion.objects.filter(usuario=self.estudiante).first()
        self.assertIsNotNone(notif)
        self.assertIn(f"ticket #{ticket.id}", notif.mensaje)

    def test_cambio_prioridad_notifica_staff_excluyendo_autor(self):
        ticket = Ticket.objects.create(
            titulo="PC lenta",
            descripcion="Demora mucho",
            creado_por=self.estudiante,
            area_responsable=self.area1,
            categoria=self.categoria,
            prioridad="BAJA"
        )
        # Staff 1 cambia prioridad a ALTA
        self.client.login(username="staff_it1", password="password123")
        url = reverse('ticket-detail', args=[ticket.id])
        res = self.client.patch(url, {"prioridad": "ALTA"}, content_type="application/json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Staff 1 (autor) no debe notificarse a sí mismo
        self.assertFalse(Notificacion.objects.filter(usuario=self.staff1).exists())

        # Staff 2 debe notificarse
        notif_staff2 = Notificacion.objects.filter(usuario=self.staff2).first()
        self.assertIsNotNone(notif_staff2)
        self.assertIn(f"El ticket #{ticket.id} cambió de prioridad a Alta", notif_staff2.mensaje)

    def test_ticket_derivado_notifica_receptor_y_emisor(self):
        ticket = Ticket.objects.create(
            titulo="Cable cortado",
            descripcion="En el rack",
            creado_por=self.estudiante,
            area_responsable=self.area1,
            categoria=self.categoria
        )
        # Staff 1 deriva a area2 (Redes)
        self.client.login(username="staff_it1", password="password123")
        url = reverse('ticket-detail', args=[ticket.id])
        res = self.client.patch(url, {"area_responsable": self.area2.id}, content_type="application/json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Emisor recibe confirmación
        notif_emisor = Notificacion.objects.filter(usuario=self.staff1).first()
        self.assertIsNotNone(notif_emisor)
        self.assertIn("ha sido derivado exitosamente al área Redes", notif_emisor.mensaje)

        # Receptor recibe aviso
        notif_receptor = Notificacion.objects.filter(usuario=self.staff_redes).first()
        self.assertIsNotNone(notif_receptor)
        self.assertIn(f"El ticket #{ticket.id} ha sido derivado a tu área", notif_receptor.mensaje)

    def test_ticket_cerrado_notifica_estudiante(self):
        ticket = Ticket.objects.create(
            titulo="Problema resuelto",
            descripcion="Ya funciona",
            creado_por=self.estudiante,
            area_responsable=self.area1,
            categoria=self.categoria,
            estado="ABIERTO"
        )
        # Staff 1 cierra el ticket
        self.client.login(username="staff_it1", password="password123")
        url = reverse('ticket-detail', args=[ticket.id])
        res = self.client.patch(url, {"estado": "CERRADO"}, content_type="application/json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        notif = Notificacion.objects.filter(usuario=self.estudiante).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.mensaje, f"Tu ticket #{ticket.id} ha sido cerrado")

    def test_endpoints_notificaciones(self):
        notif1 = Notificacion.objects.create(usuario=self.estudiante, mensaje="Mensaje 1", leida=False)
        notif2 = Notificacion.objects.create(usuario=self.estudiante, mensaje="Mensaje 2", leida=False)
        notif_otro = Notificacion.objects.create(usuario=self.staff1, mensaje="Mensaje ajeno", leida=False)

        self.client.login(username="alumno_notif", password="password123")
        url_list = reverse('notificacion-list')

        # Listar: solo ve las suyas
        res = self.client.get(url_list)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data if isinstance(res.data, list) else res.data.get('results', [])
        self.assertEqual(len(items), 2)

        # Marcar individual como leída
        url_detail = reverse('notificacion-detail', args=[notif1.id])
        res_patch = self.client.patch(url_detail, {"leida": True}, content_type="application/json")
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        notif1.refresh_from_db()
        self.assertTrue(notif1.leida)

        # Marcar todas como leídas
        url_todas = reverse('notificacion-marcar-todas-leidas')
        res_todas = self.client.post(url_todas)
        self.assertEqual(res_todas.status_code, status.HTTP_200_OK)
        notif2.refresh_from_db()
        self.assertTrue(notif2.leida)


