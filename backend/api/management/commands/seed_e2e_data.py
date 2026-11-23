from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import Usuario, Area, Categoria, Ticket, Articulo

class Command(BaseCommand):
    help = 'Prepara la base de datos con datos semilla para los tests E2E de Playwright.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Borrando datos antiguos...")
        Ticket.objects.all().delete()
        Categoria.objects.all().delete()
        Area.objects.all().delete()
        Usuario.objects.all().delete()

        self.stdout.write("Creando Área y Categoría...")
        area = Area.objects.create(nombre="Soporte Técnico", descripcion="Área de soporte informático.")
        categoria = Categoria.objects.create(nombre="Falla de Software", descripcion="Errores en aplicaciones.")

        self.stdout.write("Creando usuarios E2E y de prueba...")
        # 1. Alumnos
        alumno = Usuario.objects.create_user(
            username="alumno_e2e",
            email="alumno_e2e@test.com",
            password="password123",
            first_name="Alumno",
            last_name="Test",
            rol=Usuario.Roles.ESTUDIANTE
        )
        Usuario.objects.create_user(
            username="alumno",
            email="alumno@unraf.edu.ar",
            password="alumno123",
            first_name="Alumno",
            last_name="Estudiante",
            rol=Usuario.Roles.ESTUDIANTE
        )
        
        # 2. Staff
        admin = Usuario.objects.create_user(
            username="admin_e2e",
            email="admin_e2e@test.com",
            password="password123",
            first_name="Admin",
            last_name="Test",
            rol=Usuario.Roles.STAFF,
            area=area,
            is_staff=True
        )
        Usuario.objects.create_user(
            username="staff_it",
            email="staff_it@unraf.edu.ar",
            password="staff123",
            first_name="Staff",
            last_name="IT",
            rol=Usuario.Roles.STAFF,
            area=area,
            is_staff=True
        )

        # 3. Supervisor
        Usuario.objects.create_superuser(
            username="supervisor",
            email="supervisor@unraf.edu.ar",
            password="UnrafSup2026!",
            first_name="Supervisor",
            last_name="Admin",
            rol=Usuario.Roles.SUPERVISOR,
            area=area
        )

        self.stdout.write("Creando Ticket de Prueba inicial para el Admin...")
        Ticket.objects.create(
            titulo="Ticket de Prueba Global",
            descripcion="Este ticket es creado por el seeder para que el admin tenga algo que ver.",
            creado_por=alumno,
            area_responsable=area,
            categoria=categoria,
            estado=Ticket.Estados.ABIERTO,
            prioridad=Ticket.Prioridades.MEDIA
        )

        self.stdout.write("Creando Artículos de Base de Conocimiento...")
        articulos_datos = [
            {
                "titulo": "Acceso al SIU Guaraní",
                "categoria": "Sistemas",
                "visitas": 1240,
                "resumen": "Guía paso a paso para acceder por primera vez o recuperar el acceso al portal de autogestión SIU Guaraní.",
                "contenido": "Accedé a guarani.unraf.edu.ar con tu DNI para gestionar materias y exámenes."
            },
            {
                "titulo": "Restablecer contraseña institucional",
                "categoria": "Cuentas",
                "visitas": 980,
                "resumen": "Instrucciones para recuperar tu acceso a la cuenta institucional UNRaf, correo y servicios vinculados.",
                "contenido": "Utilizá la opción de recuperación para recibir un código de restablecimiento."
            },
            {
                "titulo": "Solicitar certificado de alumno regular",
                "categoria": "Trámites",
                "visitas": 745,
                "resumen": "Cómo emitir y validar de manera 100% online tu constancia de alumno regular con validez oficial.",
                "contenido": "Descargá tu certificado digital con firma verificable desde SIU Guaraní."
            },
            {
                "titulo": "Conectarse a Wi-Fi UNRaf",
                "categoria": "Infraestructura",
                "visitas": 610,
                "resumen": "Guía de configuración para conectarte a las redes inalámbricas universitarias desde laptops y celulares.",
                "contenido": "Conectate a la red UNRaf_Alumnos utilizando seguridad WPA2-Enterprise."
            },
            {
                "titulo": "Uso de Aulas Virtuales y Campus Moodle",
                "categoria": "Sistemas",
                "visitas": 520,
                "resumen": "Información para acceder al campus virtual, matricularse en materias y entregar actividades.",
                "contenido": "Ingresá a campus.unraf.edu.ar con tus credenciales institucionales unificadas."
            },
            {
                "titulo": "Protocolo de Mantenimiento y Reserva de Equipos",
                "categoria": "Infraestructura",
                "visitas": 340,
                "resumen": "Procedimiento para solicitar proyectores, netbooks o salas multimedia para actividades académicas.",
                "contenido": "Las reservas deben solicitarse con al menos 24 horas de antelación a través de UnrafTickets."
            }
        ]
        for art in articulos_datos:
            Articulo.objects.get_or_create(titulo=art["titulo"], defaults=art)

        self.stdout.write(self.style.SUCCESS("¡Base de datos sembrada correctamente para E2E!"))
