from unittest import mock

from django.conf import settings
from django.core import mail
from django.test import TestCase, override_settings

from api.models import Area, Categoria, RegistroEmail, Ticket, Usuario


class EnvioDeNotificacionesTests(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username="a", password="x", email="a@example.com")
        self.area = Area.objects.create(nombre="Soporte")
        self.categoria = Categoria.objects.create(nombre="General")

    def _crear_ticket(self):
        return Ticket.objects.create(
            titulo="t", descripcion="d", creado_por=self.usuario,
            area_responsable=self.area, categoria=self.categoria,
        )

    @override_settings(EMAIL_ASYNC=False)
    def test_no_se_envia_nada_hasta_que_la_transaccion_confirma(self):
        with self.captureOnCommitCallbacks(execute=False) as callbacks:
            self._crear_ticket()
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(RegistroEmail.objects.count(), 0)

        for callback in callbacks:
            callback()
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(RegistroEmail.objects.get().exitoso)

    @override_settings(EMAIL_ASYNC=True)
    def test_con_email_async_el_envio_corre_en_otro_hilo(self):
        with mock.patch("api.emails.threading.Thread") as hilo:
            with self.captureOnCommitCallbacks(execute=True):
                self._crear_ticket()
        hilo.assert_called_once()
        hilo.return_value.start.assert_called_once()
        self.assertTrue(hilo.call_args.kwargs["daemon"])
        # El request no esperó al SMTP: todavía no hay envío ni registro
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(EMAIL_ASYNC=False)
    def test_el_cierre_se_notifica_una_sola_vez(self):
        with self.captureOnCommitCallbacks(execute=True):
            ticket = self._crear_ticket()
        for _ in range(2):
            with self.captureOnCommitCallbacks(execute=True):
                ticket.estado = Ticket.Estados.CERRADO
                ticket.save()
        asuntos = [m.subject for m in mail.outbox]
        self.assertEqual(asuntos.count(f"Tu ticket #{ticket.id} ha sido cerrado"), 1)

    def test_hay_timeout_para_el_smtp(self):
        self.assertGreater(settings.EMAIL_TIMEOUT, 0)
