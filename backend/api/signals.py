import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from .emails import enviar_notificacion
from .models import Ticket, RegistroEmail, Usuario

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Ticket)
def notificar_cambio_ticket(sender, instance, created, **kwargs):
    # Definimos las variables básicas del correo
    destinatario = instance.creado_por.email
    
    # Si el ticket es nuevo
    if created:
        asunto = f"Tu ticket #{instance.id} ha sido creado"
        cuerpo = f"Saludos {instance.creado_por.first_name},\n\nTu ticket '{instance.titulo}' ha sido registrado con éxito en el área de {instance.area_responsable.nombre}.\n\nEstado actual: {instance.get_estado_display()}."
    else:
        # Si el ticket se actualizó, notificamos sólo si está CERRADO y no lo habíamos notificado
        if instance.estado != 'CERRADO':
            return
            
        asunto_cerrado = f"Tu ticket #{instance.id} ha sido cerrado"
        if RegistroEmail.objects.filter(ticket=instance, asunto=asunto_cerrado, exitoso=True).exists():
            return
            
        asunto = asunto_cerrado
        cuerpo = f"Saludos {instance.creado_por.first_name},\n\nTu ticket #{instance.id} ('{instance.titulo}') ha cambiado a estado CERRADO.\n\nGracias por utilizar la plataforma."

    if not destinatario:
        logger.warning("El usuario %s no tiene email configurado.", instance.creado_por.username)

    # El envío (y su RegistroEmail) se hace fuera del request; ver api/emails.py
    enviar_notificacion(asunto, cuerpo, destinatario, instance.id)
