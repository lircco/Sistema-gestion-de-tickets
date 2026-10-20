# --- REEMPLAZ TUS IMPORTS DE ARRIBA POR ESTOS ---



from rest_framework import viewsets, mixins, filters, permissions, status



from rest_framework.pagination import PageNumberPagination



from rest_framework.response import Response



from rest_framework.decorators import action



from rest_framework.views import APIView  # <-- SPER IMPORTANTE PARA TU NUEVA CLASE



from django.contrib.auth import authenticate, login, logout



from django.contrib.auth.password_validation import validate_password



from django.core.exceptions import ValidationError as DjangoValidationError



from django.db.models import Count



from django.db import models



from django.core.mail import send_mail



from django.conf import settings

import os

from django.http import FileResponse, Http404







from django.contrib.auth.tokens import default_token_generator







from .models import Ticket, Usuario, Area, Categoria, Respuesta, Notificacion

from .serializers import (
    TicketSerializer, RegistroSerializer, AreaSerializer, CategoriaSerializer,
    UsuarioSerializer, RespuestaSerializer, NotificacionSerializer
)

from .permissions import PuedeGestionarTicket

def obtener_personal_area(area, excluir_usuario=None):
    if not area:
        return Usuario.objects.none()
    qs = Usuario.objects.filter(
        models.Q(rol=Usuario.Roles.STAFF, area=area) |
        models.Q(rol=Usuario.Roles.SUPERVISOR, area=area)
    )
    if excluir_usuario:
        qs = qs.exclude(pk=excluir_usuario.pk)
    return qs








class RegistroUsuarioViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    # Solo alta de cuentas: listar, editar o borrar usuarios no es público.



    queryset = Usuario.objects.all()



    serializer_class = RegistroSerializer



    permission_classes = [permissions.AllowAny]







    def perform_create(self, serializer):



        user = serializer.save()



        if user.email:



            try:



                send_mail(



                    subject='Bienvenido al Sistema de Tickets de la UnRaf!',



                    message=f'Hola {user.first_name},\n\nTu cuenta ha sido creada exitosamente. Bienvenido a nuestra plataforma de soporte!\n\nSaludos,\nEl soporte técnico de UnRaf.',



                    from_email=settings.DEFAULT_FROM_EMAIL,



                    recipient_list=[user.email],



                    fail_silently=True,



                )



            except Exception:



                pass











class StandardResultsSetPagination(PageNumberPagination):



    page_size = 10



    page_size_query_param = 'page_size'



    max_page_size = 100











class TicketViewSet(viewsets.ModelViewSet):



    serializer_class = TicketSerializer



    pagination_class = StandardResultsSetPagination



    permission_classes = [permissions.IsAuthenticated, PuedeGestionarTicket]



    filter_backends = [filters.SearchFilter]



    search_fields = ['titulo', 'descripcion', 'estado']







    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q

        # Superusers can see all tickets
        if user.is_superuser:
            return Ticket.objects.all().order_by('-creado_el')

        if hasattr(user, 'rol') and user.rol in ['STAFF', 'SUPERVISOR'] or user.is_staff:
            area_id = getattr(user, 'area_id', None)
            if area_id:
                # Staff/Supervisor only sees tickets from their area, plus any they created themselves
                return Ticket.objects.filter(Q(area_responsable_id=area_id) | Q(creado_por=user)).order_by('-creado_el')
            else:
                # If they have no area assigned yet, maybe they shouldn't see other areas' tickets.
                return Ticket.objects.filter(creado_por=user).order_by('-creado_el')

        return Ticket.objects.filter(creado_por=user).order_by('-creado_el')







    def perform_create(self, serializer):
        ticket = serializer.save(creado_por=self.request.user)
        # Notificación In-App para el Estudiante/Creador
        Notificacion.objects.create(
            usuario=self.request.user,
            ticket=ticket,
            mensaje="Tu ticket ha sido generado exitosamente"
        )
        # Notificación In-App para Staff del área asignada
        personal = obtener_personal_area(ticket.area_responsable, excluir_usuario=self.request.user)
        notifs = [
            Notificacion(
                usuario=staff,
                ticket=ticket,
                mensaje=f"Nuevo ticket #{ticket.id} asignado a tu área: {ticket.titulo}"
            )
            for staff in personal
        ]
        if notifs:
            Notificacion.objects.bulk_create(notifs)

    def perform_update(self, serializer):
        instancia_previa = Ticket.objects.get(pk=serializer.instance.pk)
        area_previa = instancia_previa.area_responsable
        prioridad_previa = instancia_previa.prioridad
        estado_previo = instancia_previa.estado

        ticket_actualizado = serializer.save()
        usuario_actual = self.request.user

        # 1. Cambio de Prioridad
        if ticket_actualizado.prioridad != prioridad_previa:
            personal = obtener_personal_area(ticket_actualizado.area_responsable, excluir_usuario=usuario_actual)
            notifs = [
                Notificacion(
                    usuario=staff,
                    ticket=ticket_actualizado,
                    mensaje=f"El ticket #{ticket_actualizado.id} cambió de prioridad a {ticket_actualizado.get_prioridad_display()}"
                )
                for staff in personal
            ]
            if notifs:
                Notificacion.objects.bulk_create(notifs)

        # 2. Ticket Derivado
        if ticket_actualizado.area_responsable_id != area_previa.id:
            personal_receptor = obtener_personal_area(ticket_actualizado.area_responsable, excluir_usuario=usuario_actual)
            notifs_receptores = [
                Notificacion(
                    usuario=staff,
                    ticket=ticket_actualizado,
                    mensaje=f"El ticket #{ticket_actualizado.id} ha sido derivado a tu área"
                )
                for staff in personal_receptor
            ]
            if notifs_receptores:
                Notificacion.objects.bulk_create(notifs_receptores)

            Notificacion.objects.create(
                usuario=usuario_actual,
                ticket=ticket_actualizado,
                mensaje=f"Tu ticket #{ticket_actualizado.id} ha sido derivado exitosamente al área {ticket_actualizado.area_responsable.nombre}"
            )

        # 3. Ticket Cerrado
        if ticket_actualizado.estado == 'CERRADO' and estado_previo != 'CERRADO':
            if ticket_actualizado.creado_por != usuario_actual:
                Notificacion.objects.create(
                    usuario=ticket_actualizado.creado_por,
                    ticket=ticket_actualizado,
                    mensaje=f"Tu ticket #{ticket_actualizado.id} ha sido cerrado"
                )

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        # Mismo alcance que el listado: propios, del área o todos según el rol.
        stats = self.get_queryset().aggregate(
            total=Count('id'),
            abiertos=Count('id', filter=models.Q(estado='ABIERTO')),
            en_progreso=Count('id', filter=models.Q(estado='EN_PROGRESO')),
            cerrados=Count('id', filter=models.Q(estado='CERRADO'))
        )
        return Response(stats)

    @action(detail=True, methods=['post'])
    def responder(self, request, pk=None):
        ticket = self.get_object()
        mensaje = (request.data.get('mensaje') or '').strip()

        if not mensaje:
            return Response({'error': 'El mensaje no puede estar vacío.'}, status=status.HTTP_400_BAD_REQUEST)

        respuesta = Respuesta.objects.create(ticket=ticket, autor=request.user, mensaje=mensaje)

        # Notificaciones por nuevo mensaje
        if request.user.rol == Usuario.Roles.ESTUDIANTE:
            apellido = request.user.last_name or request.user.first_name or request.user.username
            cat_nombre = ticket.categoria.nombre if ticket.categoria else ""
            mensaje_notif = f"Alumno {apellido} te ha enviado un mensaje con respecto al ticket #{ticket.id}, {cat_nombre}"
            personal = obtener_personal_area(ticket.area_responsable, excluir_usuario=request.user)
            notifs = [
                Notificacion(usuario=staff, ticket=ticket, mensaje=mensaje_notif)
                for staff in personal
            ]
            if notifs:
                Notificacion.objects.bulk_create(notifs)
        elif request.user.rol in [Usuario.Roles.STAFF, Usuario.Roles.SUPERVISOR]:
            if ticket.creado_por != request.user:
                Notificacion.objects.create(
                    usuario=ticket.creado_por,
                    ticket=ticket,
                    mensaje=f"Nuevo mensaje del staff con respecto al ticket #{ticket.id}"
                )

        return Response(RespuestaSerializer(respuesta).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def adjunto(self, request, pk=None):
        # Sirve el adjunto solo a quien puede ver el ticket (get_object aplica get_queryset).
        ticket = self.get_object()
        if not ticket.archivo_adjunto:
            raise Http404('El ticket no tiene adjunto.')
        nombre = os.path.basename(ticket.archivo_adjunto.name)
        return FileResponse(ticket.archivo_adjunto.open('rb'), filename=nombre)











class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]











class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):



    queryset = Categoria.objects.all()



    serializer_class = CategoriaSerializer



    permission_classes = [permissions.IsAuthenticated]


class NotificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notificacion.objects.filter(usuario=self.request.user).order_by('-creada_el')

    @action(detail=False, methods=['post'], url_path='marcar-todas-leidas')
    def marcar_todas_leidas(self, request):
        Notificacion.objects.filter(usuario=request.user, leida=False).update(leida=True)
        return Response({'message': 'Todas las notificaciones han sido marcadas como leídas.'}, status=status.HTTP_200_OK)












class UsuarioActualView(APIView):



    permission_classes = [permissions.IsAuthenticated]







    def get(self, request):



        usuario = request.user



        data = {



            'id': usuario.id,



            'username': usuario.username,



            'email': usuario.email,



            'first_name': usuario.first_name,



            'rol': usuario.rol if hasattr(usuario, 'rol') else 'ESTUDIANTE',



            'is_staff': usuario.is_staff,



            'area': usuario.area_id if hasattr(usuario, 'area_id') else None



        }



        return Response(data)



    def patch(self, request):
        usuario = request.user
        if 'area' not in request.data:
            return Response({'message': 'Perfil actualizado'})

        # El área define qué tickets ve un STAFF: solo puede elegirla la primera vez.
        # Reasignarla queda en manos de un supervisor (panel de administración).
        if usuario.rol != Usuario.Roles.STAFF:
            return Response({'error': 'Solo el personal de Staff tiene un área asignada.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            area = Area.objects.get(pk=request.data.get('area'))
        except (Area.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'El área seleccionada no existe.'}, status=status.HTTP_400_BAD_REQUEST)

        if usuario.area_id is not None and usuario.area_id != area.id:
            return Response({'error': 'Tu área ya está asignada. Para cambiarla, pedíselo a un supervisor.'}, status=status.HTTP_403_FORBIDDEN)

        usuario.area = area
        usuario.save(update_fields=['area'])
        return Response({'message': 'Perfil actualizado', 'area': area.id})











class LoginView(APIView):



    permission_classes = [permissions.AllowAny]







    def post(self, request):
        # CustomAuthBackend resuelve tanto el username como "Nombre Apellido".
        user = authenticate(request, username=request.data.get('username'), password=request.data.get('password'))
        if user:
            login(request, user)
            return Response(UsuarioSerializer(user).data)
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)











class LogoutView(APIView):



    permission_classes = [permissions.AllowAny]







    def post(self, request):



        logout(request)



        return Response({'message': 'Sesión cerrada correctamente'})











# --- VISTA DE RECUPERACION DE CONTRASEA ---



class RecuperarPasswordView(APIView):
    """
    Envía por mail un código de un solo uso para restablecer la contraseña.
    No modifica la contraseña actual: eso recién pasa en RestablecerPasswordView,
    con el código. El código vence a los PASSWORD_RESET_TIMEOUT segundos y deja de
    servir apenas la contraseña cambia.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Por favor, ingrese un correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)

        minutos_validez = settings.PASSWORD_RESET_TIMEOUT // 60
        email_desde = f'Sistema de Tickets Universidad <{settings.EMAIL_HOST_USER}>'
        for usuario in Usuario.objects.filter(email=email, is_active=True):
            codigo = default_token_generator.make_token(usuario)
            mensaje = (
                f'Hola {usuario.first_name or usuario.username},\n\n'
                f'Recibimos un pedido para restablecer tu contraseña en UnrafTickets.\n\n'
                f'Tu código de recuperación es:\n\n{codigo}\n\n'
                f'Copialo en la pantalla de recuperación junto con tu nueva contraseña. '
                f'El código vence en {minutos_validez} minutos y sirve una sola vez.\n\n'
                f'Si no pediste este cambio, ignorá este mensaje: tu contraseña actual sigue funcionando.\n\n'
                f'Saludos,\nSoporte Técnico Institucional.'
            )
            try:
                send_mail('Código para restablecer tu contraseña - UnRafTickets', mensaje, email_desde, [email], fail_silently=False)
            except Exception:
                pass

        # Para evitar enumeración de usuarios, la respuesta es la misma exista o no el email.
        return Response({'message': 'Si el correo electrónico está registrado, recibirás las instrucciones para restablecer tu contraseña.'}, status=status.HTTP_200_OK)


# --- VISTA DE CAMBIO DE CONTRASEA (desde el perfil, usuario ya logueado) ---



class CambiarPasswordView(APIView):



    permission_classes = [permissions.IsAuthenticated]







    def post(self, request):



        password_actual = request.data.get('password_actual')



        password_nueva = request.data.get('password_nueva')



        usuario = request.user







        if not password_actual or not password_nueva:



            return Response({'error': 'Debe ingresar la contrasea actual y la nueva.'}, status=status.HTTP_400_BAD_REQUEST)







        if not usuario.check_password(password_actual):



            return Response({'error': 'La contrasea actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)







        try:



            validate_password(password_nueva, user=usuario)



        except DjangoValidationError as e:



            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)







        usuario.set_password(password_nueva)



        usuario.save()







        if usuario.email:



            try:



                send_mail(



                    subject='Actualizacin de contrasea',



                    message=f'Hola {usuario.first_name},\n\nTe informamos que tu contrasea ha sido actualizada correctamente.\n\nSaludos,\nEl soporte tcnico de UnRaf.',



                    from_email=settings.DEFAULT_FROM_EMAIL,



                    recipient_list=[usuario.email],



                    fail_silently=True,



                )



            except Exception:



                pass







        return Response({'message': 'Contrasea actualizada correctamente.'}, status=status.HTTP_200_OK)













class RestablecerPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        nueva_password = request.data.get('nueva_password')

        if not all([email, codigo, nueva_password]):
            return Response({'error': 'Faltan datos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        # Misma respuesta si el email no existe o si el código no coincide, para no
        # revelar qué emails están registrados. El email no es único: se prueban todas.
        usuario = next(
            (u for u in Usuario.objects.filter(email=email, is_active=True) if default_token_generator.check_token(u, codigo)),
            None,
        )
        if usuario is None:
            return Response({'error': 'El email o el código ingresado no son válidos, o el código venció.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(nueva_password, user=usuario)
        except DjangoValidationError as e:
            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(nueva_password)
        usuario.save()
        return Response({'mensaje': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)
