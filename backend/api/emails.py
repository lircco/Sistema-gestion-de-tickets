import logging
import threading

from django.conf import settings
from django.core.mail import send_mail
from django.db import connection, transaction

from .models import RegistroEmail

logger = logging.getLogger(__name__)


def _enviar_y_registrar(asunto, cuerpo, destinatario, ticket_id):
    exitoso = False
    if destinatario:
        try:
            send_mail(
                subject=asunto,
                message=cuerpo,
                from_email=None,  # Toma el DEFAULT_FROM_EMAIL de settings.py
                recipient_list=[destinatario],
                fail_silently=False,
            )
            exitoso = True
        except Exception:
            logger.exception("Error al enviar el correo '%s' a %s", asunto, destinatario)

    # Guardamos el historial en la base de datos pase lo que pase
    RegistroEmail.objects.create(
        ticket_id=ticket_id,
        destinatario=destinatario,
        asunto=asunto,
        cuerpo=cuerpo,
        exitoso=exitoso,
    )


def _enviar_en_segundo_plano(*args):
    try:
        _enviar_y_registrar(*args)
    finally:
        # Cada hilo abre su propia conexión a la base: hay que cerrarla al terminar.
        connection.close()


def enviar_notificacion(asunto, cuerpo, destinatario, ticket_id):
    """
    Envía el email cuando la transacción actual se confirma, para no mandar avisos
    de cambios que después se revierten. Con EMAIL_ASYNC el envío corre en un hilo
    aparte y no demora la respuesta del request.
    """
    args = (asunto, cuerpo, destinatario, ticket_id)

    def tarea():
        if settings.EMAIL_ASYNC:
            threading.Thread(target=_enviar_en_segundo_plano, args=args, daemon=True).start()
        else:
            _enviar_y_registrar(*args)

    transaction.on_commit(tarea)
