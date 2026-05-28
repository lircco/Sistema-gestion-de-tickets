from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import Ticket, RegistroEmail

@receiver(post_save, sender=Ticket)
def notificar_cambio_ticket(sender, instance, created, **kwargs):
    # Definimos las variables básicas del correo
    destinatario = instance.creado_por.email
    
    # Si el ticket es nuevo
    if created:
        asunto = f"Tu ticket #{instance.id} ha sido creado"
        cuerpo = f"Saludos {instance.creado_por.first_name},\n\nTu ticket '{instance.titulo}' ha sido registrado con éxito en el área de {instance.area_responsable.nombre}.\n\nEstado actual: {instance.get_estado_display()}."
    else:
        # Si el ticket se actualizó, notificamos el estado actual
        asunto = f"Actualización del ticket #{instance.id}"
        cuerpo = f"Saludos {instance.creado_por.first_name},\n\nTu ticket #{instance.id} ('{instance.titulo}') ha cambiado de estado.\n\nNuevo Estado: {instance.get_estado_display()}."

    # Intentamos enviar el correo real
    exitoso = False
    try:
        send_mail(
            subject=asunto,
            message=cuerpo,
            from_email=None, # Toma el DEFAULT_FROM_EMAIL de settings.py
            recipient_list=[destinatario],
            fail_silently=False, # Ponlo en False para capturar errores si el SMTP falla
        )
        exitoso = True
    except Exception as e:
        # Aquí podrías usar un logger para registrar el error exacto en producción
        print(f"Error al enviar el correo: {e}")
        exitoso = False

    # Guardamos el historial en la base de datos pase lo que pase
    RegistroEmail.objects.create(
        ticket=instance,
        destinatario=destinatario,
        asunto=asunto,
        cuerpo=cuerpo,
        exitoso=exitoso
    )