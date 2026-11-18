from django.core.management.base import BaseCommand
from api.models import Usuario, Area, Categoria, Ticket, Respuesta, Notificacion

class Command(BaseCommand):
    help = 'Crea usuarios, áreas, tickets y notificaciones de prueba para verificar el Issue #96.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Configurando datos de prueba para notificaciones in-app...")

        # 1. Áreas
        area_it, _ = Area.objects.get_or_create(
            nombre="Soporte Técnico",
            defaults={"descripcion": "Área de soporte técnico de hardware y software."}
        )
        area_redes, _ = Area.objects.get_or_create(
            nombre="Redes y Conectividad",
            defaults={"descripcion": "Área de redes, switches y cableado."}
        )
        area_alumnos, _ = Area.objects.get_or_create(
            nombre="Alumnado y Bedelía",
            defaults={"descripcion": "Trámites y certificados para alumnos."}
        )

        # 2. Categorías
        cat_hard, _ = Categoria.objects.get_or_create(nombre="Hardware", defaults={"descripcion": "Problemas físicos de hardware."})
        cat_soft, _ = Categoria.objects.get_or_create(nombre="Software", defaults={"descripcion": "Programas y sistemas operativos."})
        cat_red, _ = Categoria.objects.get_or_create(nombre="Redes", defaults={"descripcion": "WiFi y conectividad."})

        # 3. Usuarios
        # Supervisor
        admin, _ = Usuario.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@unraf.edu.ar",
                "first_name": "Admin",
                "last_name": "Supervisor",
                "rol": Usuario.Roles.SUPERVISOR,
                "area": area_it,
                "is_staff": True,
                "is_superuser": True,
            }
        )
        admin.set_password("admin123")
        admin.rol = Usuario.Roles.SUPERVISOR
        admin.area = area_it
        admin.save()

        # Staff Soporte IT
        staff_it, _ = Usuario.objects.get_or_create(
            username="staff_it",
            defaults={
                "email": "carlos.gomez@unraf.edu.ar",
                "first_name": "Carlos",
                "last_name": "Gómez",
                "rol": Usuario.Roles.STAFF,
                "area": area_it,
            }
        )
        staff_it.set_password("staff123")
        staff_it.rol = Usuario.Roles.STAFF
        staff_it.area = area_it
        staff_it.save()

        # Staff Redes
        staff_redes, _ = Usuario.objects.get_or_create(
            username="staff_redes",
            defaults={
                "email": "marcos.torres@unraf.edu.ar",
                "first_name": "Marcos",
                "last_name": "Torres",
                "rol": Usuario.Roles.STAFF,
                "area": area_redes,
            }
        )
        staff_redes.set_password("staff123")
        staff_redes.rol = Usuario.Roles.STAFF
        staff_redes.area = area_redes
        staff_redes.save()

        # Alumno 1
        alumno, _ = Usuario.objects.get_or_create(
            username="alumno",
            defaults={
                "email": "juan.perez@alumnos.unraf.edu.ar",
                "first_name": "Juan",
                "last_name": "Pérez",
                "rol": Usuario.Roles.ESTUDIANTE,
            }
        )
        alumno.set_password("alumno123")
        alumno.rol = Usuario.Roles.ESTUDIANTE
        alumno.save()

        # Alumno 2
        alumno2, _ = Usuario.objects.get_or_create(
            username="alumno2",
            defaults={
                "email": "maria.lopez@alumnos.unraf.edu.ar",
                "first_name": "María",
                "last_name": "López",
                "rol": Usuario.Roles.ESTUDIANTE,
            }
        )
        alumno2.set_password("alumno123")
        alumno2.rol = Usuario.Roles.ESTUDIANTE
        alumno2.save()

        # Limpiar notificaciones y tickets previos de prueba para empezar limpios
        Notificacion.objects.filter(usuario__in=[admin, staff_it, staff_redes, alumno, alumno2]).delete()
        Ticket.objects.filter(creado_por__in=[alumno, alumno2]).delete()

        # 4. Escenario 1: Creación de Ticket 1 + Respuestas cruzadas
        t1 = Ticket.objects.create(
            titulo="El monitor del laboratorio 2 parpadea",
            descripcion="Cuando enciendo la PC 5, el monitor titila y se apaga.",
            creado_por=alumno,
            area_responsable=area_it,
            categoria=cat_hard,
            prioridad=Ticket.Prioridades.MEDIA,
            estado=Ticket.Estados.ABIERTO
        )
        # Notificación automática para alumno
        Notificacion.objects.create(
            usuario=alumno,
            ticket=t1,
            mensaje="Tu ticket ha sido generado exitosamente"
        )
        # Notificación para staff_it y admin
        Notificacion.objects.create(
            usuario=staff_it,
            ticket=t1,
            mensaje=f"Nuevo ticket #{t1.id} asignado a tu área: {t1.titulo}"
        )
        Notificacion.objects.create(
            usuario=admin,
            ticket=t1,
            mensaje=f"Nuevo ticket #{t1.id} asignado a tu área: {t1.titulo}"
        )

        # Mensaje del estudiante
        r1 = Respuesta.objects.create(ticket=t1, autor=alumno, mensaje="Añado que probé cambiar el cable VGA y sigue igual.")
        Notificacion.objects.create(
            usuario=staff_it,
            ticket=t1,
            mensaje=f"Alumno Pérez te ha enviado un mensaje con respecto al ticket #{t1.id}, Hardware"
        )

        # Mensaje de respuesta del staff
        r2 = Respuesta.objects.create(ticket=t1, autor=staff_it, mensaje="Hola Juan, ya asignamos a un técnico para que revise la placa de video.")
        Notificacion.objects.create(
            usuario=alumno,
            ticket=t1,
            mensaje=f"Nuevo mensaje del staff con respecto al ticket #{t1.id}"
        )

        # 5. Escenario 2: Ticket Derivado a Redes
        t2 = Ticket.objects.create(
            titulo="No hay señal de WiFi en el aula Magna",
            descripcion="La red UNRaf-Alumnos no aparece disponible en los teléfonos.",
            creado_por=alumno2,
            area_responsable=area_redes,
            categoria=cat_red,
            prioridad=Ticket.Prioridades.ALTA,
            estado=Ticket.Estados.EN_PROGRESO
        )
        Notificacion.objects.create(
            usuario=alumno2,
            ticket=t2,
            mensaje="Tu ticket ha sido generado exitosamente"
        )
        # Notificación receptor a staff_redes
        Notificacion.objects.create(
            usuario=staff_redes,
            ticket=t2,
            mensaje=f"El ticket #{t2.id} ha sido derivado a tu área"
        )
        # Notificación emisor a staff_it
        Notificacion.objects.create(
            usuario=staff_it,
            ticket=t2,
            mensaje=f"Tu ticket #{t2.id} ha sido derivado exitosamente al área Redes y Conectividad"
        )

        # 6. Escenario 3: Ticket Cerrado
        t3 = Ticket.objects.create(
            titulo="Solicitud de cambio de teclado en box 3",
            descripcion="El teclado tenía rota la barra espaciadora.",
            creado_por=alumno,
            area_responsable=area_it,
            categoria=cat_hard,
            prioridad=Ticket.Prioridades.BAJA,
            estado=Ticket.Estados.CERRADO
        )
        Notificacion.objects.create(
            usuario=alumno,
            ticket=t3,
            mensaje=f"Tu ticket #{t3.id} ha sido cerrado"
        )

        self.stdout.write(self.style.SUCCESS("✓ Datos de prueba y notificaciones in-app generados exitosamente."))
        self.stdout.write(self.style.SUCCESS("Usuarios creados:"))
        self.stdout.write("  - Alumno: alumno / alumno123")
        self.stdout.write("  - Alumno 2: alumno2 / alumno123")
        self.stdout.write("  - Staff Soporte IT: staff_it / staff123")
        self.stdout.write("  - Staff Redes: staff_redes / staff123")
        self.stdout.write("  - Supervisor Admin: admin / admin123")
