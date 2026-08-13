from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import Usuario, Area, Categoria, Ticket

class Command(BaseCommand):
    help = 'Prepara la base de datos con datos semilla para los tests E2E de Playwright.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Borrando datos antiguos...")
        Ticket.objects.all().delete()
        Categoria.objects.all().delete()
        Area.objects.all().delete()
        Usuario.objects.exclude(is_superuser=True).delete()

        self.stdout.write("Creando Área y Categoría...")
        area = Area.objects.create(nombre="Soporte Técnico", descripcion="Área de soporte informático.")
        categoria = Categoria.objects.create(nombre="Falla de Software", descripcion="Errores en aplicaciones.")

        self.stdout.write("Creando usuarios E2E...")
        # 1. Alumno
        alumno = Usuario.objects.create_user(
            username="alumno_e2e",
            email="alumno_e2e@test.com",
            password="password123",
            first_name="Alumno",
            last_name="Test",
            rol=Usuario.Roles.ESTUDIANTE
        )
        
        # 2. Administrador
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

        self.stdout.write(self.style.SUCCESS("¡Base de datos sembrada correctamente para E2E!"))
