from django.db import models
from django.contrib.auth.models import AbstractUser

class Area(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    # Definición de los roles del sistema
    class Roles(models.TextChoices):
        ESTUDIANTE = 'ESTUDIANTE', 'Estudiante'
        STAFF = 'STAFF', 'Staff de Área'
        SUPERVISOR = 'SUPERVISOR', 'Supervisor'

    rol = models.CharField(max_length=20, choices=Roles.choices, default=Roles.ESTUDIANTE)
    # Solo los usuarios 'STAFF' pertenecerán obligatoriamente a un área
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name='personal')

    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"

class Ticket(models.Model):
    class Estados(models.TextChoices):
        ABIERTO = 'ABIERTO', 'Abierto'
        EN_PROGRESO = 'EN_PROGRESO', 'En Progreso'
        CERRADO = 'CERRADO', 'Cerrado'

    class Prioridades(models.TextChoices):
        BAJA = 'BAJA', 'Baja'
        MEDIA = 'MEDIA', 'Media'
        ALTA = 'ALTA', 'Alta'

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    
    # Archivos adjuntos (PDFs, imágenes, etc.)
    archivo_adjunto = models.FileField(upload_to='tickets/adjuntos/', null=True, blank=True)
    
    # Relaciones principales
    creado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='tickets_creados')
    area_responsable = models.ForeignKey(Area, on_delete=models.PROTECT, related_name='tickets_asignados')
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='tickets')
    
    estado = models.CharField(max_length=20, choices=Estados.choices, default=Estados.ABIERTO)
    prioridad = models.CharField(max_length=20, choices=Prioridades.choices, default=Prioridades.MEDIA)
    
    creado_el = models.DateTimeField(auto_now_add=True)
    actualizado_el = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.titulo} ({self.get_estado_display()})"

class Respuesta(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='respuestas')
    autor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='respuestas_dadas')
    mensaje = models.TextField()
    creado_el = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Respuesta de {self.autor.username} en Ticket #{self.ticket.id}"

class RegistroEmail(models.Model):
    # Guardamos el historial de los correos automáticos enviados
    ticket = models.ForeignKey(Ticket, on_delete=models.SET_NULL, null=True, blank=True, related_name='emails_enviados')
    destinatario = models.EmailField()
    asunto = models.CharField(max_length=255)
    cuerpo = models.TextField()
    enviado_el = models.DateTimeField(auto_now_add=True)
    exitoso = models.BooleanField(default=True)

    def __str__(self):
        return f"Email a {self.destinatario} - {self.asunto}"