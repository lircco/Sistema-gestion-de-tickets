from unittest import mock

from django.test import TestCase

from api.models import Area, Categoria, RegistroEmail, Ticket, Usuario


class LoggingNotificacionesTests(TestCase):
    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte")
        self.categoria = Categoria.objects.create(nombre="General")

    def _crear_ticket(self, usuario):
        return Ticket.objects.create(
            titulo="t", descripcion="d", creado_por=usuario,
            area_responsable=self.area, categoria=self.categoria,
        )

    def test_error_de_smtp_se_registra_con_traceback(self):
        usuario = Usuario.objects.create_user(username="a", password="x", email="a@example.com")
        with mock.patch("api.signals.send_mail", side_effect=OSError("SMTP caído")):
            with self.assertLogs("api.signals", level="ERROR") as logs:
                self._crear_ticket(usuario)
        self.assertIn("a@example.com", logs.output[0])
        self.assertIn("SMTP caído", logs.output[0])
        self.assertFalse(RegistroEmail.objects.get().exitoso)

    def test_usuario_sin_email_genera_una_advertencia(self):
        usuario = Usuario.objects.create_user(username="sin_mail", password="x")
        with self.assertLogs("api.signals", level="WARNING") as logs:
            self._crear_ticket(usuario)
        self.assertIn("sin_mail", logs.output[0])
